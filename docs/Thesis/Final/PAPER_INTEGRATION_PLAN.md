# PAPER INTEGRATION PLAN
## What goes from each paper into each thesis chapter

---

## CHAPTER 3 — IRAF-XADL (from Paper 1)

### Figures to insert (in Word, extract from Paper 1 docx)
| Thesis Figure | Paper Source | Caption |
|---|---|---|
| Figure 3.1 | Paper 1, Fig. 1 | Overall architecture/workflow of the IRAF-XADL framework |
| Figure 3.2 | Paper 1, Fig. 2 | Architecture of the self-attention mechanism |
| Figure 3.3 | Paper 1, Fig. 3 | Model diagram of SA-BiLSTM |
| Figure 3.4 | Paper 1, Fig. 4 | Confusion matrices and PR/ROC curves — Python data |
| Figure 3.5 | Paper 1, Fig. 5 | Training and validation accuracy curves — Python data |
| Figure 3.6 | Paper 1, Fig. 6 | Training and validation loss curves — Python data |
| Figure 3.7 | Paper 1, Fig. 7 | Confusion matrices and PR/ROC curves — C++ data |
| Figure 3.8 | Paper 1, Fig. 8 | Classification result curves — C++ data |
| Figure 3.9 | Paper 1, Fig. 9 | Training and validation accuracy curves — C++ data |
| Figure 3.10 | Paper 1, Fig. 10 | Training and validation loss curves — C++ data |
| Figure 3.11 | Paper 1, Fig. 11 | SHAP feature importance — Python data |
| Figure 3.12 | Paper 1, Fig. 12 | SHAP feature importance — C++ data |

### Tables from Paper 1
| Thesis Table | Paper Source | Caption |
|---|---|---|
| Table 3.3 | Paper 1, Table 3 | Dataset statistics (Python/C++) |
| Table 3.4 | Paper 1, Table 4 | Sample Python code snippets with readability levels |
| Table 3.5 | Paper 1, Table 5 | Sample C++ code snippets with readability levels |
| Table 3.6 | Paper 1, Table 2 | Hyperparameter configuration (SA-BiLSTM) |
| Table 3.7 | Paper 1, Table 6 | Detailed results — Python and C++ (70/30 split) |
| Table 3.8 | Paper 1, Table 7 | Comparative analysis vs. baselines |

### Formulas from Paper 1 (all to be in Word equation editor)
- MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED (10 formulas)
- CodeBERT mean-pool encoding
- BiLSTM gate equations (forget, input, candidate, cell, output, hidden)
- Self-attention (u_t, alpha, context vector v)
- AdamW (m_t, v_t, bias correction, parameter update)
- SHAP Shapley value
- Metrics: Accuracy, Precision, Recall, F1, AUC

---

## CHAPTER 4 — ECRVR-MVEL (from Paper 2)

### Figures to insert
| Thesis Figure | Paper Source | Caption |
|---|---|---|
| Figure 4.1 | Paper 2, Fig. 1 | Overall process/architecture of ECRVR-MVEL |
| Figure 4.2 | Paper 2, Fig. 2 | Structure of GCN technique |
| Figure 4.3 | Paper 2, Fig. 3 | General architecture of XAI/LIME technique |
| Figure 4.4 | Paper 2, Fig. 4 | Confusion matrices and ROC curves — GCN, DBN, Bi-TCN, Ensemble (Python) |
| Figure 4.5 | Paper 2, Fig. 5 | Classification results — Python, 70% training |
| Figure 4.6 | Paper 2, Fig. 6 | Classification results — Python, 30% testing |
| Figure 4.7 | Paper 2, Fig. 7 | Training and validation accuracy curves — Python |
| Figure 4.8 | Paper 2, Fig. 8 | Training and validation loss curves — Python |
| Figure 4.9 | Paper 2, Fig. 9 | Confusion matrices and ROC curves — GCN, DBN, Bi-TCN, Ensemble (C++) |
| Figure 4.10 | Paper 2, Fig. 10 | Classification results — C++, 70% training |
| Figure 4.11 | Paper 2, Fig. 11 | Classification results — C++, 30% testing |
| Figure 4.12 | Paper 2, Fig. 12 | Training and validation accuracy curves — C++ |
| Figure 4.13 | Paper 2, Fig. 13 | Training and validation loss curves — C++ |
| Figure 4.14 | Paper 2, Fig. 14 | LIME explanations — Python (Low, Medium, High) |
| Figure 4.15 | Paper 2, Fig. 15 | LIME explanations — C++ (Low, Medium, High) |

### Tables from Paper 2
| Thesis Table | Paper Source | Caption |
|---|---|---|
| Table 4.2 | Paper 2, Table 2 | Dataset statistics |
| Table 4.3 | Paper 2, Table 3 | Sample Python code snippets |
| Table 4.4 | Paper 2, Table 4 | Sample C++ code snippets |
| Table 4.5 | Paper 2, Table 5 | Per-class results — Python, 70% training |
| Table 4.6 | Paper 2, Table 6 | Per-class results — Python, 30% testing |
| Table 4.7 | Paper 2, Table 7 | Comparative analysis — Python |
| Table 4.8 | Paper 2, Table 8 | Per-class results — C++, 70% training |
| Table 4.9 | Paper 2, Table 9 | Per-class results — C++, 30% testing |
| Table 4.10 | Paper 2, Table 10 | Comparative analysis — C++ |

### Formulas from Paper 2
- CodeBERT [CLS] encoding
- GCN: graph-level aggregation, normalised adjacency, message passing, classification
- DBN: energy function E(v,h), partition function Z, conditional distributions
- BiTCN: forward/backward convolution, feature fusion, residual connection
- Nadam: first/second moment, bias correction, Nesterov lookahead update
- LIME: weighted surrogate model
- Metrics: Accuracy, Precision, Recall, F1, AUC

---

## CHAPTER 5 — EESQA-DELMOA (from Paper 3)

### Figures to insert
| Thesis Figure | Paper Source | Caption |
|---|---|---|
| Figure 5.1 | Paper 3, Fig. 1 | Workflow/architecture of EESQA-DELMOA method |
| Figure 5.2 | Paper 3, Fig. 2 | Structure of SSNN algorithm |
| Figure 5.3 | Paper 3, Fig. 3 | Average classification results (70%/30% splits) |
| Figure 5.4 | Paper 3, Fig. 4 | Training and validation accuracy curves |
| Figure 5.5 | Paper 3, Fig. 5 | Training and validation loss curves |
| Figure 5.6 | Paper 3, Fig. 6 | Precision-Recall (PR) curve |
| Figure 5.7 | Paper 3, Fig. 7 | ROC curve |
| Figure 5.8 | Paper 3, Fig. 8 | Comparative accuracy — EESQA-DELMOA vs. baselines |
| Figure 5.9 | Paper 3, Fig. 9 | Execution time comparison |

### Tables from Paper 3
| Thesis Table | Paper Source | Caption |
|---|---|---|
| Table 5.1 | Paper 3, Table 1 | Dataset class distribution |
| Table 5.2 | Paper 3, Table 2 | Detailed classification results (70/30 split) |
| Table 5.3 | Paper 3, Table 3 | Comparative analysis vs. baselines |
| Table 5.4 | Paper 3, Table 4 | Execution time comparison |

### Formulas from Paper 3
- Min-max normalisation
- BAHB: initialisation, guided food search (diagonal flight), territorial search, migration
- BAHB: fitness function (classification error + feature count)
- SSNN: membrane potential U(t), spike generation rule
- AMBOA: scent intensity f = c·I^a, global/local search with inertia weight
- AMBOA: linearly decaying position weight
- AMBOA: fitness (precision-based)

---

## FOR WORD DOCUMENT — IMAGE EXTRACTION PLAN

### How to extract images from paper docx files into thesis chapters:
1. Run `python extract_images.py` (script to be written) to extract all figures from each paper
2. They will be saved as PNG files in `Thesis/Figures/`
3. In Word, insert each image at the [FIGURE X.X] placeholder location
4. Apply caption style `Figure body text Description` below each image

### Image extraction mapping:
```
Paper 1 images → Chapter 3 figures (12 images)
Paper 2 images → Chapter 4 figures (15 images)
Paper 3 images → Chapter 5 figures (9 images)
```

---

## FLOWCHARTS TO CREATE (ASCII — in MD, Mermaid/SmartArt — in Word)

1. Chapter 1 — Three-Level Program Comprehension Hierarchy
2. Chapter 3 — IRAF-XADL 6-Stage Pipeline
3. Chapter 4 — ECRVR-MVEL 5-Stage Pipeline
4. Chapter 5 — EESQA-DELMOA 4-Stage Pipeline
5. Chapter 6 — Cross-Study Relationship (SHAP/LIME convergence)

---
*Generated 2026-05-30 — Update thesis chapter MDs with figure placeholders and complete tables*
