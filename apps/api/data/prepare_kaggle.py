"""Convert the Kaggle dataset to the format expected by IRAF-XADL.

Kaggle dataset: https://www.kaggle.com/datasets/paakhim10/code-snippets-insights-and-readability

HOW TO DOWNLOAD:
  Option A — Kaggle CLI (once only):
      pip install kaggle
      # Put your kaggle.json at C:\\Users\\<you>\\.kaggle\\kaggle.json
      kaggle datasets download paakhim10/code-snippets-insights-and-readability -p data/
      Expand-Archive data/code-snippets-insights-and-readability.zip -DestinationPath data/

  Option B — Browser:
      Go to the URL above, click Download, unzip into data/

Usage (after downloading):
    python data/prepare_kaggle.py --input data/<filename>.csv --out data/kaggle_python.csv
    python data/prepare_kaggle.py --input data/<filename>.csv --out data/kaggle_python.csv --show-columns
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import pandas as pd


LABELS = ["Low", "Medium", "High"]

# Map of possible column name variants to our standard names.
_CODE_ALIASES = [
    "code", "Code", "code_snippet", "snippet", "Snippet",
    "source_code", "source", "content", "text",
]
_LABEL_ALIASES = [
    "readability_level", "Readability_Level", "readability", "Readability",
    "label", "Label", "class", "Class", "rating", "Rating",
]


def find_column(df: pd.DataFrame, aliases: list[str]) -> str | None:
    for alias in aliases:
        if alias in df.columns:
            return alias
    return None


def map_to_label(series: pd.Series) -> pd.Series:
    """Convert numeric scores or free-text to Low/Medium/High."""
    first = series.dropna().iloc[0] if not series.dropna().empty else None
    if first is None:
        raise ValueError("Label column is empty.")

    # Already one of our labels
    if str(first) in LABELS:
        return series.astype(str)

    # Numeric 0-1 or 1-5 etc.
    try:
        numeric = pd.to_numeric(series, errors="raise")
        lo, hi = numeric.min(), numeric.max()
        if lo >= 0 and hi <= 1:
            bins = [lo - 0.001, lo + (hi - lo) / 3, lo + 2 * (hi - lo) / 3, hi + 0.001]
        elif lo >= 1 and hi <= 5:
            bins = [-0.001, 2.33, 3.67, 5.001]
        elif lo >= 0 and hi <= 10:
            bins = [-0.001, 3.33, 6.67, 10.001]
        else:
            bins = [lo - 0.001,
                    lo + (hi - lo) / 3,
                    lo + 2 * (hi - lo) / 3,
                    hi + 0.001]
        return pd.cut(numeric, bins=bins, labels=LABELS).astype(str)
    except (ValueError, TypeError):
        pass

    # Try upper-case normalisation ("low" -> "Low")
    mapped = series.str.strip().str.capitalize()
    valid = mapped.isin(LABELS)
    if valid.mean() > 0.8:
        return mapped.where(valid, other=None)

    raise ValueError(
        f"Cannot map label column values to Low/Medium/High. "
        f"Sample values: {series.unique()[:10].tolist()}"
    )


def main() -> None:
    p = argparse.ArgumentParser(description="Prepare Kaggle dataset for IRAF-XADL.")
    p.add_argument("--input", required=True, help="Path to the downloaded Kaggle CSV.")
    p.add_argument("--out", required=True, help="Output CSV path.")
    p.add_argument("--show-columns", action="store_true",
                   help="Print column names and a few rows, then exit.")
    p.add_argument("--code-col", help="Override auto-detected code column name.")
    p.add_argument("--label-col", help="Override auto-detected label column name.")
    p.add_argument("--language", choices=["python", "cpp"], default="python")
    p.add_argument("--min-len", type=int, default=60,
                   help="Drop snippets shorter than this many characters.")
    p.add_argument("--max-len", type=int, default=2000,
                   help="Drop snippets longer than this many characters.")
    args = p.parse_args()

    df = pd.read_csv(args.input)

    if args.show_columns:
        print("Columns:", df.columns.tolist())
        print(f"\nShape: {df.shape}")
        print("\nFirst 3 rows:")
        print(df.head(3).to_string())
        sys.exit(0)

    code_col = args.code_col or find_column(df, _CODE_ALIASES)
    label_col = args.label_col or find_column(df, _LABEL_ALIASES)

    if code_col is None:
        print(f"ERROR: Cannot find a code column. Columns: {df.columns.tolist()}")
        print("Use --code-col <name> to specify it manually.")
        sys.exit(1)
    if label_col is None:
        print(f"ERROR: Cannot find a label column. Columns: {df.columns.tolist()}")
        print("Use --label-col <name> to specify it manually.")
        sys.exit(1)

    print(f"Using code column  : '{code_col}'")
    print(f"Using label column : '{label_col}'")

    out_df = pd.DataFrame()
    out_df["code"] = df[code_col].astype(str)
    out_df["readability_level"] = map_to_label(df[label_col])

    # Filter by length and valid label
    before = len(out_df)
    out_df = out_df[
        out_df["code"].str.len().between(args.min_len, args.max_len) &
        out_df["readability_level"].isin(LABELS)
    ].reset_index(drop=True)
    print(f"Filtered {before - len(out_df)} rows (length or invalid label). Kept: {len(out_df)}")
    print("Label distribution:\n" + out_df["readability_level"].value_counts().to_string())

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    out_df.to_csv(args.out, index=False)
    print(f"\nSaved to {args.out}")
    print("\nNext step:")
    print(f"  python train.py --data {args.out} --language {args.language} "
          f"--epochs 100 --batch-size 32 --save artifacts/iraf_xadl_kaggle.pt")


if __name__ == "__main__":
    main()
