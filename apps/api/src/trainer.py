"""AdamW training loop with metrics matching Paper 1, Section 4.2.

Reports accuracy / precision / recall / F1 / AUC at every epoch and saves
the best checkpoint by validation accuracy.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (accuracy_score, f1_score, precision_score,
                             recall_score, roc_auc_score)
from torch.utils.data import DataLoader, Subset

from .dataset import CodeReadabilityDataset, LABELS, collate
from .model import SABiLSTM

logger = logging.getLogger(__name__)


@dataclass
class TrainConfig:
    epochs: int = 100
    batch_size: int = 32
    lr: float = 1e-3
    weight_decay: float = 0.01
    grad_clip: float = 1.0
    train_split: float = 0.7
    seed: int = 42
    save_path: str | None = None


def _split(ds: CodeReadabilityDataset, cfg: TrainConfig):
    n = len(ds)
    rng = np.random.default_rng(cfg.seed)
    idx = rng.permutation(n)
    cut = int(cfg.train_split * n)
    return Subset(ds, idx[:cut].tolist()), Subset(ds, idx[cut:].tolist())


def _metrics(y_true, y_pred, y_score) -> dict[str, float]:
    out = {
        "accuracy":  float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall":    float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1":        float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
    }
    try:
        out["auc"] = float(roc_auc_score(y_true, y_score, multi_class="ovr",
                                         labels=list(range(len(LABELS)))))
    except ValueError:
        out["auc"] = float("nan")
    return out


def train(ds: CodeReadabilityDataset, cfg: TrainConfig | None = None) -> dict:
    cfg = cfg or TrainConfig()
    torch.manual_seed(cfg.seed)

    train_set, val_set = _split(ds, cfg)
    train_loader = DataLoader(train_set, batch_size=cfg.batch_size,
                              shuffle=True, collate_fn=collate)
    val_loader   = DataLoader(val_set,   batch_size=cfg.batch_size,
                              shuffle=False, collate_fn=collate)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SABiLSTM(num_classes=len(LABELS),
                     struct_dim=getattr(ds, "struct_dim", 0)).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=cfg.lr,
                            weight_decay=cfg.weight_decay)
    loss_fn = nn.CrossEntropyLoss()

    best_acc, best_state = -1.0, None
    history: list[dict] = []

    for epoch in range(1, cfg.epochs + 1):
        model.train()
        train_loss = 0.0
        for batch in train_loader:
            embed = batch["embed"].to(device)
            feats = batch["feats"].to(device)
            labels = batch["labels"].to(device)

            struct = batch.get("struct")
            if struct is not None:
                struct = struct.to(device)
            opt.zero_grad()
            logits = model(embed, feats, struct)
            loss = loss_fn(logits, labels)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), cfg.grad_clip)
            opt.step()
            train_loss += loss.item() * labels.size(0)
        train_loss /= max(1, len(train_set))

        val_loss, m = _evaluate(model, val_loader, device, loss_fn)
        m["epoch"] = epoch
        m["train_loss"] = train_loss
        m["val_loss"] = val_loss
        history.append(m)

        if m["accuracy"] > best_acc:
            best_acc = m["accuracy"]
            best_state = {k: v.cpu().clone() for k, v in model.state_dict().items()}

        if epoch == 1 or epoch % 5 == 0 or epoch == cfg.epochs:
            logger.info("epoch %3d  train_loss=%.4f  val_loss=%.4f  "
                        "acc=%.4f  P=%.4f  R=%.4f  F1=%.4f  AUC=%.4f",
                        epoch, train_loss, val_loss,
                        m["accuracy"], m["precision"], m["recall"], m["f1"],
                        m.get("auc", float("nan")))

    if best_state is not None and cfg.save_path:
        Path(cfg.save_path).parent.mkdir(parents=True, exist_ok=True)
        torch.save({"state_dict": best_state, "labels": LABELS,
                    "struct_dim": getattr(ds, "struct_dim", 0)}, cfg.save_path)
        logger.info("Saved best checkpoint (acc=%.4f) -> %s", best_acc, cfg.save_path)

    return {"best_accuracy": best_acc, "history": history}


@torch.no_grad()
def _evaluate(model, loader, device, loss_fn) -> tuple[float, dict]:
    model.eval()
    losses, ys, ps, scores = 0.0, [], [], []
    n = 0
    for batch in loader:
        embed = batch["embed"].to(device)
        feats = batch["feats"].to(device)
        labels = batch["labels"].to(device)
        struct = batch.get("struct")
        if struct is not None:
            struct = struct.to(device)
        logits = model(embed, feats, struct)
        losses += loss_fn(logits, labels).item() * labels.size(0)
        prob = torch.softmax(logits, dim=-1).cpu().numpy()
        ys.append(labels.cpu().numpy())
        ps.append(prob.argmax(axis=-1))
        scores.append(prob)
        n += labels.size(0)
    if n == 0:
        return 0.0, {}
    y_true = np.concatenate(ys)
    y_pred = np.concatenate(ps)
    y_score = np.concatenate(scores)
    return losses / n, _metrics(y_true, y_pred, y_score)
