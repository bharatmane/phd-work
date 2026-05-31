# apps/api — FastAPI readability prediction API

**Stack:** FastAPI, Uvicorn, PyTorch 2, HuggingFace Transformers (CodeBERT), SHAP, scikit-learn

Full implementation docs: `README.md`. This file is a quick orientation.

## Entry & artifact

- Entry: `api.py` → `python api.py` → http://localhost:8000
- Model artifact: `artifacts/iraf_xadl_augmented.pt` (loaded at startup via lifespan)
- Env var: `CHECKPOINT_PATH=artifacts/iraf_xadl_augmented.pt`

## src/ modules

| File | Purpose |
|------|---------|
| `preprocess.py` | AST identifier extraction (Python), regex (C++), normalization |
| `features.py` | 10 readability features: MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED |
| `embeddings.py` | CodeBERT 768-dim embeddings (fallback: hash-based) |
| `model.py` | SABiLSTM: projection → BiLSTM (3 layers, 128 units) → attention → Dense |
| `trainer.py` | AdamW training loop with gradient clipping |
| `explain.py` | SHAP wrapper |
| `dataset.py` | PyTorch Dataset (CodeReadabilityDataset) |

## Endpoints

```
GET  /health    → {"status": "ok", "model_loaded": bool}
POST /predict   → {code, language} → {label, confidence, probabilities,
                   identifiers[{name, features, attention_weight, influence}],
                   structural, explanation}
```

## Data files (data/)

- `sample_python.csv`, `sample_cpp.csv` — bundled for quick demo
- `data_python.csv` (~1.3 MB, Kaggle), `kaggle_augmented.csv`, `github_python.csv`
- `fetch_data.py` — GitHub scraper; `prepare_kaggle.py` — Kaggle processor

## Common commands

```bash
python api.py               # start server
python demo.py              # end-to-end sanity check (~30s, no training)
python train.py --epochs 10 # full training run
```
