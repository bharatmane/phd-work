"""Self-Attention BiLSTM classifier (Paper 1, Section 3.4).

Architecture (defaults match Paper 1 Table 2):

    input          : 768-dim CodeBERT embedding +   10-dim handcrafted features
                     projected to `hidden` and tiled across `seq_len` steps
                     (this lets a BiLSTM operate on a single snippet — see
                     section 3.4 paragraph "the identifier feature vectors
                     are given to the two self-governing multilayer perceptrons
                     to initialise the values of cell and hidden states").

    BiLSTM         : `n_layers` layers, `hidden` units, dropout 0.3
    Self-attention : multi-head (`n_heads`, `attn_dim`) with softmax weights
    Dense head     : Linear(hidden*2 → 64) → ReLU → Linear(64 → num_classes)
"""

from __future__ import annotations

import torch
import torch.nn as nn
import torch.nn.functional as F


class SelfAttention(nn.Module):
    """Multi-head additive self-attention over a sequence of hidden states.

    Implements
        u_t = tanh(W_a · h_t + b_a)
        α_t = softmax(u_tᵀ · u_context)
        v   = Σ_t α_t · h_t
    with `n_heads` parallel queries.
    """
    def __init__(self, hidden_dim: int, attn_dim: int = 128, n_heads: int = 4):
        super().__init__()
        self.n_heads = n_heads
        self.proj = nn.Linear(hidden_dim, attn_dim)
        self.context = nn.Parameter(torch.randn(n_heads, attn_dim))
        self.out = nn.Linear(hidden_dim * n_heads, hidden_dim)

    def forward(self, hidden_seq: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        # hidden_seq: (B, T, H)
        u = torch.tanh(self.proj(hidden_seq))                 # (B, T, A)
        scores = torch.einsum("bta,ha->bth", u, self.context) # (B, T, n_heads)
        alpha = F.softmax(scores, dim=1)                      # softmax over T
        # per-head context vector: (B, n_heads, H)
        heads = torch.einsum("bth,btH->bhH", alpha, hidden_seq)
        v = heads.reshape(hidden_seq.size(0), -1)             # (B, n_heads * H)
        return self.out(v), alpha                             # final context, attention weights


class SABiLSTM(nn.Module):
    """The full IRAF-XADL classifier head."""

    def __init__(
        self,
        embed_dim: int = 768,
        feat_dim: int = 10,
        struct_dim: int = 0,
        hidden: int = 128,
        n_layers: int = 3,
        seq_len: int = 50,
        n_heads: int = 4,
        attn_dim: int = 128,
        dense_units: int = 64,
        dropout: float = 0.3,
        num_classes: int = 3,
    ) -> None:
        super().__init__()
        self.seq_len = seq_len
        self.struct_dim = struct_dim

        self.input_proj = nn.Linear(embed_dim + feat_dim, hidden)

        self.lstm = nn.LSTM(
            input_size=hidden,
            hidden_size=hidden,
            num_layers=n_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if n_layers > 1 else 0.0,
        )
        self.attn = SelfAttention(hidden * 2, attn_dim=attn_dim, n_heads=n_heads)

        # Optional branch for snippet-level structural features (code_length, loops, etc.)
        head_in = hidden * 2 + struct_dim
        self.head = nn.Sequential(
            nn.Linear(head_in, dense_units),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(dense_units, num_classes),
        )

    def forward(self, embed: torch.Tensor, feats: torch.Tensor,
                struct: torch.Tensor | None = None) -> torch.Tensor:
        """
        embed  : (B, T, embed_dim)   per-identifier CodeBERT embeddings
        feats  : (B, T, feat_dim)    per-identifier feature vectors
        struct : (B, struct_dim)     optional snippet-level structural features
        returns logits (B, num_classes)
        """
        context, _ = self._encode(embed, feats, struct)
        return self.head(context)

    def forward_with_attention(
        self, embed: torch.Tensor, feats: torch.Tensor,
        struct: torch.Tensor | None = None
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """Like forward() but also returns attention weights (B, T, n_heads)."""
        context, alpha = self._encode(embed, feats, struct)
        return self.head(context), alpha

    def _encode(self, embed, feats, struct):
        x = torch.cat([embed, feats], dim=-1)  # (B, T, embed+feat)
        x = self.input_proj(x)                 # (B, T, hidden)
        h_seq, _ = self.lstm(x)                # (B, T, hidden*2)
        context, alpha = self.attn(h_seq)      # (B, hidden*2), (B, T, n_heads)
        if struct is not None and self.struct_dim > 0:
            context = torch.cat([context, struct], dim=-1)
        return context, alpha


if __name__ == "__main__":                                   # shape check
    model = SABiLSTM()
    e = torch.randn(2, 50, 768)   # (batch, seq_len, embed_dim)
    f = torch.rand(2, 50, 10)     # (batch, seq_len, feat_dim)
    out = model(e, f)
    print("Logits shape:", out.shape)
