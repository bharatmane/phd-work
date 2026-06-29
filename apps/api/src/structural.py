"""Snippet-level structural features shared between training (ECRVR-MVEL) and
live inference (`api.py`'s `/predict-snippet`).

These are the same 7 features as the `*_norm` columns in `data/kaggle_augmented.csv`,
but recomputed from raw code here rather than read from the CSV: the CSV's original
normalisation min/max are not recoverable, so live inference on new, unseen code
needs its own self-consistent compute+normalize pipeline. Min/max stats are fit on
the training split and saved into the checkpoint (mirrors Paper 1's `norm_stats`
pattern in `api.py`).
"""

from __future__ import annotations

import ast
import re

import numpy as np

FEATURE_NAMES = [
    "num_of_lines", "code_length", "cyclomatic_complexity",
    "indents", "loop_count", "line_length", "identifiers",
]


def compute_structural(code: str) -> dict[str, float]:
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


def fit_stats(raw_dicts: list[dict[str, float]]) -> dict[str, dict[str, float]]:
    """Compute per-feature min/max from a list of raw structural dicts (fit on train split)."""
    stats: dict[str, dict[str, float]] = {}
    for name in FEATURE_NAMES:
        values = [r[name] for r in raw_dicts]
        stats[name] = {"min": float(min(values)), "max": float(max(values))}
    return stats


def normalize_structural(raw: dict[str, float], stats: dict) -> np.ndarray:
    """Normalise raw structural features using fitted min/max stats."""
    vec = []
    for name in FEATURE_NAMES:
        lo = stats[name]["min"]
        hi = stats[name]["max"]
        val = float(np.clip((raw[name] - lo) / max(hi - lo, 1e-6), 0.0, 1.0))
        vec.append(val)
    return np.array(vec, dtype=np.float32)
