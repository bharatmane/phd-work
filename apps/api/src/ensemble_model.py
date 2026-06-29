"""ECRVR-MVEL: GCN + DBN + Bi-TCN weighted-voting ensemble (Paper 2, Section 6.2).

Shared input: a per-token CodeBERT embedding sequence (T x 768) for the snippet,
plus optional snippet-level structural features (length, complexity, etc.)
concatenated at each branch's fusion stage — same pattern as Paper 1's
`struct_dim` branch in `model.py`.

Implementation note (documented, not hidden): a textbook Deep Belief Network
pretrains each layer as a Restricted Boltzmann Machine via contrastive
divergence before fine-tuning. For tractability here, `DBNBranch` is a stacked
Linear+Sigmoid feedforward network of the same depth/shape, trained end-to-end
by backprop rather than CD-pretrained layer-by-layer. It is a simplification of
the published training procedure, not the exact method.
"""

from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F


class GCNBranch(nn.Module):
    """3-layer Kipf-Welling graph convolution over the token sequence.

    The "graph" is built from sequential adjacency (token i <-> token i+1) plus
    self-loops, degree-normalized — a lightweight stand-in for an AST/dependency
    graph that needs no external graph library (no torch_geometric dependency).
    """

    def __init__(self, embed_dim: int = 768, hidden: int = 128, struct_dim: int = 0,
                 num_classes: int = 3, dropout: float = 0.3):
        super().__init__()
        self.struct_dim = struct_dim
        self.w1 = nn.Linear(embed_dim, hidden)
        self.w2 = nn.Linear(hidden, hidden)
        self.w3 = nn.Linear(hidden, hidden)
        self.dropout = nn.Dropout(dropout)
        self.head = nn.Linear(hidden + struct_dim, num_classes)

    @staticmethod
    def _normalised_adjacency(seq_len: int, device, mask: torch.Tensor | None) -> torch.Tensor:
        # Sequential chain + self-loops: A[i, i] = A[i, i+1] = A[i+1, i] = 1
        eye = torch.eye(seq_len, device=device)
        shift = torch.diag(torch.ones(seq_len - 1, device=device), diagonal=1)
        adj = eye + shift + shift.T
        if mask is not None:
            adj = adj * mask.unsqueeze(1) * mask.unsqueeze(2)
        deg = adj.sum(-1, keepdim=True).clamp(min=1.0)
        return adj / deg  # row-normalised, (B, T, T) or (T, T)

    def forward(self, seq: torch.Tensor, struct: torch.Tensor | None,
                mask: torch.Tensor | None = None) -> torch.Tensor:
        # seq: (B, T, embed_dim)
        B, T, _ = seq.shape
        adj = self._normalised_adjacency(T, seq.device, mask)  # (B, T, T) if mask given
        if adj.dim() == 2:
            adj = adj.unsqueeze(0).expand(B, -1, -1)

        x = F.relu(torch.bmm(adj, self.w1(seq)))
        x = self.dropout(x)
        x = F.relu(torch.bmm(adj, self.w2(x)))
        x = self.dropout(x)
        x = F.relu(torch.bmm(adj, self.w3(x)))

        if mask is not None:
            denom = mask.sum(-1, keepdim=True).clamp(min=1.0)
            pooled = (x * mask.unsqueeze(-1)).sum(1) / denom
        else:
            pooled = x.mean(dim=1)

        if struct is not None and self.struct_dim > 0:
            pooled = torch.cat([pooled, struct], dim=-1)
        return self.head(pooled)


class DBNBranch(nn.Module):
    """Stacked Linear+Sigmoid blocks, same depth/shape as a DBN's RBM stack.

    Trained end-to-end by backprop (simplification — see module docstring).
    """

    def __init__(self, embed_dim: int = 768, hidden: int = 256, struct_dim: int = 0,
                 num_classes: int = 3, dropout: float = 0.3):
        super().__init__()
        self.struct_dim = struct_dim
        self.rbm1 = nn.Sequential(nn.Linear(embed_dim, hidden), nn.Sigmoid())
        self.rbm2 = nn.Sequential(nn.Linear(hidden, hidden // 2), nn.Sigmoid())
        self.rbm3 = nn.Sequential(nn.Linear(hidden // 2, hidden // 4), nn.Sigmoid())
        self.dropout = nn.Dropout(dropout)
        self.head = nn.Linear(hidden // 4 + struct_dim, num_classes)

    def forward(self, seq: torch.Tensor, struct: torch.Tensor | None,
                mask: torch.Tensor | None = None) -> torch.Tensor:
        # DBN operates on a flat snippet-level vector: mean-pool the token sequence.
        if mask is not None:
            denom = mask.sum(-1, keepdim=True).clamp(min=1.0)
            pooled = (seq * mask.unsqueeze(-1)).sum(1) / denom
        else:
            pooled = seq.mean(dim=1)

        x = self.rbm1(pooled)
        x = self.dropout(x)
        x = self.rbm2(x)
        x = self.dropout(x)
        x = self.rbm3(x)

        if struct is not None and self.struct_dim > 0:
            x = torch.cat([x, struct], dim=-1)
        return self.head(x)


class _DilatedResidualBlock(nn.Module):
    """One causal dilated Conv1d block with a residual connection."""

    def __init__(self, channels: int, dilation: int, dropout: float = 0.2):
        super().__init__()
        self.conv = nn.Conv1d(channels, channels, kernel_size=3, dilation=dilation,
                               padding=dilation)
        self.norm = nn.BatchNorm1d(channels)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, C, T)
        out = self.conv(x)[:, :, : x.size(-1)]  # causal crop (trim right padding)
        out = self.norm(out)
        out = F.relu(out)
        out = self.dropout(out)
        return x + out


class BiTCNBranch(nn.Module):
    """Forward + backward dilated causal Conv1d stacks, fused.

    Forward branch reads the sequence left-to-right (past context); backward
    branch reads the reversed sequence (future context) — same idea as the
    paper's bidirectional temporal convolutional network.
    """

    def __init__(self, embed_dim: int = 768, channels: int = 128, struct_dim: int = 0,
                 num_classes: int = 3, dropout: float = 0.2, n_blocks: int = 3):
        super().__init__()
        self.struct_dim = struct_dim
        self.proj = nn.Linear(embed_dim, channels)
        self.fwd_blocks = nn.ModuleList([
            _DilatedResidualBlock(channels, dilation=2 ** i, dropout=dropout)
            for i in range(n_blocks)
        ])
        self.bwd_blocks = nn.ModuleList([
            _DilatedResidualBlock(channels, dilation=2 ** i, dropout=dropout)
            for i in range(n_blocks)
        ])
        self.fuse = nn.Linear(channels * 2, channels)
        self.head = nn.Linear(channels + struct_dim, num_classes)

    def forward(self, seq: torch.Tensor, struct: torch.Tensor | None,
                mask: torch.Tensor | None = None) -> torch.Tensor:
        x = self.proj(seq)            # (B, T, C)
        x = x.transpose(1, 2)         # (B, C, T)

        fwd = x
        for blk in self.fwd_blocks:
            fwd = blk(fwd)

        bwd = x.flip(dims=[-1])
        for blk in self.bwd_blocks:
            bwd = blk(bwd)
        bwd = bwd.flip(dims=[-1])

        fused = self.fuse(torch.cat([fwd, bwd], dim=1).transpose(1, 2))  # (B, T, C)

        if mask is not None:
            denom = mask.sum(-1, keepdim=True).clamp(min=1.0)
            pooled = (fused * mask.unsqueeze(-1)).sum(1) / denom
        else:
            pooled = fused.mean(dim=1)

        if struct is not None and self.struct_dim > 0:
            pooled = torch.cat([pooled, struct], dim=-1)
        return self.head(pooled)


class ECRVRMVEL(nn.Module):
    """Weighted majority-voting ensemble of GCN + DBN + Bi-TCN.

    Each branch outputs class logits independently. Softmax probabilities are
    combined via a learnable, softmax-normalised per-branch weight vector
    (the paper's "weighted majority voting", made differentiable for end-to-end
    training rather than fit post-hoc).
    """

    def __init__(self, embed_dim: int = 768, struct_dim: int = 0, num_classes: int = 3):
        super().__init__()
        self.gcn = GCNBranch(embed_dim, struct_dim=struct_dim, num_classes=num_classes)
        self.dbn = DBNBranch(embed_dim, struct_dim=struct_dim, num_classes=num_classes)
        self.bitcn = BiTCNBranch(embed_dim, struct_dim=struct_dim, num_classes=num_classes)
        self.branch_logits = nn.Parameter(torch.zeros(3))  # softmax -> ensemble weights

    def branch_probs(self, seq: torch.Tensor, struct: torch.Tensor | None,
                      mask: torch.Tensor | None = None) -> dict[str, torch.Tensor]:
        return {
            "gcn": F.softmax(self.gcn(seq, struct, mask), dim=-1),
            "dbn": F.softmax(self.dbn(seq, struct, mask), dim=-1),
            "bitcn": F.softmax(self.bitcn(seq, struct, mask), dim=-1),
        }

    def forward(self, seq: torch.Tensor, struct: torch.Tensor | None,
                mask: torch.Tensor | None = None) -> torch.Tensor:
        probs = self.branch_probs(seq, struct, mask)
        weights = F.softmax(self.branch_logits, dim=0)  # (3,)
        combined = (weights[0] * probs["gcn"] + weights[1] * probs["dbn"]
                    + weights[2] * probs["bitcn"])
        return torch.log(combined.clamp(min=1e-8))  # log-probs, usable with NLLLoss

    def ensemble_weights(self) -> dict[str, float]:
        w = F.softmax(self.branch_logits, dim=0).detach().cpu().numpy()
        return {"gcn": float(w[0]), "dbn": float(w[1]), "bitcn": float(w[2])}


if __name__ == "__main__":  # shape check
    model = ECRVRMVEL(struct_dim=7)
    seq = torch.randn(2, 80, 768)
    struct = torch.rand(2, 7)
    mask = torch.ones(2, 80)
    out = model(seq, struct, mask)
    print("Log-prob shape:", out.shape)
    print("Ensemble weights:", model.ensemble_weights())
