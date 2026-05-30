"""End-to-end IRAF-XADL demo.

Runs the full pipeline on the bundled sample dataset without requiring any
training: extracts identifiers, computes the 10 features, runs CodeBERT
(or the fallback embedder), passes the result through an untrained SA-BiLSTM,
and prints a SHAP explanation for one sample.

To get real (trained) predictions, run `python train.py` first, then this
script with `--checkpoint artifacts/iraf_xadl.pt`.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import numpy as np
import torch

# Allow `python demo.py` from inside the project folder
sys.path.insert(0, str(Path(__file__).parent))

from src.dataset import CodeReadabilityDataset, LABELS
from src.embeddings import Embedder
from src.explain import explain_sample, format_explanation
from src.features import FEATURE_NAMES, compute_features
from src.model import SABiLSTM
from src.preprocess import extract_and_normalise


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the IRAF-XADL pipeline end-to-end.")
    parser.add_argument("--data", default="data/sample_python.csv")
    parser.add_argument("--language", default="python", choices=["python", "cpp"])
    parser.add_argument("--no-codebert", action="store_true",
                        help="Skip the CodeBERT download; use hash-based fallback embedder.")
    parser.add_argument("--checkpoint", default=None,
                        help="Optional .pt file produced by train.py")
    parser.add_argument("--sample", type=int, default=0,
                        help="Index of the snippet to explain.")
    parser.add_argument("--no-shap", action="store_true",
                        help="Skip the SHAP step (faster).")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")

    # 1. Preprocessing / feature demo on the chosen snippet ---------------
    import pandas as pd
    df = pd.read_csv(args.data)
    if not (0 <= args.sample < len(df)):
        sys.exit(f"--sample must be 0..{len(df) - 1}")
    code = df.iloc[args.sample]["code"]
    true_label = df.iloc[args.sample]["readability_level"]

    print("\n" + "=" * 72)
    print(f"SAMPLE #{args.sample}  (true label: {true_label})")
    print("=" * 72)
    print(code)
    print("=" * 72)

    idents = extract_and_normalise(code, args.language)
    print(f"\nExtracted {len(idents)} identifier(s):")
    for ident in idents[:12]:
        print(f"  {ident.kind:<10}  {ident.raw:<25}  ->  {ident.tokens}")

    feats_matrix = compute_features(idents)
    print("\nPer-identifier feature matrix (rows = identifiers, cols = features):")
    print("  " + "  ".join(f"{n:>5}" for n in FEATURE_NAMES))
    for ident, row in zip(idents[:8], feats_matrix[:8]):
        print(f"  " + "  ".join(f"{v:5.2f}" for v in row) + f"   {ident.raw}")

    # 2. Build the dataset (so the demo also exercises the loader) --------
    print("\nLoading dataset (this also pre-computes embeddings)...")
    embedder = Embedder(use_codebert=not args.no_codebert)
    print(f"Embedder in use: {embedder.name}")
    ds = CodeReadabilityDataset(args.data, args.language, embedder=embedder)
    print(f"Dataset size: {len(ds)}  (labels: {LABELS})")

    sample = ds[args.sample]
    embed = sample["embed"].numpy()
    feats = sample["feats"].numpy()
    print(f"Snippet embedding shape: {embed.shape}     "
          f"feature vector shape: {feats.shape}")

    # 3. Build / load the SA-BiLSTM ---------------------------------------
    struct_dim = getattr(ds, "struct_dim", 0)
    struct = None
    if "struct" in sample:
        struct = sample["struct"].numpy()
        print(f"Structural features: {struct_dim} columns  {struct}")

    if args.checkpoint:
        ckpt = torch.load(args.checkpoint, map_location="cpu")
        ckpt_struct_dim = ckpt.get("struct_dim", 0)
        model = SABiLSTM(num_classes=len(LABELS), struct_dim=ckpt_struct_dim)
        model.load_state_dict(ckpt["state_dict"])
        print(f"Loaded checkpoint: {args.checkpoint}  (struct_dim={ckpt_struct_dim})")
    else:
        model = SABiLSTM(num_classes=len(LABELS), struct_dim=struct_dim)
        print("Using untrained model - accuracy will be random. "
              "Run `python train.py` first for meaningful predictions.")

    # 4. Forward pass ------------------------------------------------------
    struct_t = torch.from_numpy(struct).float().unsqueeze(0) if struct is not None else None
    with torch.no_grad():
        logits = model(torch.from_numpy(embed).float().unsqueeze(0),
                       torch.from_numpy(feats).float().unsqueeze(0),
                       struct_t)
        probs = torch.softmax(logits, dim=-1).squeeze(0).numpy()
    pred = int(np.argmax(probs))
    print("\nPrediction:")
    for label, p in zip(LABELS, probs):
        marker = " <- predicted" if LABELS[pred] == label else ""
        print(f"   {label:<8}  P = {p:.3f}{marker}")

    # 5. SHAP explanation --------------------------------------------------
    if args.no_shap:
        return

    # SHAP operates on the mean identifier features (snippet-level summary)
    mean_embed = embed.mean(axis=0)   # (768,)
    mean_feats = feats.mean(axis=0)   # (10,)
    print("\nComputing SHAP explanation (this may take ~10s)...")
    expl = explain_sample(model, embed=mean_embed, feats=mean_feats, nsamples=128)
    print("\n" + format_explanation(expl, LABELS))


if __name__ == "__main__":
    main()
