# IRAF-XADL — Working Demo

Reference implementation of the framework described in:

> **Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling**
> Bharat Babaso Mane, Dr. Rathnakar Achary — Alliance University

This is a **runnable end-to-end demo** of the IRAF-XADL pipeline:
syntax-aware identifier extraction → 10 readability features → CodeBERT embeddings →
Self-Attention BiLSTM classifier → AdamW optimisation → SHAP explainability.

## Project layout

```
IRAF_XADL_Demo/
├── README.md
├── requirements.txt
├── demo.py                 # one-shot end-to-end demo (no training needed)
├── train.py                # full training entry point with CLI flags
├── data/
│   ├── sample_python.csv   # 30 labelled Python snippets (bundled)
│   ├── sample_cpp.csv      # 30 labelled C++ snippets (bundled)
│   └── fetch_data.py       # optional — pulls more data from GitHub
├── src/
│   ├── preprocess.py       # AST-based identifier extraction + normalisation
│   ├── features.py         # the 10 readability features (MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED)
│   ├── embeddings.py       # CodeBERT wrapper
│   ├── model.py            # Self-Attention BiLSTM
│   ├── dataset.py          # PyTorch Dataset
│   ├── trainer.py          # AdamW training loop with metrics
│   └── explain.py          # SHAP wrapper
└── artifacts/              # trained checkpoints + SHAP plots land here
```

## Quick start (30 seconds, no training)

```bash
cd IRAF_XADL_Demo
pip install -r requirements.txt
python demo.py
```

This loads the sample dataset, extracts identifiers, computes the 10 features for a
handful of snippets, runs them through an untrained SA-BiLSTM forward pass, and prints
the SHAP explanation for the highest-confidence prediction. It runs on CPU in under a minute.

> The first run downloads `microsoft/codebert-base` (~500 MB). Use `--no-codebert`
> if you only want to see the features + classifier mechanics.

## Full training run

```bash
python train.py --epochs 50 --batch-size 32 --lr 1e-3 \
                --train-split 0.7 --data data/sample_python.csv \
                --save artifacts/iraf_xadl_python.pt
```

For real numbers, swap in the Kaggle dataset (`data_python.csv`, `data_CPP.csv`) at
https://www.kaggle.com/datasets/paakhim10/code-snippets-insights-and-readability.

## Getting more data

```bash
python data/fetch_data.py --language python --target-count 500 --out data/big_python.csv
```

This scrapes Python snippets from a configurable list of popular GitHub repos,
auto-labels them with a readability heuristic (line length, identifier scores,
comment density), and writes a CSV in the same schema as the bundled samples.

## Mapping to the paper

| Paper section            | Implementation                                  |
| ------------------------ | ----------------------------------------------- |
| 3.1 Preprocessing        | `src/preprocess.py`                             |
| 3.2 Ten features         | `src/features.py`                               |
| 3.3 CodeBERT embeddings  | `src/embeddings.py`                             |
| 3.4 SA-BiLSTM            | `src/model.py`                                  |
| 3.5 AdamW optimisation   | `src/trainer.py` (uses `torch.optim.AdamW`)     |
| 3.6 SHAP explainability  | `src/explain.py`                                |

Hyperparameters match Paper 1 Table 2 by default (max seq len 50, BiLSTM 3 layers / 128 hidden / dropout 0.3, attention 4 heads / dim 128, dense 64 ReLU, AdamW lr 1e-3 / wd 0.01, batch 32, 100 epochs, gradient clipping 1.0).

## Notes and honest caveats

- Python identifier extraction uses the standard-library `ast` module — robust.
- C++ identifier extraction uses a pragmatic regex pass that captures classes, functions, parameters, and variables. For production use, swap in `tree-sitter` (drop-in interface in `preprocess.py`).
- The bundled sample dataset is too small for meaningful accuracy numbers; it exists so the pipeline runs immediately. Use the Kaggle dataset (or `fetch_data.py`) for real training.
- The Predictability (PRED) feature uses CodeBERT's masked-LM head when available, and falls back to a token-frequency proxy otherwise.
