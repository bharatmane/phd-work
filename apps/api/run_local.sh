#!/usr/bin/env bash
# One-shot local validation for IRAF-XADL.
# Installs dependencies, runs the demo (no training), then trains briefly
# on the bundled sample data and runs the demo again with the checkpoint.
set -e

cd "$(dirname "$0")"

echo "=== installing dependencies ==="
pip install -r requirements.txt

echo
echo "=== demo (untrained, fallback embedder for speed) ==="
python demo.py --no-codebert --no-shap

echo
echo "=== quick training (5 epochs, fallback embedder) ==="
python train.py --no-codebert --epochs 5 \
                --data data/sample_python.csv --language python \
                --save artifacts/iraf_xadl_python.pt

echo
echo "=== demo with trained checkpoint + SHAP ==="
python demo.py --no-codebert --checkpoint artifacts/iraf_xadl_python.pt --sample 0

echo
echo "All local checks passed. To use real CodeBERT, re-run without --no-codebert."
