"""
Step 3 — Batch-score all code samples through the IRAF-XADL API (/batch endpoint).

Usage:
    # Start the API first:  python ../api.py
    python score_readability.py --input data/correctness.jsonl \
                                 --output data/readability.jsonl \
                                 --api http://localhost:8000

Output JSONL schema per line (correctness record + readability fields):
    {
      "model": ..., "benchmark": ..., "task_id": ..., "code": ...,
      "pass_ratio": ..., "correct": ...,
      "readability_label": "High|Medium|Low",
      "p_high": 0.91, "p_medium": 0.07, "p_low": 0.02,
      "confidence": 0.91,
      "identifier_quality_score": 0.82,
      "features": {"MC": 0.85, "NC": 0.92, ..., "PRED": 0.67},
      "structural": {"num_of_lines": 8, "cyclomatic_complexity": 3, ...}
    }
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

import requests
from tqdm import tqdm

BATCH_SIZE = 50        # samples per /batch call
RETRY_LIMIT = 3
RETRY_DELAY = 2.0


def load_records(path: Path) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def score_batch(samples: list[dict], api_url: str) -> list[dict | None]:
    """POST a batch to /batch; returns list of prediction dicts (or None on failure)."""
    payload = {"samples": [{"code": s["code"], "language": "python"} for s in samples]}
    for attempt in range(RETRY_LIMIT):
        try:
            resp = requests.post(f"{api_url}/batch", json=payload, timeout=120)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            if attempt < RETRY_LIMIT - 1:
                time.sleep(RETRY_DELAY * (attempt + 1))
            else:
                print(f"\n  [error] Batch failed after {RETRY_LIMIT} attempts: {e}")
                return [None] * len(samples)
    return [None] * len(samples)


def merge(record: dict, prediction: dict | None) -> dict:
    """Merge a correctness record with its readability prediction."""
    if prediction is None:
        return {**record, "readability_error": True}

    # Extract mean features across identifiers
    feat_means: dict[str, float] = {}
    for id_info in prediction.get("identifiers", []):
        for k, v in id_info.get("features", {}).items():
            feat_means[k] = feat_means.get(k, 0.0) + v
    n = max(len(prediction.get("identifiers", [])), 1)
    feat_means = {k: round(v / n, 4) for k, v in feat_means.items()}

    probs = prediction.get("probabilities", {})
    return {
        **record,
        "readability_label":        prediction.get("label"),
        "p_high":                   round(probs.get("High", 0.0), 4),
        "p_medium":                 round(probs.get("Medium", 0.0), 4),
        "p_low":                    round(probs.get("Low", 0.0), 4),
        "confidence":               round(prediction.get("confidence", 0.0), 4),
        "identifier_quality_score": round(prediction.get("identifier_quality_score", 0.0), 4),
        "features":                 feat_means,
        "structural":               prediction.get("structural", {}),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Score code samples with IRAF-XADL")
    parser.add_argument("--input",  default="data/correctness.jsonl")
    parser.add_argument("--output", default="data/readability.jsonl")
    parser.add_argument("--api",    default="http://localhost:8000")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    parser.add_argument("--resume", action="store_true",
                        help="Skip task_ids already present in output file")
    args = parser.parse_args()

    # Health check
    try:
        resp = requests.get(f"{args.api}/health", timeout=10)
        resp.raise_for_status()
        print(f"API healthy: {resp.json()}")
    except Exception as e:
        print(f"Cannot reach API at {args.api}: {e}")
        print("Start the API with:  python ../api.py")
        sys.exit(1)

    records = load_records(Path(args.input))
    print(f"Loaded {len(records)} records from {args.input}")

    # Resume support — skip already-scored records
    done_ids: set[str] = set()
    out_path = Path(args.output)
    if args.resume and out_path.exists():
        for row in load_records(out_path):
            done_ids.add(f"{row['model']}:{row['task_id']}")
        print(f"Resuming — {len(done_ids)} records already scored, skipping")
    records = [r for r in records
               if f"{r['model']}:{r['task_id']}" not in done_ids]
    print(f"Scoring {len(records)} remaining records ...")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    mode = "a" if args.resume else "w"

    scored = 0
    errors = 0
    with open(out_path, mode, encoding="utf-8") as out_f:
        batches = [records[i:i + args.batch_size]
                   for i in range(0, len(records), args.batch_size)]
        for batch in tqdm(batches, desc="Scoring batches"):
            predictions = score_batch(batch, args.api)
            for record, pred in zip(batch, predictions):
                merged = merge(record, pred)
                out_f.write(json.dumps(merged) + "\n")
                if pred is None:
                    errors += 1
                else:
                    scored += 1

    print(f"\nScored: {scored}  Errors: {errors}")
    print(f"Output: {out_path}")
    print(f"\nNext: python compute_dri.py --input {out_path}")


if __name__ == "__main__":
    main()
