"""SHAP-based explainability (Paper 1, Section 3.6).

For computational efficiency on a single snippet we explain only the
10 handcrafted readability features (the high-information, human-readable
ones), holding the CodeBERT embedding fixed at the sample value. This
matches the figures in Paper 1 (Fig. 11 / 12) which show feature
attributions for MC, NC, ..., PRED.
"""

from __future__ import annotations

import logging
from typing import Callable

import numpy as np
import torch

from .features import FEATURE_NAMES
from .model import SABiLSTM

logger = logging.getLogger(__name__)


def _model_fn(model: SABiLSTM, embed: torch.Tensor, device: torch.device,
              seq_len: int = 50) -> Callable:
    """Return a numpy-in / numpy-out wrapper that SHAP can call.

    SHAP perturbs the 10-dim mean-feature vector. We tile both embed and
    features to seq_len so the SA-BiLSTM receives its expected (B,T,D) input.
    """
    def f(feats_batch: np.ndarray) -> np.ndarray:
        N = feats_batch.shape[0]
        with torch.no_grad():
            # embed: (768,) -> (N, seq_len, 768)
            e = embed.unsqueeze(0).unsqueeze(0).expand(N, seq_len, -1).to(device)
            # feats_batch: (N, 10) -> (N, seq_len, 10)
            ft = (torch.from_numpy(feats_batch).float()
                  .unsqueeze(1).expand(-1, seq_len, -1).to(device))
            logits = model(e, ft)
            return torch.softmax(logits, dim=-1).cpu().numpy()
    return f


def explain_sample(model: SABiLSTM,
                   embed: np.ndarray,
                   feats: np.ndarray,
                   background: np.ndarray | None = None,
                   nsamples: int = 64,
                   device: torch.device | None = None) -> dict:
    """Return SHAP values for the 10 features of a single sample.

    embed      : (768,) CodeBERT embedding for the sample
    feats      : (10,)  feature vector for the sample
    background : (B, 10) reference distribution (e.g. dataset mean replicated)
    """
    try:
        import shap
    except ImportError as exc:
        raise RuntimeError(
            "shap is not installed. `pip install shap` to use the explainer."
        ) from exc

    device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device).eval()

    if background is None:
        background = np.tile(feats, (8, 1))
        background += 0.05 * np.random.default_rng(0).standard_normal(background.shape)
        background = background.clip(0.0, 1.0)

    embed_t = torch.from_numpy(embed).float()
    f = _model_fn(model, embed_t, device)

    explainer = shap.KernelExplainer(f, background)
    shap_values = explainer.shap_values(feats[None, :], nsamples=nsamples,
                                        silent=True)

    # shap_values is a list of (1, 10) arrays — one per class
    if isinstance(shap_values, list):
        per_class = [sv.squeeze(0) for sv in shap_values]
    else:
        # shap >= 0.42 sometimes returns ndarray of shape (1, 10, n_classes)
        sv = np.array(shap_values)
        if sv.ndim == 3:
            per_class = [sv[0, :, c] for c in range(sv.shape[2])]
        else:
            per_class = [sv.squeeze()]

    # softmax probabilities for the sample itself
    probs = f(feats[None, :])[0]
    pred_class = int(np.argmax(probs))

    return {
        "feature_names": FEATURE_NAMES,
        "feature_values": feats,
        "probabilities": probs,
        "predicted_class": pred_class,
        "shap_per_class": per_class,
    }


def format_explanation(expl: dict, label_names: list[str]) -> str:
    """Pretty-print SHAP attributions for the predicted class."""
    pred = expl["predicted_class"]
    sv = expl["shap_per_class"][pred]
    lines = [
        f"Predicted class: {label_names[pred]}  "
        f"(probs: " + ", ".join(f"{l}={p:.3f}" for l, p in
                                zip(label_names, expl['probabilities'])) + ")",
        "",
        f"{'Feature':<8}{'Value':>8}{'SHAP':>10}  Effect",
        "-" * 48,
    ]
    pairs = sorted(zip(expl["feature_names"], expl["feature_values"], sv),
                   key=lambda r: abs(r[2]), reverse=True)
    for name, val, s in pairs:
        arrow = "^" if s > 0 else "v"
        lines.append(f"{name:<8}{val:>8.3f}{s:>+10.4f}  {arrow}")
    return "\n".join(lines)
