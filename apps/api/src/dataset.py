"""PyTorch Dataset for labelled code snippets.

Each CSV row has two columns:
    code              -- raw source code as a string
    readability_level -- one of {Low, Medium, High}

The dataset performs the full IRAF-XADL preprocessing for every sample:
extract identifiers, normalise, compute the 10 features, run CodeBERT,
and return a (embed, feats, label) tuple ready for the SA-BiLSTM.
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

from .embeddings import EMBED_DIM, Embedder
from .features import compute_features, snippet_feature_vector
from .preprocess import extract_and_normalise

LABELS = ["Low", "Medium", "High"]
LABEL_TO_ID = {label: i for i, label in enumerate(LABELS)}
MAX_IDS = 50   # maximum identifiers per snippet (= model seq_len)
FEAT_DIM = 10  # number of handcrafted features


def _torch_dataset_base():
    """Lazy import of torch.utils.data.Dataset so the module imports cleanly
    even if torch is not installed (e.g. for feature-only smoke tests)."""
    try:
        from torch.utils.data import Dataset
        return Dataset
    except Exception:
        class _Stub:
            pass
        return _Stub


class CodeReadabilityDataset(_torch_dataset_base()):
    """Loads a CSV and pre-computes embeddings + features for every sample."""

    def __init__(self, csv_path: str | Path, language: str,
                 embedder: Embedder | None = None,
                 use_codebert: bool = True) -> None:
        df = pd.read_csv(csv_path)
        if not {"code", "readability_level"}.issubset(df.columns):
            raise ValueError(
                "CSV must have columns 'code' and 'readability_level' "
                f"(found: {df.columns.tolist()})"
            )
        df = df[df["readability_level"].isin(LABELS)].reset_index(drop=True)
        self.language = language
        self.codes = df["code"].astype(str).tolist()
        self.labels = df["readability_level"].map(LABEL_TO_ID).to_numpy()

        # Detect optional snippet-level structural feature columns (anything ending in _norm)
        struct_cols = [c for c in df.columns if c.endswith("_norm")]
        self.struct_dim = len(struct_cols)
        self.structs: list[np.ndarray] = (
            [df[struct_cols].iloc[i].to_numpy(dtype=np.float32) for i in range(len(df))]
            if struct_cols else []
        )
        self.embedder = embedder or Embedder(use_codebert=use_codebert)

        # Build a corpus-wide token counter so LF feature has real signal.
        self.corpus_counts: Counter[str] = Counter()
        for code in self.codes:
            for ident in extract_and_normalise(code, language):
                self.corpus_counts.update(ident.tokens)

        # Pre-compute per-identifier embeddings + features (Paper 1 §3.4).
        # Shape per sample: embed (MAX_IDS, EMBED_DIM), feats (MAX_IDS, FEAT_DIM).
        # Identifiers beyond MAX_IDS are dropped; shorter sequences are zero-padded.
        self.embeds: list[np.ndarray] = []
        self.feats: list[np.ndarray] = []
        for code in self.codes:
            ids = extract_and_normalise(code, language)[:MAX_IDS]
            embed_seq = np.zeros((MAX_IDS, EMBED_DIM), dtype=np.float32)
            feat_seq  = np.zeros((MAX_IDS, FEAT_DIM),  dtype=np.float32)
            for j, ident in enumerate(ids):
                embed_seq[j] = self.embedder.encode_identifiers(ident.tokens)
            if ids:
                feat_seq[:len(ids)] = compute_features(ids, self.corpus_counts)
            self.embeds.append(embed_seq)
            self.feats.append(feat_seq)

    def __len__(self) -> int:
        return len(self.codes)

    def __getitem__(self, idx: int) -> dict:
        import torch
        item = {
            "embed": torch.from_numpy(self.embeds[idx]).float(),
            "feats": torch.from_numpy(self.feats[idx]).float(),
            "label": int(self.labels[idx]),
            "code":  self.codes[idx],
        }
        if self.structs:
            item["struct"] = torch.from_numpy(self.structs[idx]).float()
        return item

    def get_numpy(self, idx: int) -> dict:
        """torch-free accessor — useful for sandbox/feature-only tests."""
        item = {
            "embed": self.embeds[idx],
            "feats": self.feats[idx],
            "label": int(self.labels[idx]),
            "code":  self.codes[idx],
        }
        if self.structs:
            item["struct"] = self.structs[idx]
        return item


def collate(batch: list[dict]) -> dict:
    import torch
    out = {
        "embed":  torch.stack([b["embed"] for b in batch]),
        "feats":  torch.stack([b["feats"] for b in batch]),
        "labels": torch.tensor([b["label"] for b in batch], dtype=torch.long),
        "codes":  [b["code"] for b in batch],
    }
    if "struct" in batch[0]:
        out["struct"] = torch.stack([b["struct"] for b in batch])
    return out
