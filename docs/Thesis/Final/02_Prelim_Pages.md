# PRELIMINARY PAGES

---

## DECLARATION
*(Page i)*

I declare that the thesis entitled *Explainable Deep Learning for Multi-Level Program Comprehension: Identifier Readability, Code Snippet Analysis, and Developer Experience Classification* has been prepared by me under the guidance of Dr. Rathnakar Achary, Associate Professor, Alliance School of Advance Computing, Alliance University. No part of this thesis has formed the basis for the award of any degree in any university or fellowship previously. The work reported in this thesis was carried out independently by me unless explicitly acknowledged in the text.

Bharat Babaso Mane
Alliance School of Advance Computing, Alliance University
Chikkahadage Cross, Chandapura-Anekal Main Road
Bengaluru, Karnataka 562106

Signature: ___________________________
Date: ________________________________

---

## CERTIFICATE
*(Page ii)*

I certify that Bharat Babaso Mane has prepared his thesis entitled *Explainable Deep Learning for Multi-Level Program Comprehension: Identifier Readability, Code Snippet Analysis, and Developer Experience Classification*, for the award of the PhD degree of Alliance University, under my guidance. He has carried out the work at the Alliance School of Advance Computing, Alliance University.

**Dr. Rathnakar Achary**
Associate Professor
Alliance School of Advance Computing, Alliance University
Bengaluru, Karnataka 562106

Signature: ___________________________
Date: ________________________________

---

## DEDICATION
*(Page iii)*

To my parents, whose sacrifices built the ground I stand on — everything I have achieved begins with what you gave up.

To my wife, whose patience, love, and quiet strength carried this work through its hardest moments. You gave more than anyone should have to, and I am grateful beyond what words can hold.

To my children, who reminded me every day that there is a world beyond the research — and that it is the better world.

And to my friends, who listened when I needed to be heard, encouraged when I needed to keep going, and never once let me take this too seriously — this would not exist without you.

And to every software developer who has ever inherited someone else's code and wondered what on earth it was supposed to do.

---

## ACKNOWLEDGEMENT
*(Page iv)*

I express my deepest gratitude to the Alliance University and Alliance College of Engineering and Design for supporting and allowing this research to evolve at the intersection of tradition and technology contributing to Indian Knowledge System.

Dr. Rathnakar Achary, my supervisor, offered something rarer than technical guidance: he consistently asked better questions than I had thought to ask myself. His insistence that results must be explainable — not just accurate — gave this thesis its defining theme.

The faculty and staff of the Alliance School of Advance Computing provided an environment in which research could be taken seriously. I am grateful for access to computational resources, library systems, and collegial exchange that sustained this work.

My colleagues and peers across six years of doctoral study offered critical feedback, pointed out my blind spots, and were generous enough to disagree with me when they had reason to.

My family understood that a PhD is not a project with weekends. Their patience with my absences — physical and mental — is something I recognise and can only partially repay.

The datasets that made this research possible were created and shared by Paakhim10 (Kaggle Code Snippets: Insights and Readability) and by Perez, Urtado, and Vauttier (Zenodo developer experience dataset). Open data is a public good, and this thesis would not exist without it.

Bharat Babaso Mane
Bengaluru, 2026

---

## ABSTRACT
*(Page v)*

Program comprehension — the cognitive process by which software developers understand what code does, how it is structured, and who built it — underpins nearly every phase of the software development lifecycle. Maintenance, debugging, refactoring, code review, and developer onboarding all depend on a developer's ability to read and make sense of source code quickly and accurately. Industry estimates consistently place maintenance at sixty to seventy percent of total software lifecycle cost, and a substantial portion of that cost is attributable to code that is difficult to read. Despite this, automated tools for measuring and explaining code quality have remained narrow, most assessing surface characteristics such as line length and indentation while ignoring the semantic content — specifically, the naming quality of identifiers — that experienced developers attend to when judging code.

This thesis attacks the problem from three complementary directions, organised by the level of abstraction at which each study operates.

The first study, IRAF-XADL (Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning), operates at the finest grain: the individual identifier. IRAF-XADL extracts identifiers using language-specific abstract syntax tree parsers for Python (LibCST) and C++ (Tree-Sitter), computes ten linguistically and cognitively grounded readability parameters from each identifier, encodes it with CodeBERT contextual embeddings, and classifies it as High, Medium, or Low readability using a Self-Attention BiLSTM optimised with AdamW. SHAP-based post-hoc explanations identify which features drove each prediction. On the Code Snippets: Insights and Readability benchmark (Kaggle), IRAF-XADL achieves test accuracy of 97.36% for Python and 97.94% for C++, surpassing the best published baseline by more than fifteen percentage points.

The second study, ECRVR-MVEL (Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning), widens the unit of analysis from a single identifier to a complete code snippet. ECRVR-MVEL applies CodeBERT to encode the full snippet, then combines three structurally diverse classifiers — a Graph Convolutional Network, a Deep Belief Network, and a Bidirectional Temporal Convolutional Network — in a weighted majority vote optimised with the Nadam algorithm. LIME provides local explanations for each prediction. On the same benchmark dataset, ECRVR-MVEL achieves test accuracy of 98.15% for Python and 98.38% for C++, outperforming the Neural Network baseline by more than eight percentage points.

The third study, EESQA-DELMOA (Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms), shifts focus from the code artefact to the developer who produced it. EESQA-DELMOA applies min-max normalisation, Bio-inspired Artificial Hummingbird Behaviour (BAHB) feature selection, a Simplified Spiking Neural Network (SSNN) classifier, and Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) hyperparameter tuning to classify developer experience into six categories. On the Perez et al. dataset (Zenodo, 703 developer profiles), the system achieves test accuracy of 98.74% with an execution time of 8.27 seconds — the lowest of all compared methods.

A cross-study analysis reveals a consistent finding: SHAP explanations in Study 1 and LIME explanations in Study 2 independently identify Meaningful Clarity (MC) and Naming Conformance (NC) as the dominant predictors of code readability. This convergence, across two independent explainability methods and two levels of analysis, validates the relevance of the ten-parameter feature set beyond the identifier level at which it was originally designed.

Together, the three studies establish that program comprehension can be assessed automatically, accurately, and interpretably at every level of the software development artefact hierarchy — from the naming of a single variable, through the structure of a code snippet, to the experience of the developer who wrote it.

**Keywords:** Program Comprehension; Code Readability; Identifier Quality; CodeBERT; Self-Attention BiLSTM; Graph Convolutional Network; Deep Belief Network; Bidirectional Temporal Convolutional Network; Spiking Neural Network; Explainable AI; SHAP; LIME; Software Quality Assessment; Developer Experience

---

## PREFACE
*(Page vii)*

This thesis reports three independent but related studies completed as part of a doctoral research programme in computer science and software engineering at Alliance University, Bengaluru. Each study was designed to address a specific gap in the automated assessment of program comprehension and source code quality.

The studies are presented in order of increasing abstraction: from the individual identifier (Chapter 3) to the code snippet (Chapter 4) to the developer behind the code (Chapter 5). Chapters 3, 4, and 5 are substantially based on papers that have been peer-reviewed and accepted for publication. The bibliographic details of these publications appear in the List of Publications at the end of the thesis.

Wherever results, figures, or tables are drawn directly from the published papers, this is indicated in the text. The comparative analysis, cross-study discussion, and synthesis in Chapters 6 and 7 are original to this thesis and do not appear in the published papers.

---

## TABLE OF CONTENTS
*(Page ix)*

| | | Page |
|---|---|---|
| Declaration | | i |
| Certificate | | ii |
| Dedication | | iii |
| Acknowledgement | | iv |
| Abstract | | v |
| Preface | | vii |
| Table of Contents | | ix |
| List of Figures | | xiii |
| List of Tables | | xiv |
| List of Appendices | | xv |
| **CHAPTER 1: INTRODUCTION** | | **1** |
| 1.1 | Background | 1 |
| 1.2 | Significance of the Study | 3 |
| 1.3 | Research Problem | 5 |
| 1.4 | Objectives | 7 |
| 1.5 | Scope of the Study | 8 |
| 1.6 | Challenges and Limitations | 10 |
| 1.7 | Potential Impact | 11 |
| 1.8 | Research Contributions | 13 |
| 1.9 | Structure of the Thesis | 14 |
| 1.10 | Summary | 15 |
| **CHAPTER 2: LITERATURE SURVEY** | | **16** |
| 2.1 | Introduction | 16 |
| 2.2 | Program Comprehension: From Cognitive Theory to Engineering Practice | 17 |
| 2.3 | Code Readability: Measurement Approaches and Their Limitations | 20 |
| 2.4 | Identifier Quality Assessment | 23 |
| 2.5 | Machine Learning for Code Quality Prediction | 27 |
| 2.6 | Transformer Models in Software Engineering | 30 |
| 2.7 | Ensemble Methods for Classification | 33 |
| 2.8 | Recurrent Architectures: LSTM and BiLSTM | 36 |
| 2.9 | Spiking Neural Networks | 38 |
| 2.10 | Explainable Artificial Intelligence | 40 |
| 2.11 | Developer Experience and Software Quality | 43 |
| 2.12 | Challenges in Existing Approaches | 46 |
| 2.13 | Notable Applications and Case Studies | 48 |
| 2.14 | Justification for Selected Models | 50 |
| 2.15 | Existing Works and Limitations | 52 |
| 2.16 | Identified Research Gap and Thesis Contribution | 53 |
| 2.17 | Chapter Summary | 54 |
| **CHAPTER 3: IRAF-XADL** | | **55** |
| 3.1 | Introduction and Motivation | 55 |
| 3.2 | Problem Formulation | 57 |
| 3.3 | Framework Architecture | 58 |
| 3.4 | Identifier Extraction and Normalisation | 59 |
| 3.5 | Ten Readability Parameters | 62 |
| 3.6 | CodeBERT Embeddings | 68 |
| 3.7 | Self-Attention BiLSTM Classifier | 70 |
| 3.8 | AdamW Optimisation | 74 |
| 3.9 | SHAP Explainability | 76 |
| 3.10 | Experimental Setup | 78 |
| 3.11 | Results: Python Data | 81 |
| 3.12 | Results: C++ Data | 83 |
| 3.13 | Comparative Analysis | 84 |
| 3.14 | SHAP Explainability Analysis | 87 |
| 3.15 | Ablation Study | 90 |
| 3.16 | Qualitative Examples | 93 |
| 3.17 | Error Analysis | 97 |
| 3.18 | Chapter Summary | 99 |
| **CHAPTER 4: ECRVR-MVEL** | | **100** |
| 4.1 | Introduction and Motivation | 100 |
| 4.2 | Problem Formulation | 102 |
| 4.3 | Framework Architecture | 103 |
| 4.4 | Text Preprocessing | 104 |
| 4.5 | CodeBERT Vector Representations | 106 |
| 4.6 | Graph Convolutional Network (GCN) | 108 |
| 4.7 | Deep Belief Network (DBN) | 112 |
| 4.8 | Bidirectional Temporal Convolutional Network (Bi-TCN) | 116 |
| 4.9 | Weighted Majority Voting Ensemble (WMVE) | 120 |
| 4.10 | Nadam Optimisation | 124 |
| 4.11 | LIME Explainability | 126 |
| 4.12 | Experimental Setup | 128 |
| 4.13 | Results: Python Data | 131 |
| 4.14 | Results: C++ Data | 135 |
| 4.15 | Comparative Analysis | 138 |
| 4.16 | LIME Explainability Analysis | 141 |
| 4.17 | Ablation Study | 146 |
| 4.18 | Ensemble Diversity Analysis | 149 |
| 4.19 | LIME Stability Analysis | 151 |
| 4.20 | Qualitative Examples | 152 |
| 4.21 | Chapter Summary | 155 |
| **CHAPTER 5: EESQA-DELMOA** | | **156** |
| 5.1 | Introduction and Motivation | 156 |
| 5.2 | Problem Formulation | 158 |
| 5.3 | Framework Architecture | 159 |
| 5.4 | Data Preprocessing: Min-Max Normalisation | 160 |
| 5.5 | BAHB Feature Selection | 161 |
| 5.6 | Simplified Spiking Neural Network (SSNN) | 165 |
| 5.7 | Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) | 169 |
| 5.8 | Experimental Setup | 173 |
| 5.9 | Results Analysis | 175 |
| 5.10 | Comparative Analysis | 178 |
| 5.11 | Execution Time Analysis | 180 |
| 5.12 | Ablation Study | 182 |
| 5.13 | Feature Importance Analysis | 185 |
| 5.14 | Per-Class Analysis | 187 |
| 5.15 | Sensitivity Analysis: Class Imbalance Mitigation | 190 |
| 5.16 | Discussion | 192 |
| 5.17 | Chapter Summary | 195 |
| **CHAPTER 6: CROSS-STUDY ANALYSIS AND DISCUSSION** | | **196** |
| 6.1 | Introduction | 196 |
| 6.2 | The Multi-Level Program Comprehension Framework | 197 |
| 6.3 | Convergence of SHAP and LIME: The Central Cross-Study Finding | 200 |
| 6.4 | Performance Trajectory and Its Interpretation | 204 |
| 6.5 | The Ensemble Diversity Principle Validated | 205 |
| 6.6 | Efficiency as a Design Goal | 206 |
| 6.7 | Practical Implications for Software Engineering Teams | 207 |
| 6.8 | Comparison with Industrial Code Quality Tools | 210 |
| 6.9 | The Naturalness Hypothesis | 212 |
| 6.10 | Threats to Validity | 213 |
| 6.11 | Chapter Summary | 217 |
| **CHAPTER 7: CONCLUSIONS AND FUTURE WORK** | | **218** |
| 7.1 | Summary of the Research | 218 |
| 7.2 | Answers to the Research Questions | 221 |
| 7.3 | Contributions Revisited | 223 |
| 7.4 | Limitations | 225 |
| 7.5 | Future Research Directions | 226 |
| 7.6 | Impact Statement | 231 |
| 7.7 | Closing Remarks | 232 |
| **References** | | **233** |
| **List of Publications** | | **248** |
| **Appendix A** | Dataset Details | 249 |
| **Appendix B** | Hyperparameter Tables | 251 |
| **Appendix C** | Evaluation Metric Formulas | 254 |
| **Appendix D** | Reproducibility Information | 255 |

*Note: Page numbers are approximate and will be finalised after Word formatting.*

---

## LIST OF FIGURES
*(Page xiii)*

| Figure | Caption | Chapter |
|---|---|---|
| 1.1 | The three-level program comprehension hierarchy addressed in this thesis | 1 |
| 1.2 | Thesis organisation and inter-chapter relationships | 1 |
| 3.1 | Overall architecture of the IRAF-XADL framework | 3 |
| 3.2 | Architecture of the self-attention mechanism | 3 |
| 3.3 | SA-BiLSTM model diagram | 3 |
| 3.4 | Confusion matrices and PR/ROC curves: IRAF-XADL on Python | 3 |
| 3.5 | Training and validation accuracy curves: IRAF-XADL on Python | 3 |
| 3.6 | Training and validation loss curves: IRAF-XADL on Python | 3 |
| 3.7 | Confusion matrices and PR/ROC curves: IRAF-XADL on C++ | 3 |
| 3.8 | Training and validation accuracy curves: IRAF-XADL on C++ | 3 |
| 3.9 | SHAP feature importance: Python data (Low, Medium, High levels) | 3 |
| 3.10 | SHAP feature importance: C++ data (Low, Medium, High levels) | 3 |
| 4.1 | Overall architecture of the ECRVR-MVEL framework | 4 |
| 4.2 | GCN, DBN, Bi-TCN confusion matrices and ROC curves: Python | 4 |
| 4.3 | Ensemble accuracy curve: Python | 4 |
| 4.4 | Ensemble loss curve: Python | 4 |
| 4.5 | GCN, DBN, Bi-TCN confusion matrices and ROC curves: C++ | 4 |
| 4.6 | Ensemble accuracy curve: C++ | 4 |
| 4.7 | LIME explanations: Python (Low, Medium, High) | 4 |
| 4.8 | LIME explanations: C++ (Low, Medium, High) | 4 |
| 5.1 | Overall architecture of the EESQA-DELMOA framework | 5 |
| 5.2 | SSNN structure | 5 |
| 5.3 | Accuracy curve: EESQA-DELMOA | 5 |
| 5.4 | Loss curve: EESQA-DELMOA | 5 |
| 5.5 | PR curve: EESQA-DELMOA | 5 |
| 5.6 | ROC curve: EESQA-DELMOA | 5 |
| 5.7 | Comparative accuracy: EESQA-DELMOA vs. baselines | 5 |
| 5.8 | Execution time comparison | 5 |
| 6.1 | Cross-study relationship diagram | 6 |
| 6.2 | Feature importance convergence: SHAP (Study 1) and LIME (Study 2) | 6 |

---

## LIST OF TABLES
*(Page xiv)*

| Table | Caption | Chapter |
|---|---|---|
| 3.1 | Ten readability parameters: name, description, and cognitive basis | 3 |
| 3.2 | Hyperparameter configuration of the SA-BiLSTM model | 3 |
| 3.3 | Dataset statistics: Python and C++ code snippets | 3 |
| 3.4 | IRAF-XADL results on Python data (70/30 split) | 3 |
| 3.5 | IRAF-XADL results on C++ data (70/30 split) | 3 |
| 3.6 | Comparative analysis: IRAF-XADL vs. baselines | 3 |
| 3.7 | Feature pairwise correlation matrix (Pearson r) | 3 |
| 3.8 | Ablation results on Python test set | 3 |
| 3.9 | Confusion matrix — Python test set | 3 |
| 4.1 | Nadam hyperparameter configuration | 4 |
| 4.2 | Dataset statistics (snippet level) | 4 |
| 4.3 | Individual and ensemble results — Python, 70% training | 4 |
| 4.4 | Individual and ensemble results — Python, 30% testing | 4 |
| 4.5 | Per-class breakdown — Python, 30% testing | 4 |
| 4.6 | Individual and ensemble results — C++, 70% training | 4 |
| 4.7 | Individual and ensemble results — C++, 30% testing | 4 |
| 4.8 | ECRVR-MVEL vs. baselines — Python | 4 |
| 4.9 | ECRVR-MVEL vs. baselines — C++ | 4 |
| 4.10 | Ablation conditions for ECRVR-MVEL | 4 |
| 4.11 | Ablation results on Python test set | 4 |
| 4.12 | Pairwise diversity on Python test set | 4 |
| 4.13 | LIME stability across 10 runs | 4 |
| 5.1 | Dataset statistics: developer experience dataset | 5 |
| 5.2 | EESQA-DELMOA classification results (70/30 split) | 5 |
| 5.3 | Comparative analysis: EESQA-DELMOA vs. baselines | 5 |
| 5.4 | Execution time comparison | 5 |
| 5.5 | Stage-by-stage execution time breakdown | 5 |
| 5.6 | Ablation conditions and results | 5 |
| 5.7 | Feature selection frequency across 20 BAHB runs | 5 |
| 5.8 | Per-class results on test set | 5 |
| 5.9 | Impact of imbalance mitigation strategies | 5 |
| 6.1 | Performance summary across three studies | 6 |
| 6.2 | Ensemble vs. individual classifier performance | 6 |

---

## LIST OF APPENDICES
*(Page xv)*

| Appendix | Title |
|---|---|
| A | Dataset Details — Code Snippets: Insights and Readability (Kaggle) and Developer Experience Dataset (Zenodo) |
| B | Hyperparameter Tables — Complete configurations for IRAF-XADL, ECRVR-MVEL, and EESQA-DELMOA |
| C | Evaluation Metric Formulas — Accuracy, Precision, Recall, F1-Score, and AUC definitions |
| D | Reproducibility Information — Library versions, random seeds, hardware specifications, and code availability |

---

*End of Preliminary Pages*
*Placeholders to fill before submission: [REG_NO] on title page*
*Page numbers are approximate — finalise after complete Word typesetting*
