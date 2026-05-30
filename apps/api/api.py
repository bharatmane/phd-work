"""IRAF-XADL Readability Prediction API.

Start with:
    python api.py
Then open http://localhost:8000

POST /predict  { "code": "def foo(x): ..." }
GET  /health
"""

from __future__ import annotations

import ast
import logging
import re
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import numpy as np
import torch
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).parent))

from src.dataset import LABELS, MAX_IDS, FEAT_DIM
from src.embeddings import EMBED_DIM, Embedder
from src.features import FEATURE_NAMES, compute_features
from src.model import SABiLSTM
from src.preprocess import extract_and_normalise

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

CHECKPOINT = Path("artifacts/iraf_xadl_augmented.pt")

# ---------------------------------------------------------------------------
# Global model state (loaded once at startup)
# ---------------------------------------------------------------------------
_state: dict[str, Any] = {}


def _compute_structural(code: str) -> dict[str, float]:
    """Compute the 7 raw structural features from a code string."""
    lines = [l for l in code.splitlines() if l.strip()]
    num_of_lines = max(len(lines), 1)
    code_length = len(code)
    line_length = float(np.mean([len(l) for l in lines])) if lines else 0.0
    loop_count = len(re.findall(r"\bfor\b|\bwhile\b", code))

    branches = len(re.findall(
        r"\bif\b|\belif\b|\bfor\b|\bwhile\b|\bexcept\b|\band\b|\bor\b", code))
    cyclomatic_complexity = max(1, branches)

    indent_sizes = [len(l) - len(l.lstrip()) for l in code.splitlines() if l.strip()]
    indents = max(indent_sizes) // 4 if indent_sizes else 1

    try:
        tree = ast.parse(code)
        identifiers = len([n for n in ast.walk(tree) if isinstance(n, ast.Name)])
    except SyntaxError:
        identifiers = len(re.findall(r"\b[a-zA-Z_]\w*\b", code))

    return {
        "num_of_lines": num_of_lines,
        "code_length": code_length,
        "cyclomatic_complexity": cyclomatic_complexity,
        "indents": indents,
        "loop_count": loop_count,
        "line_length": line_length,
        "identifiers": identifiers,
    }


def _normalize_structural(raw: dict[str, float], stats: dict) -> np.ndarray:
    """Normalise raw structural features using training-set min/max."""
    vec = []
    for col in ["num_of_lines", "code_length", "cyclomatic_complexity",
                "indents", "loop_count", "line_length", "identifiers"]:
        lo = stats[col]["min"]
        hi = stats[col]["max"]
        val = float(np.clip((raw[col] - lo) / max(hi - lo, 1e-6), 0.0, 1.0))
        vec.append(val)
    return np.array(vec, dtype=np.float32)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading checkpoint: %s", CHECKPOINT)
    if not CHECKPOINT.exists():
        raise RuntimeError(
            f"Checkpoint not found at {CHECKPOINT}. "
            "Run: python train.py --data data/kaggle_augmented.csv "
            "--epochs 100 --save artifacts/iraf_xadl_augmented.pt"
        )
    ckpt = torch.load(CHECKPOINT, map_location="cpu")
    struct_dim = ckpt.get("struct_dim", 7)
    norm_stats = ckpt.get("norm_stats", {})

    model = SABiLSTM(num_classes=len(LABELS), struct_dim=struct_dim)
    model.load_state_dict(ckpt["state_dict"])
    model.eval()

    logger.info("Loading CodeBERT embedder...")
    embedder = Embedder(use_codebert=True)

    _state["model"] = model
    _state["embedder"] = embedder
    _state["struct_dim"] = struct_dim
    _state["norm_stats"] = norm_stats
    logger.info("Ready.")
    yield
    _state.clear()


app = FastAPI(title="IRAF-XADL Readability API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    code: str
    language: str = "python"


class IdentifierInfo(BaseModel):
    name: str
    kind: str
    tokens: list[str]
    features: dict[str, float]
    attention_weight: float   # mean attention across heads — how much model focused here
    influence: str            # "High" | "Medium" | "Low" — relative to other identifiers


class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict[str, float]
    identifiers: list[IdentifierInfo]
    structural: dict[str, float]
    explanation: str
    identifier_quality_score: float   # 0-1, purely from the 10 naming features
    identifier_quality_label: str     # High / Medium / Low


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": "model" in _state}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if "model" not in _state:
        raise HTTPException(503, "Model not loaded yet.")

    code = req.code.strip()
    if not code:
        raise HTTPException(400, "code must not be empty.")

    model: SABiLSTM = _state["model"]
    embedder: Embedder = _state["embedder"]
    norm_stats: dict = _state["norm_stats"]

    # 1. Extract identifiers — per-identifier embeddings + features
    idents = extract_and_normalise(code, req.language)[:MAX_IDS]
    embed_seq = np.zeros((MAX_IDS, EMBED_DIM), dtype=np.float32)
    feat_seq  = np.zeros((MAX_IDS, FEAT_DIM),  dtype=np.float32)
    for j, ident in enumerate(idents):
        embed_seq[j] = embedder.encode_identifiers(ident.tokens)
    feat_matrix = compute_features(idents) if idents else np.zeros((0, FEAT_DIM))
    if len(idents) > 0:
        feat_seq[:len(idents)] = feat_matrix

    # 2. Structural features
    raw_struct = _compute_structural(code)
    struct_vec = _normalize_structural(raw_struct, norm_stats) if norm_stats else np.zeros(7, dtype=np.float32)

    # 3. Run model — get logits AND self-attention weights
    with torch.no_grad():
        embed_t  = torch.from_numpy(embed_seq).float().unsqueeze(0)
        feats_t  = torch.from_numpy(feat_seq).float().unsqueeze(0)
        struct_t = torch.from_numpy(struct_vec).float().unsqueeze(0)
        logits, alpha = model.forward_with_attention(embed_t, feats_t, struct_t)
        probs = torch.softmax(logits, dim=-1).squeeze(0).numpy()
        # alpha: (1, T, n_heads) -> mean over heads -> (T,) for the real identifiers
        attn_weights = alpha.squeeze(0).mean(dim=-1).numpy()  # (T,)

    pred_idx   = int(np.argmax(probs))
    pred_label = LABELS[pred_idx]

    # 4. Identifier influence from attention weights
    n_idents = len(idents)
    if n_idents > 0:
        raw_weights = attn_weights[:n_idents]
        norm_weights = raw_weights / (raw_weights.sum() + 1e-9)
        # Bin into High/Medium/Low influence relative to uniform (1/n)
        threshold_high = 1.5 / n_idents
        threshold_low  = 0.5 / n_idents
        def influence_label(w):
            if w >= threshold_high: return "High"
            if w <= threshold_low:  return "Low"
            return "Medium"
    else:
        norm_weights = []
        def influence_label(_): return "Medium"

    # 5. Build identifier breakdown with attention + feature scores
    id_info = []
    for i, (ident, feat_row) in enumerate(zip(idents, feat_matrix)):
        w = float(norm_weights[i]) if i < len(norm_weights) else 0.0
        id_info.append(IdentifierInfo(
            name=ident.raw,
            kind=ident.kind,
            tokens=ident.tokens,
            features={n: round(float(v), 3) for n, v in zip(FEATURE_NAMES, feat_row)},
            attention_weight=round(w, 4),
            influence=influence_label(w),
        ))

    # 6. Generate plain-English explanation
    explanation = _build_explanation(
        pred_label, probs, id_info, raw_struct, LABELS
    )

    # Identifier Quality Score — mean of CLS scores across all identifiers
    # CLS (Cognitive Load Score) combines MC, LF, PR — purely naming-based
    if feat_matrix.shape[0] > 0:
        cls_idx = FEATURE_NAMES.index("CLS")
        mc_idx  = FEATURE_NAMES.index("MC")
        nc_idx  = FEATURE_NAMES.index("NC")
        ol_idx  = FEATURE_NAMES.index("OL")
        iq_score = float(np.mean(
            0.35 * feat_matrix[:, mc_idx] +
            0.25 * feat_matrix[:, nc_idx] +
            0.20 * feat_matrix[:, ol_idx] +
            0.20 * feat_matrix[:, cls_idx]
        ))
    else:
        iq_score = 0.0

    if iq_score >= 0.75:
        iq_label = "High"
    elif iq_score >= 0.50:
        iq_label = "Medium"
    else:
        iq_label = "Low"

    return PredictResponse(
        label=pred_label,
        confidence=round(float(probs[pred_idx]), 4),
        probabilities={l: round(float(p), 4) for l, p in zip(LABELS, probs)},
        identifiers=id_info,
        structural={k: round(float(v), 3) for k, v in raw_struct.items()},
        explanation=explanation,
        identifier_quality_score=round(iq_score, 3),
        identifier_quality_label=iq_label,
    )


def _build_explanation(label: str, probs: np.ndarray,
                        id_info: list, struct: dict, labels: list) -> str:
    """Generate a plain-English explanation of the readability verdict."""
    conf = round(float(probs[labels.index(label)]) * 100, 1)

    # Structural summary
    lines   = int(struct["num_of_lines"])
    loops   = int(struct["loop_count"])
    cmplx   = int(struct["cyclomatic_complexity"])
    n_ids   = int(struct["identifiers"])

    struct_parts = [f"{lines} line{'s' if lines != 1 else ''}"]
    if loops > 0:
        struct_parts.append(f"{loops} loop{'s' if loops != 1 else ''}")
    if cmplx > 3:
        struct_parts.append(f"cyclomatic complexity {cmplx}")

    # Top-attended identifiers
    top = sorted(id_info, key=lambda x: x.attention_weight, reverse=True)[:3]
    top_names = [f"`{t.name}`" for t in top if t.attention_weight > 0]

    # Weak identifiers — low MC or NC
    # Exclude dunder methods (__init__ etc.) — low NC is expected by convention
    weak = [i for i in id_info
            if (i.features.get("MC", 1) < 0.5 or i.features.get("NC", 1) < 0.5)
            and not (i.name.startswith("__") and i.name.endswith("__"))]
    weak_names = [f"`{w.name}`" for w in weak[:3]]

    # Build text
    lines_text = [
        f"The model classified this snippet as {label.upper()} readability "
        f"with {conf}% confidence."
    ]

    if top_names:
        lines_text.append(
            f"The self-attention mechanism focused most on {', '.join(top_names)}, "
            f"indicating these identifiers had the greatest influence on the verdict."
        )

    if label == "High":
        lines_text.append(
            f"The code is concise ({', '.join(struct_parts)}) with {n_ids} identifiers "
            f"that follow standard naming conventions and carry clear meaning."
        )
        if weak_names:
            lines_text.append(
                f"Minor concern: {', '.join(weak_names)} scored lower on clarity or "
                f"naming conformance but did not outweigh the overall quality."
            )
    elif label == "Medium":
        lines_text.append(
            f"The code has moderate complexity ({', '.join(struct_parts)}) and some "
            f"identifiers are clear while others could be improved."
        )
        if weak_names:
            lines_text.append(
                f"Identifiers that could be renamed for clarity: {', '.join(weak_names)}."
            )
    else:  # Low
        lines_text.append(
            f"The code is complex ({', '.join(struct_parts)}) with {n_ids} identifiers. "
            f"Several naming and structural issues reduce readability."
        )
        if weak_names:
            lines_text.append(
                f"Identifiers with poor clarity or naming: {', '.join(weak_names)}. "
                f"Consider using more descriptive names."
            )
        else:
            lines_text.append(
                "The main issue is structural complexity rather than identifier naming. "
                "Consider breaking this into smaller functions."
            )

    return " ".join(lines_text)


# ---------------------------------------------------------------------------
# Serve the demo page
# ---------------------------------------------------------------------------

@app.get("/", response_class=HTMLResponse)
def demo_page():
    html_path = Path("static/index.html")
    if html_path.exists():
        return html_path.read_text(encoding="utf-8")
    return HTMLResponse("<h2>Place static/index.html to see the demo UI.</h2>")


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
