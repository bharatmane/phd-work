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
from src.ensemble_model import ECRVRMVEL
from src.features import FEATURE_NAMES, compute_features
from src.model import SABiLSTM
from src.preprocess import extract_and_normalise

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

CHECKPOINT = Path("artifacts/iraf_xadl_augmented.pt")
ECRVR_CHECKPOINT = Path("artifacts/ecrvr_mvel.pt")

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


DEMO_MODE = not CHECKPOINT.exists()
ECRVR_DEMO_MODE = not ECRVR_CHECKPOINT.exists()


def _demo_predict(code: str) -> dict:
    """Return realistic pre-computed scores when model checkpoint is absent."""
    idents = extract_and_normalise(code, "python")
    # Score readability heuristically from avg identifier token length
    avg_len = sum(len(i.raw) for i in idents) / max(len(idents), 1)
    p_high = round(min(0.97, max(0.35, (avg_len - 2) / 14)), 4)
    p_low  = round(max(0.01, 0.95 - p_high), 4)
    p_med  = round(max(0.01, 1.0 - p_high - p_low), 4)
    label  = "High" if p_high > 0.65 else "Medium" if p_high > 0.40 else "Low"
    feat_names = ["MC","NC","OL","DR","PR","LF","CC","SA","CLS","PRED"]
    feats = {n: round(p_high * (0.85 + 0.15 * (i / 9)), 3) for i, n in enumerate(feat_names)}
    struct = _compute_structural(code)
    return {
        "label": label, "confidence": p_high,
        "probabilities": {"High": p_high, "Medium": p_med, "Low": p_low},
        "identifiers": [
            {"name": id_.raw, "kind": id_.kind, "tokens": id_.tokens,
             "features": {n: round(p_high * (0.8 + 0.2 * (j/9)), 3) for j,n in enumerate(feat_names)},
             "attention_weight": round(1/max(len(idents),1), 4),
             "influence": "High" if p_high > 0.75 else "Medium"}
            for id_ in idents[:8]
        ],
        "structural": {k: round(float(v), 3) for k, v in struct.items()},
        "explanation": (
            f"[DEMO MODE — no model checkpoint] Heuristic estimate: {label} readability "
            f"({p_high*100:.1f}% confidence) based on identifier naming quality. "
            f"Deploy the trained model for accurate predictions."
        ),
        "identifier_quality_score": p_high,
        "identifier_quality_label": label,
    }


def _demo_predict_snippet(code: str) -> dict:
    """Heuristic fallback for /predict-snippet when the ECRVR-MVEL checkpoint is absent."""
    struct = _compute_structural(code)
    # Crude heuristic: shorter, simpler snippets score higher (matches the
    # training data's own bias — see DEMO_SAMPLES.md note on Paper 1).
    complexity_penalty = min(0.6, struct["cyclomatic_complexity"] / 20.0)
    length_penalty = min(0.3, struct["code_length"] / 1000.0)
    p_high = round(max(0.05, 0.9 - complexity_penalty - length_penalty), 4)
    p_low = round(max(0.05, complexity_penalty + length_penalty), 4)
    p_med = round(max(0.01, 1.0 - p_high - p_low), 4)
    label = "High" if p_high > 0.6 else "Low" if p_low > 0.45 else "Medium"
    return {
        "label": label,
        "confidence": p_high if label == "High" else (p_low if label == "Low" else p_med),
        "probabilities": {"High": p_high, "Medium": p_med, "Low": p_low},
        "branch_probabilities": {
            "gcn": {"High": p_high, "Medium": p_med, "Low": p_low},
            "dbn": {"High": p_high, "Medium": p_med, "Low": p_low},
            "bitcn": {"High": p_high, "Medium": p_med, "Low": p_low},
        },
        "ensemble_weights": {"gcn": 0.333, "dbn": 0.333, "bitcn": 0.334},
        "structural": {k: round(float(v), 3) for k, v in struct.items()},
        "methodology_note": (
            "[DEMO MODE — no ECRVR-MVEL checkpoint] Heuristic estimate from structural "
            "complexity only. Deploy artifacts/ecrvr_mvel.pt for real GCN+DBN+BiTCN ensemble inference."
        ),
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- IRAF-XADL (Paper 1) ---
    if DEMO_MODE:
        logger.warning("IRAF-XADL checkpoint not found — starting in DEMO MODE (heuristic scores only)")
        _state["demo"] = True
    else:
        logger.info("Loading checkpoint: %s", CHECKPOINT)
        ckpt = torch.load(CHECKPOINT, map_location="cpu")
        struct_dim = ckpt.get("struct_dim", 7)
        norm_stats = ckpt.get("norm_stats", {})

        model = SABiLSTM(num_classes=len(LABELS), struct_dim=struct_dim)
        model.load_state_dict(ckpt["state_dict"])
        model.eval()

        _state["model"] = model
        _state["struct_dim"] = struct_dim
        _state["norm_stats"] = norm_stats

    # Shared CodeBERT embedder — needed by IRAF-XADL (if loaded) and/or ECRVR-MVEL.
    if not DEMO_MODE or not ECRVR_DEMO_MODE:
        logger.info("Loading CodeBERT embedder...")
        _state["embedder"] = Embedder(use_codebert=True)

    # --- ECRVR-MVEL (Paper 2) ---
    if ECRVR_DEMO_MODE:
        logger.warning("ECRVR-MVEL checkpoint not found — starting in DEMO MODE (heuristic scores only)")
        _state["ecrvr_demo"] = True
    else:
        logger.info("Loading checkpoint: %s", ECRVR_CHECKPOINT)
        eckpt = torch.load(ECRVR_CHECKPOINT, map_location="cpu")
        ecrvr_model = ECRVRMVEL(struct_dim=eckpt.get("struct_dim", 7), num_classes=len(LABELS))
        ecrvr_model.load_state_dict(eckpt["state_dict"])
        ecrvr_model.eval()

        _state["ecrvr_model"] = ecrvr_model
        _state["ecrvr_struct_stats"] = eckpt.get("struct_stats", {})
        _state["ecrvr_max_tokens"] = eckpt.get("max_tokens", 80)
        _state["ecrvr_metrics"] = eckpt.get("metrics", {})

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


class BatchPredictRequest(BaseModel):
    samples: list[PredictRequest]


class DriRequest(BaseModel):
    code: str
    language: str = "python"
    pass_ratio: float | None = None   # 0.0–1.0; None = unknown


class DriResponse(BaseModel):
    readability_label: str
    readability_confidence: float
    p_high: float
    p_medium: float
    p_low: float
    pass_ratio: float | None
    dri: float | None                 # None when pass_ratio unknown
    dri_tier: str                     # "unknown" | "safe" | "low" | "moderate" | "critical"
    dri_message: str
    identifier_quality_score: float
    features: dict[str, float]        # mean of each of the 10 params across identifiers
    explanation: str


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


class SnippetPredictRequest(BaseModel):
    code: str
    language: str = "python"   # ECRVR-MVEL v1 is Python-only; see Paper2SamplesPage


class SnippetPredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict[str, float]
    branch_probabilities: dict[str, dict[str, float]]   # gcn / dbn / bitcn -> {High,Medium,Low}
    ensemble_weights: dict[str, float]                  # learned weighted-voting weights
    structural: dict[str, float]
    methodology_note: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": not _state.get("demo", False),
        "demo_mode": _state.get("demo", False),
        "ecrvr_model_loaded": not _state.get("ecrvr_demo", False),
        "ecrvr_demo_mode": _state.get("ecrvr_demo", False),
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if _state.get("demo"):
        d = _demo_predict(req.code)
        return PredictResponse(**d)
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


@app.post("/batch")
def batch_predict(req: BatchPredictRequest) -> list[PredictResponse]:
    """Score multiple code samples in one call. Returns results in the same order."""
    return [predict(s) for s in req.samples]


@app.post("/predict-snippet", response_model=SnippetPredictResponse)
def predict_snippet(req: SnippetPredictRequest):
    """
    ECRVR-MVEL (Paper 2) — snippet-level readability via a weighted-voting
    ensemble of GCN, DBN, and Bi-TCN branches over a CodeBERT token sequence.

    This is a freshly-trained, simplified reimplementation (see
    src/ensemble_model.py docstring for the documented DBN simplification),
    not the exact published model — accuracy will differ from the paper's
    98.15%/98.38%. Python-only in this version.
    """
    if _state.get("ecrvr_demo"):
        return SnippetPredictResponse(**_demo_predict_snippet(req.code))
    if "ecrvr_model" not in _state:
        raise HTTPException(503, "ECRVR-MVEL model not loaded yet.")

    code = req.code.strip()
    if not code:
        raise HTTPException(400, "code must not be empty.")

    model: ECRVRMVEL = _state["ecrvr_model"]
    embedder: Embedder = _state["embedder"]
    struct_stats: dict = _state["ecrvr_struct_stats"]
    max_tokens: int = _state["ecrvr_max_tokens"]

    seq = embedder.encode_sequence(code, max_length=max_tokens)
    mask = (np.abs(seq).sum(axis=-1) > 0).astype(np.float32)

    raw_struct = _compute_structural(code)
    struct_vec = (
        _normalize_structural(raw_struct, struct_stats) if struct_stats
        else np.zeros(7, dtype=np.float32)
    )

    with torch.no_grad():
        seq_t = torch.from_numpy(seq).float().unsqueeze(0)
        mask_t = torch.from_numpy(mask).float().unsqueeze(0)
        struct_t = torch.from_numpy(struct_vec).float().unsqueeze(0)

        branch_probs = model.branch_probs(seq_t, struct_t, mask_t)
        log_probs = model(seq_t, struct_t, mask_t)
        probs = torch.exp(log_probs).squeeze(0).numpy()

    pred_idx = int(np.argmax(probs))
    pred_label = LABELS[pred_idx]

    branch_out = {
        branch: {l: round(float(p), 4) for l, p in zip(LABELS, vals.squeeze(0).numpy())}
        for branch, vals in branch_probs.items()
    }

    metrics = _state.get("ecrvr_metrics", {})
    acc_note = (
        f"This run's held-out test accuracy was {metrics['accuracy']*100:.1f}%."
        if metrics.get("accuracy") else ""
    )

    return SnippetPredictResponse(
        label=pred_label,
        confidence=round(float(probs[pred_idx]), 4),
        probabilities={l: round(float(p), 4) for l, p in zip(LABELS, probs)},
        branch_probabilities=branch_out,
        ensemble_weights=model.ensemble_weights(),
        structural={k: round(float(v), 3) for k, v in raw_struct.items()},
        methodology_note=(
            "Live inference from a freshly-trained, simplified reimplementation of "
            "ECRVR-MVEL (GCN+DBN+BiTCN weighted ensemble) — not the exact published model. "
            f"{acc_note} The DBN branch is trained end-to-end by backprop rather than "
            "CD-pretrained RBM layers (documented simplification)."
        ),
    )


@app.post("/dri", response_model=DriResponse)
def compute_dri(req: DriRequest):
    """
    Compute Deceptive Readability Index for a code sample.

    DRI = P_High × (1 − pass_ratio)

    If pass_ratio is omitted the DRI is not computed but readability scores
    are still returned — useful for the interactive website demo.
    """
    result = predict(PredictRequest(code=req.code, language=req.language))

    p_high = result.probabilities.get("High", 0.0)
    p_medium = result.probabilities.get("Medium", 0.0)
    p_low = result.probabilities.get("Low", 0.0)

    if req.pass_ratio is not None:
        dri = round(p_high * (1.0 - req.pass_ratio), 4)
        if dri == 0.0:
            tier = "safe"
            msg = "No deception risk — code is either unreadable or fully correct."
        elif dri < 0.3:
            tier = "low"
            msg = "Low deception risk. High readability but minor test failures."
        elif dri < 0.6:
            tier = "moderate"
            msg = "Moderate deception risk. Readable code failing a significant share of tests."
        else:
            tier = "critical"
            msg = (
                f"Critical deception risk (DRI={dri:.2f}). "
                "This code scores HIGH readability but fails most tests — "
                "a human reviewer may trust it without adequate verification."
            )
    else:
        dri = None
        tier = "unknown"
        msg = (
            f"Readability scored as {result.label} ({result.confidence*100:.1f}% confidence). "
            "Provide pass_ratio to compute the full DRI."
        )

    # Mean of each feature across identifiers
    mean_features: dict[str, float] = {}
    if result.identifiers:
        for fname in FEATURE_NAMES:
            vals = [id_.features.get(fname, 0.0) for id_ in result.identifiers]
            mean_features[fname] = round(sum(vals) / len(vals), 4)

    return DriResponse(
        readability_label=result.label,
        readability_confidence=result.confidence,
        p_high=round(p_high, 4),
        p_medium=round(p_medium, 4),
        p_low=round(p_low, 4),
        pass_ratio=req.pass_ratio,
        dri=dri,
        dri_tier=tier,
        dri_message=msg,
        identifier_quality_score=result.identifier_quality_score,
        features=mean_features,
        explanation=result.explanation,
    )


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
