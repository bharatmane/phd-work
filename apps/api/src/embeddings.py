"""CodeBERT embedding wrapper (Paper 1, Section 3.3).

Lazy-loaded so the rest of the pipeline can run without downloading the
500 MB model. If `transformers`/`torch` is unavailable or `--no-codebert`
is requested, a deterministic fallback embedder is used (a hashing-based
projection into the same 768-dim space) so the model architecture and
training loop still work end-to-end for demo purposes.
"""

from __future__ import annotations

import hashlib
import logging
from typing import Iterable

import numpy as np

logger = logging.getLogger(__name__)

_CODEBERT_MODEL_NAME = "microsoft/codebert-base"
EMBED_DIM = 768                                   # CodeBERT hidden size


# --------------------------- fallback embedder --------------------------
class HashEmbedder:
    """Deterministic, zero-dependency fallback that hashes each token to a
    fixed 768-dim vector. Lets the pipeline run when CodeBERT is unavailable.
    """
    def __init__(self, dim: int = EMBED_DIM) -> None:
        self.dim = dim

    def _hash_vec(self, token: str) -> np.ndarray:
        h = hashlib.sha256(token.encode("utf-8")).digest()
        repeats = (self.dim * 4 // len(h)) + 1
        raw = (h * repeats)[: self.dim * 4]
        arr = np.frombuffer(raw, dtype=np.uint32).astype(np.float32)
        arr = arr / np.iinfo(np.uint32).max - 0.5
        return arr

    def encode(self, tokens: Iterable[str]) -> np.ndarray:
        tokens = list(tokens)
        if not tokens:
            return np.zeros(self.dim, dtype=np.float32)
        return np.mean([self._hash_vec(t) for t in tokens], axis=0).astype(np.float32)


# --------------------------- CodeBERT embedder --------------------------
class CodeBERTEmbedder:
    """Wraps `microsoft/codebert-base` and returns mean-pooled embeddings.
    All torch / transformers imports happen lazily inside the methods so the
    module is safe to import even when those libraries are unavailable.
    """

    _tokenizer = None
    _model = None
    _device = None

    @classmethod
    def _load(cls) -> None:
        if cls._model is not None:
            return
        import torch
        from transformers import AutoModel, AutoTokenizer
        logger.info("Loading CodeBERT (%s) ...", _CODEBERT_MODEL_NAME)
        cls._tokenizer = AutoTokenizer.from_pretrained(_CODEBERT_MODEL_NAME)
        cls._model = AutoModel.from_pretrained(_CODEBERT_MODEL_NAME)
        cls._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        cls._model.to(cls._device).eval()

    @classmethod
    def encode(cls, text: str, max_length: int = 50) -> np.ndarray:
        import torch
        cls._load()
        with torch.no_grad():
            inputs = cls._tokenizer(
                text, truncation=True, padding="max_length",
                max_length=max_length, return_tensors="pt"
            ).to(cls._device)
            outputs = cls._model(**inputs)
            # mean-pool over token dimension (Paper 1, Section 3.3 last paragraph)
            mask = inputs["attention_mask"].unsqueeze(-1).float()
            summed = (outputs.last_hidden_state * mask).sum(dim=1)
            counts = mask.sum(dim=1).clamp(min=1.0)
            pooled = (summed / counts).squeeze(0).cpu().numpy().astype(np.float32)
            return pooled

    @classmethod
    def encode_sequence(cls, text: str, max_length: int = 80) -> np.ndarray:
        """Per-token last_hidden_state (Paper 2, Section 6.2 Stage 2) — needed by
        the GCN/Bi-TCN branches, which operate over a token sequence rather than
        a single pooled vector. Padded positions are zeroed via the attention mask.
        """
        import torch
        cls._load()
        with torch.no_grad():
            inputs = cls._tokenizer(
                text, truncation=True, padding="max_length",
                max_length=max_length, return_tensors="pt"
            ).to(cls._device)
            outputs = cls._model(**inputs)
            mask = inputs["attention_mask"].unsqueeze(-1).float()
            seq = (outputs.last_hidden_state * mask).squeeze(0).cpu().numpy().astype(np.float32)
            return seq  # (max_length, 768)


# ------------------------------ facade ----------------------------------
class Embedder:
    """User-facing facade. Picks CodeBERT if available; falls back to HashEmbedder."""

    def __init__(self, use_codebert: bool = True) -> None:
        self.use_codebert = use_codebert
        self._fallback = HashEmbedder()
        self._codebert_ready = False
        if use_codebert:
            try:
                CodeBERTEmbedder._load()
                self._codebert_ready = True
            except Exception as exc:
                logger.warning("CodeBERT unavailable (%s) - using HashEmbedder.", exc)
                self.use_codebert = False

    @property
    def name(self) -> str:
        return "CodeBERT" if self._codebert_ready else "HashEmbedder"

    def encode_snippet(self, code: str, max_length: int = 50) -> np.ndarray:
        if self._codebert_ready:
            return CodeBERTEmbedder.encode(code, max_length=max_length)
        return self._fallback.encode(code.split())

    def encode_identifiers(self, tokens: list[str]) -> np.ndarray:
        if self._codebert_ready:
            return CodeBERTEmbedder.encode(" ".join(tokens))
        return self._fallback.encode(tokens)

    def encode_sequence(self, code: str, max_length: int = 80) -> np.ndarray:
        """Per-token embedding sequence (max_length, 768) for snippet-level models
        (Paper 2's GCN / Bi-TCN branches). Falls back to a deterministic per-token
        hash sequence when CodeBERT is unavailable."""
        if self._codebert_ready:
            return CodeBERTEmbedder.encode_sequence(code, max_length=max_length)
        tokens = code.split()[:max_length]
        seq = np.zeros((max_length, self._fallback.dim), dtype=np.float32)
        for i, tok in enumerate(tokens):
            seq[i] = self._fallback._hash_vec(tok)[: self._fallback.dim]
        return seq


if __name__ == "__main__":
    e = Embedder(use_codebert=False)
    v = e.encode_snippet("def hello(name): return name")
    print("Embedder:", e.name, " dim:", v.shape, " mean:", float(v.mean()))
