"""
Step 1 — Download EvalPlus datasets and pre-generated LLM solutions.

Usage:
    python download_evalplus.py --output data/evalplus

Outputs:
    data/evalplus/humaneval_plus.jsonl   — HumanEval+ problems with test cases
    data/evalplus/mbpp_plus.jsonl        — MBPP+ problems with test cases
    data/evalplus/solutions/             — Pre-generated solutions per model
        {model_name}/humaneval.jsonl
        {model_name}/mbpp.jsonl
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.request
import zipfile
from pathlib import Path

from datasets import load_dataset
from tqdm import tqdm

# EvalPlus v0.1.0 GitHub release — pre-generated solutions (free, no API needed)
# These are the models available in the public release
EVALPLUS_RELEASE_URL = "https://github.com/evalplus/evalplus/releases/download/v0.1.0"

AVAILABLE_MODELS = {
    "codellama-7b-python":    "codellama_7b_python_temp_0.2.zip",
    "codellama-13b-python":   "codellama_13b_python_temp_0.2.zip",
    "codellama-34b-python":   "codellama_34b_python_temp_0.2.zip",
    "wizardcoder-34b":        "wizardcoder_34b_temp_0.2.zip",
    "starcoder2-15b":         "starcoder2_15b_temp_0.2.zip",
}

# Use these 5 models for the study (spans capability range)
STUDY_MODELS = [
    "codellama-7b-python",
    "codellama-13b-python",
    "codellama-34b-python",
    "wizardcoder-34b",
    "starcoder2-15b",
]


def download_file(url: str, dest: Path, desc: str = "") -> Path:
    """Download a file with a progress bar."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  [skip] {dest.name} already exists")
        return dest
    print(f"  Downloading {desc or dest.name} ...")
    urllib.request.urlretrieve(url, dest)
    print(f"  Saved → {dest}")
    return dest


def download_hf_dataset(name: str, dest: Path) -> None:
    """Download a Hugging Face dataset and save as JSONL."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        print(f"  [skip] {dest.name} already exists")
        return
    print(f"  Loading {name} from Hugging Face ...")
    ds = load_dataset(name, split="test")
    records = [row for row in ds]
    with open(dest, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec) + "\n")
    print(f"  {len(records)} problems saved → {dest}")


def extract_solutions(zip_path: Path, dest_dir: Path, model_name: str) -> None:
    """Extract pre-generated solutions from EvalPlus release zip."""
    model_dir = dest_dir / model_name
    model_dir.mkdir(parents=True, exist_ok=True)
    print(f"  Extracting {zip_path.name} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(model_dir)
    print(f"  Extracted → {model_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Download EvalPlus datasets and solutions")
    parser.add_argument("--output", default="data/evalplus", help="Output directory")
    parser.add_argument("--models", nargs="+", default=STUDY_MODELS,
                        choices=list(AVAILABLE_MODELS.keys()),
                        help="Which model solutions to download")
    args = parser.parse_args()

    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)

    print("\n=== Step 1: Download benchmark problems ===")
    download_hf_dataset("evalplus/humanevalplus", out / "humaneval_plus.jsonl")
    download_hf_dataset("evalplus/mbppplus",      out / "mbpp_plus.jsonl")

    print("\n=== Step 2: Download pre-generated LLM solutions ===")
    zips_dir = out / "_zips"
    zips_dir.mkdir(exist_ok=True)
    solutions_dir = out / "solutions"

    for model_name in args.models:
        filename = AVAILABLE_MODELS.get(model_name)
        if not filename:
            print(f"  [warn] No release file for {model_name}, skipping")
            continue
        url = f"{EVALPLUS_RELEASE_URL}/{filename}"
        zip_path = zips_dir / filename
        try:
            download_file(url, zip_path, desc=model_name)
            extract_solutions(zip_path, solutions_dir, model_name)
        except Exception as e:
            print(f"  [error] Failed to download {model_name}: {e}")
            print(f"  → You can manually download from: {url}")

    print("\n=== Download complete ===")
    print(f"Problems  : {out}/humaneval_plus.jsonl")
    print(f"Problems  : {out}/mbpp_plus.jsonl")
    print(f"Solutions : {out}/solutions/{{model}}/")
    print("\nNext: python run_correctness.py --data", args.output)


if __name__ == "__main__":
    main()
