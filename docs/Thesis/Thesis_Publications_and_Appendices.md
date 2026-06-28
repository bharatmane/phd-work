# LIST OF PUBLICATIONS

Publications arising from the doctoral research:

---

**Publication 1**

Bharat Babaso Mane and Dr. Rathnakar Achary. "Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling." *[JOURNAL_P1]*. [Accepted — In Publication].

**Abstract:** Identifier names are natural language representations of program models in source code that play a significant part in program understanding. This paper proposes an Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning (IRAF-XADL). The proposed model applies a syntax-aware identifier preprocessing pipeline, computes ten linguistically and cognitively grounded readability parameters, obtains semantic representations using CodeBERT embeddings, and processes them through a self-attention-based bidirectional LSTM. AdamW is used for optimisation and SHAP for explainability. Experimental evaluation on the Code Snippets: Insights and Readability benchmark demonstrates improved performance over existing approaches, with test accuracy of 97.36% (Python) and 97.94% (C++).

---

**Publication 2**

Bharat Babaso Mane and Dr. Rathnakar Achary. "Explainable Artificial Intelligence with Hybrid Ensemble Learning based Automated Code Comprehension Prediction." *[JOURNAL_P2]*. [Accepted].

**Abstract:** Code readability is an essential element of software quality. This paper proposes an Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning (ECRVR-MVEL). CodeBERT transforms raw code into vector representations; a weighted majority voting ensemble of a Graph Convolutional Network, Deep Belief Network, and Bidirectional Temporal Convolutional Network classifies code readability into High, Medium, and Low. Nadam optimisation improves convergence; LIME provides local explainability. Experimental results on Python and C++ datasets demonstrate test accuracy of 98.15% and 98.38% respectively.

---

**Publication 3**

Bharat Babaso Mane and Dr. Rathnakar Achary. "Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment." [P3_STATUS].

**Abstract:** Developer experience plays an essential part in shaping software quality. This paper proposes the EESQA-DELMOA model, which assesses software quality by analysing developer experience levels. Min-max normalisation prepares the data; the Bio-inspired Artificial Hummingbird Behaviour technique selects 18 of 26 available features; a Simplified Spiking Neural Network classifies developer experience into six categories; and the Adaptive Migration Butterfly Optimisation Algorithm tunes the classifier. Experimental evaluation on a benchmark developer experience dataset demonstrates test accuracy of 98.74% and an execution time of 8.27 seconds — the highest accuracy and lowest execution time among all compared methods.

---

---

# APPENDICES

---

## APPENDIX A: DATASET DETAILS

### A.1 Code Snippets: Insights and Readability Dataset (Kaggle)

**Source:** https://www.kaggle.com/datasets/paakhim10/code-snippets-insights-and-readability/data  
**Licence:** MIT  
**Used in:** Chapters 3 (IRAF-XADL) and 4 (ECRVR-MVEL)

The dataset contains Python and C++ code snippets drawn from LeetCode, annotated with the following fields:

**Python dataset columns:**
- `problem_title`: The LeetCode problem title
- `python_solutions`: The source code of the solution
- `difficulty`: LeetCode difficulty category (Easy / Medium / Hard)
- `num_of_lines`: Number of non-blank lines in the snippet
- `code_length`: Total character count
- `comments`: Number of comment lines
- `cyclomatic_complexity`: McCabe complexity score
- `indents`: Maximum indentation depth
- `loop_count`: Number of for/while loops
- `line_length`: Average length of non-blank lines
- `identifiers`: Total identifier count
- `readability`: Composite readability score (continuous; used for three-class labelling)

**C++ dataset columns:** Same structure with `cpp_solutions` instead of `python_solutions`.

**Label derivation:** Snippets are partitioned into three classes using tertile thresholds on the readability score: the bottom third → Low, the middle third → Medium, the top third → High. Outlier rows with readability score < 0 (117 rows) are removed before partitioning.

**Statistics after preprocessing:**

| Language | Low | Medium | High | Total |
|---|---|---|---|---|
| Python | 561 | 560 | 560 | 1,681 |
| C++ | 502 | 500 | 502 | 1,504 |

---

### A.2 Developer Experience Dataset (Zenodo)

**Source:** https://zenodo.org/records/7011334  
**Reference:** Perez, Q., Urtado, C., and Vauttier, S. (2023). "Dataset of open-source software developers labeled by their experience level in the project and their associated software metrics." *Data in Brief*, 46, 108842.  
**Used in:** Chapter 5 (EESQA-DELMOA)

The dataset contains 703 developer profiles extracted from open-source GitHub projects. Each profile is labelled with one of six experience classes based on observed activity patterns:

| Class | Full name | Count | Percentage |
|---|---|---|---|
| ESE | Experienced Software Engineer | 69 | 9.8% |
| SA | Software Architect | 29 | 4.1% |
| SE | Software Engineer | 73 | 10.4% |
| NSE | Non-Software Engineer | 17 | 2.4% |
| BOT | Bot (automated contributor) | 10 | 1.4% |
| UNK | Unknown (insufficient data) | 505 | 71.8% |
| **Total** | | **703** | |

**Feature set (26 features):** The features capture multiple dimensions of developer activity including commit frequency, pull request behaviour, code review participation, project breadth, code complexity metrics, and contribution recency. The BAHB feature selection algorithm selects 18 of these 26 features; the specific selected features are those retained by the best-performing BAHB run in the experimental validation.

---

## APPENDIX B: HYPERPARAMETER TABLES

### B.1 IRAF-XADL (SA-BiLSTM) — Full Hyperparameter Configuration

| Component | Parameter | Value | Justification |
|---|---|---|---|
| Input | Max sequence length | 50 | Covers 95%+ of identifier sequences; longer sequences rare |
| CodeBERT | Model | microsoft/codebert-base | Best published code language model for this scale |
| CodeBERT | Mode | Frozen (feature extraction) | Dataset too small for full fine-tuning |
| BiLSTM | Number of layers | 3 | Empirically optimal; 4 layers showed diminishing returns |
| BiLSTM | Hidden units | 128 | Balance between expressiveness and overfitting risk |
| BiLSTM | Dropout | 0.3 | Standard for regularisation in 3-layer BiLSTMs |
| Self-attention | Heads | 4 | Multi-head attention for diverse feature perspectives |
| Self-attention | Attention dimension | 128 | Matches BiLSTM hidden size |
| Dense head | Units | 64 | ReLU activation; sufficient for 3-class problem |
| AdamW | Learning rate | 0.001 | Standard for AdamW with this batch size |
| AdamW | Weight decay | 0.01 | Moderate regularisation |
| AdamW | β₁ | 0.9 | Standard first moment decay |
| AdamW | β₂ | 0.999 | Standard second moment decay |
| Training | Batch size | 32 | Memory-efficient; stable gradient estimates |
| Training | Epochs | 100 | Sufficient for convergence; early stopping at 50 |
| Training | Gradient clipping | 1.0 | Prevents gradient explosion in deep BiLSTM |

### B.2 ECRVR-MVEL — Ensemble Configuration

| Component | Parameter | Value |
|---|---|---|
| CodeBERT | Max length | 512 (full snippet) |
| GCN | Number of layers | 3 |
| GCN | Hidden dimension | 256 |
| GCN | Activation | ReLU |
| DBN | Hidden layers | [512, 256, 128] |
| DBN | Pre-training epochs | 20 per layer |
| DBN | Fine-tuning epochs | 50 |
| Bi-TCN | Kernel size | 3 |
| Bi-TCN | Dilation factors | [1, 2, 4, 8] |
| Bi-TCN | Residual connections | Yes |
| WMVE | Weight initialisation | Individual classifier validation accuracy |
| Nadam | Learning rate | 0.001 |
| Nadam | β₁ | 0.9 |
| Nadam | β₂ | 0.999 |
| Training | Epochs | 100 |
| Training | Batch size | 32 |

### B.3 EESQA-DELMOA — Configuration

| Component | Parameter | Value |
|---|---|---|
| Preprocessing | Normalisation | Min-max to [0, 1] |
| BAHB | Population size | 30 |
| BAHB | Iterations | 50 |
| BAHB | Features selected | 18 of 26 |
| SSNN | Hidden layer size | 64 neurons |
| SSNN | Time steps | 25 |
| SSNN | Spike coding | Rate coding |
| SSNN | Decay constant D | AMBOA-tuned |
| SSNN | Firing threshold Θ | AMBOA-tuned |
| AMBOA | Population size | 20 |
| AMBOA | Iterations | 50 |
| AMBOA | Fitness function | Validation precision |
| AMBOA | ω_{x,min} | 0.4 |
| AMBOA | ω_{x,max} | 0.9 |
| Training | Epochs | 25 (temporal steps) |
| Training | Split | 70% train / 30% test |

---

## APPENDIX C: EVALUATION METRIC FORMULAS

All metrics are computed in macro-averaged form (unweighted average across classes) unless otherwise specified.

**Accuracy:**
```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

**Precision (per class):**
```
Precision_c = TP_c / (TP_c + FP_c)
```

**Recall (per class):**
```
Recall_c = TP_c / (TP_c + FN_c)
```

**F1-Score (per class):**
```
F1_c = 2 × Precision_c × Recall_c / (Precision_c + Recall_c)
```

**Macro-averaged Precision, Recall, F1:**
```
Macro-Metric = (1/|C|) Σ_{c ∈ C} Metric_c
```
where C = {Low, Medium, High} for code studies, C = {ESE, SA, SE, NSE, BOT, UNK} for Study 3.

**Area Under the ROC Curve (AUC):**  
Computed using one-vs-rest (OvR) strategy for multi-class classification. For each class c, a binary ROC curve is computed (class c vs. all other classes), and the area under this curve is the per-class AUC. The macro-averaged AUC is the unweighted mean across all classes.

---

## APPENDIX D: REPRODUCIBILITY INFORMATION

All three studies are implemented in Python. The following library versions were used:

| Library | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| PyTorch | 2.12 | Deep learning framework |
| Transformers (HuggingFace) | 5.9 | CodeBERT model and tokeniser |
| NumPy | 2.4 | Numerical computation |
| Pandas | 3.0 | Data loading and manipulation |
| Scikit-learn | 1.8 | Baseline classifiers, metrics |
| SHAP | 0.52 | SHAP explanations (Study 1) |
| FastAPI | 0.136 | REST API for deployment |
| LibCST | — | Python AST parsing |

**Random seeds:** All experiments use random seed 42 for NumPy, PyTorch, and dataset splitting. Results are deterministic given the same hardware and software versions.

**Hardware:** All training was conducted on a CPU (Intel i7-series). Training times:
- IRAF-XADL: approximately 8 minutes per full run (100 epochs, 597 GitHub samples; 15 minutes for 1,564 Kaggle samples)
- ECRVR-MVEL: approximately 12 minutes per full run (100 epochs, 1,681 Python samples)
- EESQA-DELMOA: approximately 3 minutes per full run (25 time steps, 703 developer profiles)

GPU training would reduce these times by approximately 5–10×.

**Code availability:** The full implementation, trained model checkpoint, and demo API are available at:
- Repository: https://github.com/bharatmane/phd-work
- Live API: https://phd.dgtula.com/api
- Live Demo: https://phd.dgtula.com/demo

**Dataset access:**
- Code Snippets: Insights and Readability: https://www.kaggle.com/datasets/paakhim10/code-snippets-insights-and-readability/data
- Developer Experience Dataset: https://zenodo.org/records/7011334
