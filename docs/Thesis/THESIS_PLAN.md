# PhD THESIS — COMPLETE PLAN
## Explainable Deep Learning for Multi-Level Program Comprehension:
## Identifier Readability, Code Snippet Analysis, and Developer Experience Classification

**Scholar:** Bharat Babaso Mane  
**Supervisor:** Dr. Rathnakar Achary  
**Institution:** Alliance School of Advance Computing, Alliance University, Bengaluru  
**Faculty:** Engineering and Technology  
**Referencing style:** Chicago  

---

## ASSUMPTIONS MADE (confirm and replace before submission)

| Placeholder | Assumed Value | Action |
|---|---|---|
| [REG_NO] | To be confirmed | Check registration certificate |
| [YEAR] | 2026 | Confirm year of submission |
| [JOURNAL_P1] | To be confirmed | Journal where IRAF-XADL is accepted |
| [JOURNAL_P2] | To be confirmed | Journal where ECRVR-MVEL is accepted |
| [P3_STATUS] | Under review at a peer-reviewed journal | Confirm journal name |
| [RAC_MEMBER_1] | To be confirmed | First RAC member name + designation |
| [RAC_MEMBER_2] | To be confirmed | Second RAC member name + designation |

---

## CHAPTER STRUCTURE AND WORD COUNT TARGETS

| Chapter | Title | Target Words |
|---|---|---|
| Front Matter | Title, Declaration, Certificate, Dedication, Acknowledgement, Abstract, Preface | ~2,000 |
| 1 | Introduction | ~5,000 |
| 2 | Literature Review | ~9,000 |
| 3 | IRAF-XADL: Identifier Readability | ~12,000 |
| 4 | ECRVR-MVEL: Code Comprehension | ~12,000 |
| 5 | EESQA-DELMOA: Developer Quality | ~10,000 |
| 6 | Cross-Study Analysis and Discussion | ~6,000 |
| 7 | Conclusions and Future Work | ~3,500 |
| References | Full bibliography | ~2,000 |
| Publications | List + abstracts | ~500 |
| Appendices | Datasets, hyperparameter tables, extra figures | ~2,000 |
| **Total** | | **~64,000** |

---

## CHAPTER 1: INTRODUCTION

### 1.1 Background and Motivation
- Software maintenance costs (70% of lifecycle)
- Reading vs. writing code (developers read 10x more than they write)
- The cost of incomprehensible code: bug introduction, slow onboarding, maintenance debt
- The three levels of program comprehension: identifier, snippet, developer
- Why explainability matters in automated tools (trust, auditability, actionability)
- The rise of AI-generated code and its implications for quality assessment

### 1.2 Problem Statement
- Existing tools measure surface features only (line length, bracket count)
- Identifier naming quality is ignored despite its central role in comprehension
- No unified framework assesses all three levels
- Existing deep learning tools lack interpretable explanations
- The specific gap: no explainable, multi-level, validated system exists

### 1.3 Research Questions
- RQ1: Can a linguistically grounded feature set combined with CodeBERT embeddings predict identifier readability with higher accuracy than existing approaches?
- RQ2: Does a weighted ensemble of structurally diverse classifiers outperform individual classifiers for snippet-level readability prediction?
- RQ3: Can developer experience level be classified from observable activity features with accuracy and efficiency suitable for practical deployment?
- RQ4: Do SHAP and LIME explanations provide consistent, actionable insights about the features that drive readability predictions?

### 1.4 Scope and Limitations
- Python and C++ only for code-level studies
- Publicly available benchmark datasets
- English-language identifier names
- Six developer experience classes as defined by the Perez et al. dataset

### 1.5 Research Contributions (5 numbered contributions)

### 1.6 Thesis Organization

---

## CHAPTER 2: LITERATURE REVIEW

### 2.1 Program Comprehension: History and Definitions
- Shneiderman and Mayer (1979) — mental model formation
- Von Mayrhauser and Vans (1995) — integrated framework
- Brooks' model (1983) — top-down vs. bottom-up

### 2.2 Code Readability: Definitions and Early Measurement
- Buse and Weimer (2008, 2010) — annotation study, linear models
- Dorn (2012) — structural and visual features
- Scalabrino et al. (2016, 2018) — inter-rater reliability, extended features

### 2.3 Identifier Quality Assessment
- Lawrie et al. (2006, 2007) — comprehension speed and identifier quality
- Binkley et al. (2009, 2013) — naming antipatterns
- Butler et al. (2010) — style convention violations and defect correlation
- Arnaoudova et al. (2016) — linguistic antipatterns

### 2.4 Machine Learning for Code Quality
- Traditional ML approaches (SVM, RF, Logistic Regression) — limitations
- Feature engineering bottleneck

### 2.5 Deep Learning for Code Analysis
- LSTM/BiLSTM applied to code sequences
- Graph neural networks (GCN, GNN) for AST-based code representation
- Temporal Convolutional Networks for sequential code
- Deep Belief Networks in software engineering

### 2.6 Transformer Models in Software Engineering
- Devlin et al. (2019) — BERT
- Feng et al. (2020) — CodeBERT: architecture, pretraining, capabilities
- Applications of CodeBERT: defect detection, code summarisation, clone detection

### 2.7 Ensemble Methods
- Bagging, boosting, stacking — brief overview
- Weighted majority voting: rationale for diverse base classifiers
- Evidence that ensemble diversity reduces variance

### 2.8 Spiking Neural Networks
- Biological plausibility
- Leaky integrate-and-fire model
- Applications in classification tasks

### 2.9 Explainable AI in Software Engineering
- SHAP (Lundberg and Lee, 2017) — Shapley values, global vs. local explanations
- LIME (Ribeiro et al., 2016) — local surrogate models
- XAI applied to defect prediction, code quality, security analysis

### 2.10 Developer Experience Assessment
- Proxy measures: commit count, tenure, stack overflow reputation
- Experience classification studies (prior work limitations)
- Metaheuristic optimisation for feature selection (BAHB, AMBOA)

### 2.11 Research Gap Analysis
- Summary table of all reviewed works
- Identified gaps that this thesis addresses
- How each study fills a specific gap

### 2.12 Chapter Summary

---

## CHAPTER 3: IRAF-XADL

### 3.1 Introduction and Motivation
### 3.2 Problem Formulation
### 3.3 Framework Architecture (with figure description)
### 3.4 Identifier Extraction and Normalisation
- LibCST for Python
- Tree-Sitter for C++
- camelCase, snake_case splitting, digit-letter separation
- Stopword removal, lemmatisation
### 3.5 Ten Readability Parameters
- All 10 features with mathematical formulations
- MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED
### 3.6 CodeBERT Embeddings
- Architecture (12 layers, 768 dims)
- Token, segment, position embeddings
- Multi-head self-attention
- Mean pooling to fixed vector
### 3.7 SA-BiLSTM Classifier
- BiLSTM equations (all gate equations)
- Self-Attention mechanism (u_t, α_t, context vector v)
- Dense head
### 3.8 AdamW Optimisation
- Full update equations
- Decoupled weight decay
- Hyperparameter table (Table from paper)
### 3.9 SHAP Explainability
- Shapley value formula
- Local and global explanations
- Summary and dot plots
### 3.10 Experimental Setup
- Dataset description (Table 3, 4, 5 from paper)
- Train/test split (70/30)
- Evaluation metrics (all 5 with formulas)
- Implementation environment
### 3.11 Result Analysis: Python Data
- Table 6 (all accuracy numbers per class and average)
- Training/validation curves interpretation
### 3.12 Result Analysis: C++ Data
- Table from paper (all accuracy numbers)
- Training/validation curves interpretation
### 3.13 Comparative Analysis
- Table 7: IRAF-XADL vs. MLP, SMO, LR, RF, GNB-Isotonic, Perceptron, LDA
- Python: 98.13% vs best baseline 82.00%
- C++: 98.42% vs best baseline 80.56%
### 3.14 XAI Analysis
- Python SHAP: MC and NC dominant, readability minimal
- C++ SHAP: NC then MC dominant
- Practical insight: naming conventions and word meaningfulness matter most
### 3.15 Chapter Summary

---

## CHAPTER 4: ECRVR-MVEL

### 4.1 Introduction and Motivation
### 4.2 Problem Formulation
### 4.3 Framework Architecture
### 4.4 Text Preprocessing
- Tokenisation, comment removal, whitespace normalisation, language detection, sequence encoding
### 4.5 CodeBERT Vector Representations
- Same architecture as Chapter 3 but applied at snippet level
### 4.6 Graph Convolutional Network (GCN)
- Graph construction from code
- Spectral convolution formulation
- Message passing
### 4.7 Deep Belief Network (DBN)
- Restricted Boltzmann Machines
- Contrastive divergence training
- Layer-wise pretraining
### 4.8 Bidirectional Temporal Convolutional Network (Bi-TCN)
- Dilated convolutions
- Causal convolutions
- Bidirectional extension
### 4.9 Weighted Majority Voting Ensemble
- Weight assignment
- Combination rule
- Why diversity of base classifiers matters
### 4.10 Nadam Optimisation
- Nesterov + Adam combination
- Update equations
### 4.11 LIME Explainability
- Local surrogate model
- Perturbation-based approach
- Output: feature importance per prediction
### 4.12 Experimental Setup
- Same dataset as Chapter 3 (Python 1,681 / C++ 1,504)
### 4.13 Results: Python Data
- Table 5 (70% training: GCN 91.95%, DBN 94.33%, Bi-TCN 95.41%, WMVE 97.11%)
- Table 6 (30% testing: WMVE 98.15%)
### 4.14 Results: C++ Data
- Table 8 (70%: WMVE 98.04%)
- Table 9 (30%: WMVE 98.38%)
### 4.15 Comparative Analysis
- Table 7: Python — ECRVR-MVEL 98.15% vs NN 90.11%
- Table 10: C++ — ECRVR-MVEL 98.38% vs Decision Tree 92.84%
### 4.16 LIME Analysis
- Python: MC and readability most influential
- C++: PRED and readability, NC positive contributor
### 4.17 Chapter Summary

---

## CHAPTER 5: EESQA-DELMOA

### 5.1 Introduction and Motivation
### 5.2 Problem Formulation
### 5.3 Framework Architecture
### 5.4 Data Preprocessing: Min-Max Normalisation
- Formula
- Why min-max over z-score for this dataset
### 5.5 BAHB Feature Selection
- Bio-inspired artificial hummingbird behaviour
- Fitness function
- Selection of 18 from 26 features
- Which features were selected (if known from paper)
### 5.6 Simplified Spiking Neural Network
- Membrane potential update equation (U_t = U_{t-1} + S_i - D)
- Leaky integrate-and-fire
- Spike generation
- SSNN vs. conventional ANN: biological plausibility, energy efficiency
### 5.7 AMBOA Parameter Tuning
- Butterfly scent intensity model (f = cI^a)
- Local and global search equations
- Inertia weight adaptation
- Fitness function (maximise precision)
### 5.8 Experimental Setup
- Dataset: Zenodo (https://zenodo.org/records/7011334)
- 703 instances, 6 classes (ESE 69, SA 29, SE 73, NSE 17, BOT 10, UNK 505)
- 26 features → 18 selected
- 70/30 split
### 5.9 Results Analysis
- Table 2: 70% training (avg acc 98.10%, F1 79.54%, AUC 86.65%)
- Table 2: 30% testing (avg acc 98.74%, F1 85.38%, AUC 90.84%)
- Per-class analysis: SA and NSE achieve 100%, BOT challenging (class imbalance)
### 5.10 Comparative Analysis
- Table 3: EESQA-DELMOA 98.74% vs RF 94.70%, CNN 94.78%, AlexNet 92.34%
### 5.11 Execution Time Analysis
- Table 4: EESQA-DELMOA 8.27s vs RF 14.57s, CNN 17.33s, DT 16.18s
- Practical significance for real-time deployment
### 5.12 Chapter Summary

---

## CHAPTER 6: CROSS-STUDY ANALYSIS AND DISCUSSION

### 6.1 The Multi-Level Program Comprehension Framework
- How the three studies relate
- The identifier → snippet → developer abstraction hierarchy
- What each level adds that the others cannot provide

### 6.2 Convergent Findings from SHAP and LIME
- Both SHAP (Study 1) and LIME (Study 2) identify MC and NC as primary drivers
- What this tells us: the features designed for identifier assessment generalise
- Implication: naming quality features have snippet-level validity

### 6.3 Consistency of CodeBERT Across Studies
- Used in both Study 1 and Study 2
- Frozen embeddings effective at both levels
- Fine-tuning as future direction

### 6.4 Ensemble Diversity Principle Validated
- GCN alone: 91.95% / DBN alone: 94.33% / Bi-TCN alone: 95.41%
- WMVE: 97.11% / 98.15% — ensemble of three outperforms each
- Confirms theoretical expectation

### 6.5 The Efficiency Argument (Study 3)
- 8.27 seconds execution time
- How this enables practical deployment in CI/CD pipelines, developer assignment tools
- Comparison to prior methods' execution times

### 6.6 Practical Implications
- For development teams: use IRAF-XADL outputs to flag identifier naming issues during code review
- For project managers: EESQA-DELMOA to support developer assignment decisions
- For automated pipelines: all three models deployable in sequence

### 6.7 Threats to Validity
- Internal validity: dataset labelling scheme, potential annotation bias
- External validity: only Python and C++; dataset from LeetCode solutions
- Construct validity: readability operationalised as composite score
- Conclusion validity: statistical significance of reported gains

### 6.8 Chapter Summary

---

## CHAPTER 7: CONCLUSIONS AND FUTURE WORK

### 7.1 Summary of Research
### 7.2 Answers to Research Questions
- RQ1: Yes — 97.36%/97.94% test accuracy, 15+ points above best baseline
- RQ2: Yes — WMVE 98.15%/98.38% vs individual classifiers 91–95%
- RQ3: Yes — 98.74% accuracy, 8.27s execution time
- RQ4: Yes — SHAP and LIME converge on MC and NC across independent levels

### 7.3 Contributions Revisited
### 7.4 Limitations
### 7.5 Future Research Directions
- Extension to Java, JavaScript, Python type-annotated code
- Fine-tuning CodeBERT rather than frozen features
- Integrating all three levels into a unified pipeline
- Class rebalancing for minority developer classes (BOT, NSE, SA)
- Human evaluation study with software engineers
- Extension to AI-generated code quality assessment

---

## FILES TO BE CREATED

```
Thesis/
├── THESIS_PLAN.md                    ← this file
├── Thesis_Frontmatter.md             ← title, declaration, certificate, dedication, acknowledgement, abstract
├── Chapter_01_Introduction.md
├── Chapter_02_Literature_Review.md
├── Chapter_03_IRAF_XADL.md
├── Chapter_04_ECRVR_MVEL.md
├── Chapter_05_EESQA_DELMOA.md
├── Chapter_06_Discussion.md
├── Chapter_07_Conclusions.md
├── Thesis_References.md
├── Thesis_Publications.md
└── Thesis_Appendices.md
```
