"""Training entry point for ECRVR-MVEL (Paper 2).

Example:
    python train_ecrvr.py --epochs 15 --batch-size 16 \
                          --data data/kaggle_augmented.csv \
                          --save artifacts/ecrvr_mvel.pt
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from torch.utils.data import DataLoader, Subset

from src.embeddings import Embedder
from src.ensemble_model import ECRVRMVEL
from src.snippet_dataset import LABELS, SnippetReadabilityDataset, collate
from src.structural import fit_stats

logger = logging.getLogger(__name__)


def _split(ds, train_split: float, seed: int):
    n = len(ds)
    rng = np.random.default_rng(seed)
    idx = rng.permutation(n)
    cut = int(train_split * n)
    return Subset(ds, idx[:cut].tolist()), Subset(ds, idx[cut:].tolist())


def _metrics(y_true, y_pred) -> dict[str, float]:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
    }


@torch.no_grad()
def _evaluate(model, loader, device, loss_fn):
    model.eval()
    total_loss, ys, ps = 0.0, [], []
    n = 0
    for batch in loader:
        seq = batch["seq"].to(device)
        mask = batch["mask"].to(device)
        struct = batch["struct"].to(device)
        labels = batch["labels"].to(device)
        log_probs = model(seq, struct, mask)
        loss = loss_fn(log_probs, labels)
        total_loss += loss.item() * labels.size(0)
        ys.append(labels.cpu().numpy())
        ps.append(log_probs.argmax(dim=-1).cpu().numpy())
        n += labels.size(0)
    if n == 0:
        return 0.0, {}
    y_true = np.concatenate(ys)
    y_pred = np.concatenate(ps)
    return total_loss / n, _metrics(y_true, y_pred)


def main() -> None:
    p = argparse.ArgumentParser(description="Train ECRVR-MVEL on the snippet readability dataset.")
    p.add_argument("--data", default="data/kaggle_augmented.csv")
    p.add_argument("--epochs", type=int, default=15)
    p.add_argument("--batch-size", type=int, default=16)
    p.add_argument("--lr", type=float, default=2e-3)
    p.add_argument("--weight-decay", type=float, default=1e-4)
    p.add_argument("--train-split", type=float, default=0.7)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--save", default="artifacts/ecrvr_mvel.pt")
    p.add_argument("--no-codebert", action="store_true")
    args = p.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

    print(f"Loading dataset: {args.data}")
    ds = SnippetReadabilityDataset(args.data, embedder=Embedder(use_codebert=not args.no_codebert))
    print(f"Total samples: {len(ds)}  (struct_dim={ds.struct_dim})")

    torch.manual_seed(args.seed)

    train_set, val_set = _split(ds, args.train_split, args.seed)

    # Fit structural-feature normalisation on the train split only (no leakage),
    # then apply it to the whole dataset (train_ecrvr's val split reuses the
    # same in-memory Dataset object via Subset, so this updates both).
    struct_stats = fit_stats([ds.raw_structs[i] for i in train_set.indices])
    ds.set_normalized_structs(struct_stats)

    train_loader = DataLoader(train_set, batch_size=args.batch_size, shuffle=True, collate_fn=collate)
    val_loader = DataLoader(val_set, batch_size=args.batch_size, shuffle=False, collate_fn=collate)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = ECRVRMVEL(struct_dim=ds.struct_dim, num_classes=len(LABELS)).to(device)
    opt = torch.optim.NAdam(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    loss_fn = nn.NLLLoss()  # model already returns log-probs (combined softmax ensemble)

    best_acc, best_state, best_metrics = -1.0, None, {}

    for epoch in range(1, args.epochs + 1):
        model.train()
        train_loss = 0.0
        for batch in train_loader:
            seq = batch["seq"].to(device)
            mask = batch["mask"].to(device)
            struct = batch["struct"].to(device)
            labels = batch["labels"].to(device)

            opt.zero_grad()
            log_probs = model(seq, struct, mask)
            loss = loss_fn(log_probs, labels)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            train_loss += loss.item() * labels.size(0)
        train_loss /= max(1, len(train_set))

        val_loss, m = _evaluate(model, val_loader, device, loss_fn)
        if m["accuracy"] > best_acc:
            best_acc = m["accuracy"]
            best_metrics = m
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}

        logger.info(
            "epoch %3d  train_loss=%.4f  val_loss=%.4f  acc=%.4f  P=%.4f  R=%.4f  F1=%.4f  weights=%s",
            epoch, train_loss, val_loss, m.get("accuracy", 0), m.get("precision", 0),
            m.get("recall", 0), m.get("f1", 0), model.ensemble_weights(),
        )

    if best_state is not None:
        Path(args.save).parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "state_dict": best_state,
            "labels": LABELS,
            "struct_dim": ds.struct_dim,
            "max_tokens": ds.max_tokens,
            "struct_stats": struct_stats,
            "metrics": best_metrics,
            "train_size": len(train_set),
            "val_size": len(val_set),
        }, args.save)
        print(f"\nSaved best checkpoint (val_acc={best_acc:.4f}) -> {args.save}")
        print(f"Metrics: {best_metrics}")


if __name__ == "__main__":
    main()
