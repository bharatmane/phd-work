"""
Step 4 — Compute the Deceptive Readability Index (DRI) for every sample
and produce the master dataset used by analyze.py.

DRI(c) = P_High(c) × (1 − pass_ratio(c))

Usage:
    python compute_dri.py --input data/readability.jsonl \
                           --output data/dri_dataset.jsonl

Also writes:
    data/dri_dataset.csv   — same data as flat CSV for easy inspection in Excel / pandas
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


DRI_TIERS = [
    (0.0,  "safe"),
    (0.3,  "low"),
    (0.6,  "moderate"),
    (1.01, "critical"),
]


def dri_tier(dri: float) -> str:
    for threshold, label in DRI_TIERS:
        if dri < threshold:
            return label
    return "critical"


def compute(record: dict) -> dict:
    p_high     = record.get("p_high", 0.0)
    pass_ratio = record.get("pass_ratio", 0.0)
    dri        = round(p_high * (1.0 - pass_ratio), 4)
    tier       = dri_tier(dri)

    return {
        **record,
        "dri":      dri,
        "dri_tier": tier,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute DRI for all samples")
    parser.add_argument("--input",  default="data/readability.jsonl")
    parser.add_argument("--output", default="data/dri_dataset.jsonl")
    args = parser.parse_args()

    in_path  = Path(args.input)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    records = []
    with open(in_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    print(f"Computing DRI for {len(records)} records ...")
    enriched = [compute(r) for r in records if not r.get("readability_error")]
    skipped  = len(records) - len(enriched)
    if skipped:
        print(f"  Skipped {skipped} records with scoring errors")

    # Write JSONL
    with open(out_path, "w", encoding="utf-8") as f:
        for r in enriched:
            f.write(json.dumps(r) + "\n")
    print(f"JSONL: {out_path}")

    # Write flat CSV (expand features dict into columns)
    rows = []
    for r in enriched:
        flat = {k: v for k, v in r.items() if k not in ("features", "structural", "code")}
        for k, v in r.get("features", {}).items():
            flat[f"feat_{k}"] = v
        for k, v in r.get("structural", {}).items():
            flat[f"struct_{k}"] = v
        rows.append(flat)

    df = pd.DataFrame(rows)
    csv_path = out_path.with_suffix(".csv")
    df.to_csv(csv_path, index=False)
    print(f"CSV:  {csv_path}")

    # Quick summary
    print(f"\n=== Dataset Summary ===")
    print(f"Total samples : {len(df)}")
    print(f"Models        : {df['model'].nunique()} — {sorted(df['model'].unique())}")
    print(f"Benchmarks    : {sorted(df['benchmark'].unique())}")
    print(f"Correct       : {df['correct'].sum()} ({df['correct'].mean()*100:.1f}%)")
    print(f"Incorrect     : {(~df['correct']).sum()} ({(~df['correct']).mean()*100:.1f}%)")
    print(f"\nReadability distribution:")
    print(df["readability_label"].value_counts().to_string())
    print(f"\nDRI tier distribution:")
    print(df["dri_tier"].value_counts().to_string())
    print(f"\nDRI stats:")
    print(df["dri"].describe().round(4).to_string())
    print(f"\nHigh-DRI (≥0.6) samples: {(df['dri'] >= 0.6).sum()} "
          f"({(df['dri'] >= 0.6).mean()*100:.1f}%)")

    print(f"\nNext: python analyze.py --input {out_path.with_suffix('.csv')}")


if __name__ == "__main__":
    main()
