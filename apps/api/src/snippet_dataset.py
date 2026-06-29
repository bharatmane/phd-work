"""PyTorch Dataset for snippet-level readability (Paper 2, ECRVR-MVEL).

Each row of `kaggle_augmented.csv` has:
    code               -- raw Python source (LeetCode-style solution)
    readability_level  -- one of {Low, Medium, High}
    *_norm             -- 7 normalised structural features (length, complexity, etc.)

Unlike `dataset.py` (Paper 1, per-identifier sequence), this dataset returns a
per-token CodeBERT embedding sequence for the whole snippet, since the GCN and
Bi-TCN branches need a sequence to operate over (Paper 2, Section 6.2 Stage 2).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from .embeddings import EMBED_DIM, Embedder
from .structural import FEATURE_NAMES, compute_structural

LABELS = ["Low", "Medium", "High"]
LABEL_TO_ID = {label: i for i, label in enumerate(LABELS)}
MAX_TOKENS = 80  # truncation length for the per-token embedding sequence


def _torch_dataset_base():
    try:
        from torch.utils.data import Dataset
        return Dataset
    except Exception:
        class _Stub:
            pass
        return _Stub


class SnippetReadabilityDataset(_torch_dataset_base()):
    """Loads `kaggle_augmented.csv` and pre-computes a token-sequence embedding
    + structural feature vector + label for every sample."""

    def __init__(self, csv_path: str | Path, embedder: Embedder | None = None,
                 use_codebert: bool = True, max_tokens: int = MAX_TOKENS) -> None:
        df = pd.read_csv(csv_path)
        if not {"code", "readability_level"}.issubset(df.columns):
            raise ValueError(
                "CSV must have columns 'code' and 'readability_level' "
                f"(found: {df.columns.tolist()})"
            )
        df = df[df["readability_level"].isin(LABELS)].reset_index(drop=True)
        self.codes = df["code"].astype(str).tolist()
        self.labels = df["readability_level"].map(LABEL_TO_ID).to_numpy()
        self.max_tokens = max_tokens

        # Recompute raw structural features from code (not the CSV's pre-baked
        # *_norm columns — their original min/max aren't recoverable for live
        # inference on new code). Normalisation happens later in train_ecrvr.py,
        # fit on the train split only, mirroring Paper 1's norm_stats pattern.
        self.struct_dim = len(FEATURE_NAMES)
        self.raw_structs: list[dict[str, float]] = [compute_structural(c) for c in self.codes]
        self.structs = np.zeros((len(df), self.struct_dim), dtype=np.float32)  # filled in later

        self.embedder = embedder or Embedder(use_codebert=use_codebert)

        self.seqs: list[np.ndarray] = []
        self.masks: list[np.ndarray] = []
        for code in self.codes:
            seq = self.embedder.encode_sequence(code, max_length=max_tokens)
            mask = (np.abs(seq).sum(axis=-1) > 0).astype(np.float32)
            self.seqs.append(seq)
            self.masks.append(mask)

    def set_normalized_structs(self, stats: dict) -> None:
        """Apply min/max normalisation (fit on the train split) to every sample's
        raw structural features. Must be called once before training."""
        from .structural import normalize_structural
        for i, raw in enumerate(self.raw_structs):
            self.structs[i] = normalize_structural(raw, stats)

    def __len__(self) -> int:
        return len(self.codes)

    def __getitem__(self, idx: int) -> dict:
        import torch
        return {
            "seq": torch.from_numpy(self.seqs[idx]).float(),
            "mask": torch.from_numpy(self.masks[idx]).float(),
            "struct": torch.from_numpy(self.structs[idx]).float(),
            "label": int(self.labels[idx]),
            "code": self.codes[idx],
        }


def collate(batch: list[dict]) -> dict:
    import torch
    return {
        "seq": torch.stack([b["seq"] for b in batch]),
        "mask": torch.stack([b["mask"] for b in batch]),
        "struct": torch.stack([b["struct"] for b in batch]),
        "labels": torch.tensor([b["label"] for b in batch], dtype=torch.long),
        "codes": [b["code"] for b in batch],
    }
