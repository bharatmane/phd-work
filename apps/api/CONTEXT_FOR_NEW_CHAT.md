# Project Context — IRAF-XADL Working Demo

Paste this whole file into a new chat (VS Code Copilot, Cursor, ChatGPT, etc.)
so the next assistant has everything it needs.

---

## Who I am and what I'm doing

I'm Bharat Babaso Mane, a PhD scholar at Alliance University, Bengaluru, supervised by Dr. Rathnakar Achary. My thesis is on **program comprehension**, with three papers as the core contribution:

1. **Paper 1 — IRAF-XADL** (status: accepted, in publication). *Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling*. The unit of analysis is the identifier. Architecture: AST extractor → 10 readability features → CodeBERT → Self-Attention BiLSTM → AdamW → SHAP.
2. **Paper 2 — ECRVR-MVEL** (status: accepted). *Explainable Hybrid Ensemble Learning based Automated Code Comprehension Prediction*. Unit: code snippet. Architecture: CodeBERT → weighted majority vote of GCN + DBN + BiTCN → Nadam → LIME.
3. **Paper 3 — EESQA-DELMOA** (status: to submit). *Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment*. Unit: developer. Architecture: min-max → BAHB feature selection → Simplified SNN → AMBOA tuning.

The thread: identifier (P1) → snippet (P2) → developer (P3).

## What's already in this folder

```
IRAF_XADL_Demo/
├── README.md
├── CONTEXT_FOR_NEW_CHAT.md      ← this file
├── requirements.txt
├── run_local.sh                 ← one-shot Linux/Mac local validation
├── run_local.bat                ← same for Windows
├── demo.py                      ← end-to-end demo, no training needed
├── train.py                     ← full training CLI
├── data/
│   ├── sample_python.csv        ← 30 labelled Python snippets (10/10/10)
│   ├── sample_cpp.csv           ← 30 labelled C++ snippets (10/10/10)
│   └── fetch_data.py            ← optional GitHub scraper + auto-labeller
├── src/
│   ├── __init__.py
│   ├── preprocess.py            ← Paper 1 §3.1 — AST extraction + normalisation
│   ├── features.py              ← Paper 1 §3.2 — the 10 features (MC,NC,OL,DR,PR,LF,CC,SA,CLS,PRED)
│   ├── embeddings.py            ← Paper 1 §3.3 — CodeBERT wrapper + hash fallback
│   ├── model.py                 ← Paper 1 §3.4 — SA-BiLSTM (3L/128H/4-head attn/64 dense)
│   ├── dataset.py               ← PyTorch Dataset; lazy torch import for sandbox safety
│   ├── trainer.py               ← Paper 1 §3.5 — AdamW + Acc/P/R/F1/AUC
│   └── explain.py               ← Paper 1 §3.6 — SHAP KernelExplainer
└── artifacts/                   ← trained checkpoints land here
```

## What's verified to work

Smoke-tested end-to-end with the hash-fallback embedder (torch unavailable):

- All 11 Python files compile.
- `CodeReadabilityDataset` builds correctly for both languages.
- Per-class feature means are clearly monotonic:
  - Python MC (Low → Med → High): 0.02 → 0.46 → 0.97
  - Python OL: 0.07 → 0.63 → 0.92
  - C++ MC: 0.00 → 0.37 → 1.00

## What's NOT verified yet (you can help here)

- Full training with real CodeBERT against the actual **Kaggle dataset** (https://www.kaggle.com/datasets/paakhim10/code-snippets-insights-and-readability). The bundled 60-snippet sample is just to prove the pipeline runs; it's too small for paper-grade accuracy.
- The SA-BiLSTM forward + AdamW training loop run end-to-end on a machine with torch installed. Architecture matches Paper 1 Table 2 hyperparameters but hasn't been benchmarked.
- SHAP plots haven't been generated against a trained model.

## Known caveats / honest TODOs

1. **C++ identifier extraction uses regex**, not tree-sitter. Works for the demo; for thesis-grade reproduction, swap in `tree-sitter-cpp` (the `extract_cpp` function in `src/preprocess.py` is the drop-in point).
2. **Predictability (PRED) feature uses a token-frequency proxy**, not a real masked-LM. Easy to swap for CodeBERT's MLM head if needed.
3. The `_COMMON_WORDS` set in `src/features.py` is hand-curated (~200 words). For production, swap for an NLTK Brown/Wordnet frequency list.
4. Hyperparameters in `src/model.py` and `TrainConfig` in `src/trainer.py` match Paper 1 Table 2; haven't been tuned.

## Project rules (from PhD project instructions — please follow)

1. **Use the uploaded thesis template** (Annexure 18) as the primary structure; don't invent a new one unless I ask.
2. **Use only the three papers as the research source**. Don't fabricate results, datasets, citations, or claims. If something is missing, mark `[Citation Needed]` or ask me.
3. **Academic tone**: formal, clear, precise. No marketing language.
4. **Avoid AI-sounding writing**. I want the synopsis and thesis to read as if I wrote them. Specifically: avoid "Furthermore/Moreover/Additionally" chains, avoid "delve into", "robust", "leverage", "comprehensive framework", "cutting-edge". Use first-person sparingly and concretely. Sentences should vary in length.
5. When summarising my papers: identify main contribution, connection to other papers, shared research gap, and honest limitations.
6. When writing chapters: rewrite/synthesise — don't paste from the papers. Keep terminology consistent across the whole thesis.
7. **Mark assumptions and missing information clearly**.

## What I want to do next (any of these, in any order)

- (a) **Wire in the real Kaggle dataset** and run the full 100-epoch training to reproduce Paper 1's 98% accuracy.
- (b) **Rewrite my synopsis** (`ECRVR_MVEL_Synopsis_v2.docx` in the parent folder). The current draft was AI-assisted and reads like it — I want it to sound human. It also only covers Paper 2; the new synopsis should weave all three papers into one coherent story.
- (c) **Build working demos for Papers 2 and 3** (ECRVR-MVEL and EESQA-DELMOA) in the same project style.
- (d) **Build the full thesis** chapter by chapter using the Annexure 18 template.

## How to run locally (verified instructions)

```powershell
cd C:\Users\bhara\OneDrive\Documents\Claude\Projects\Phd\IRAF_XADL_Demo
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# 30-second sanity check (no CodeBERT download, no training)
python demo.py --no-codebert --no-shap

# Quick 5-epoch train + SHAP demo
python train.py --no-codebert --epochs 5 --save artifacts\iraf_xadl.pt
python demo.py --no-codebert --checkpoint artifacts\iraf_xadl.pt
```

For the real CodeBERT (≈500 MB download, slow first time):
```powershell
python train.py --epochs 100 --batch-size 32 --lr 1e-3 --save artifacts\iraf_xadl.pt
```

## Hyperparameters from Paper 1 Table 2 (already wired into the defaults)

| Component | Parameter | Value |
|---|---|---|
| Input | Max sequence length | 50 |
| BiLSTM | Layers / Hidden / Dropout | 3 / 128 / 0.3 |
| Self-attention | Heads / Dimension | 4 / 128 |
| Dense | Units / Activation | 64 / ReLU |
| AdamW | lr / weight_decay / β₁ / β₂ | 1e-3 / 0.01 / 0.9 / 0.999 |
| Training | Batch size / Epochs / Grad clip | 32 / 100 / 1.0 |

## Files in the parent folder you may need

- `..\Annexure 18 Ph.D. Thesis Template.docx` — the official thesis template
- `..\Annexure 10 Synopsis Format and Guidelines(Revised).docx` — synopsis format
- `..\Annexure 9 Check list while submitting Ph.D Synopsis.docx` — submission checklist
- `..\Evaluating Identifier Readability Using CodeBERT.docx` — Paper 1 manuscript
- `..\Explainable Artificial Intelligence with Hybrid Ensemble Learning based Automated Code Comprehension Prediction.docx` — Paper 2
- `..\Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment.docx` — Paper 3
- `..\ECRVR_MVEL_Synopsis_v2.docx` — current (AI-flavoured) synopsis draft
- `..\PhD_Study_Guide_Three_Papers.docx` — plain-language refresher for all three papers

---

**Start here:** ask me what I'd like to do first — wire up the Kaggle dataset, rewrite the synopsis, build Paper 2/3 demos, or start the thesis chapters.
