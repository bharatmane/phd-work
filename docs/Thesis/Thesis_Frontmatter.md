# EXPLAINABLE DEEP LEARNING FOR MULTI-LEVEL PROGRAM COMPREHENSION: IDENTIFIER READABILITY, CODE SNIPPET ANALYSIS, AND DEVELOPER EXPERIENCE CLASSIFICATION

Thesis submitted to Alliance University for the Award of
**DOCTOR OF PHILOSOPHY**

In **Faculty of Engineering and Technology**

By

**BHARAT BABASO MANE**
Registration No.: [REG_NO]

Under the Supervision of

**Dr. Rathnakar Achary**
Associate Professor
Alliance School of Advance Computing

Alliance University Central Campus
Chikkahadage Cross, Chandapura-Anekal Main Road
Bengaluru, Karnataka 562106

**2026**

---

## DECLARATION

I declare that the thesis entitled *Explainable Deep Learning for Multi-Level Program Comprehension: Identifier Readability, Code Snippet Analysis, and Developer Experience Classification* has been prepared by me under the guidance of Dr. Rathnakar Achary, Associate Professor, Alliance School of Advance Computing, Alliance University. No part of this thesis has formed the basis for the award of any degree in any university or fellowship previously. The work reported in this thesis was carried out independently by me unless explicitly acknowledged in the text.

Bharat Babaso Mane
Alliance School of Advance Computing
Alliance University
Chikkahadage Cross, Chandapura-Anekal Main Road
Bengaluru, Karnataka 562106

Signature: ___________________________
Date: ________________________________

---

## CERTIFICATE

I certify that Bharat Babaso Mane has prepared his thesis entitled *Explainable Deep Learning for Multi-Level Program Comprehension: Identifier Readability, Code Snippet Analysis, and Developer Experience Classification*, for the award of the PhD degree of Alliance University, under my guidance. He has carried out the work at the Alliance School of Advance Computing, Alliance University.

**Dr. Rathnakar Achary**
Associate Professor
Alliance School of Advance Computing
Alliance University
Bengaluru, Karnataka 562106

Signature: ___________________________
Date: ________________________________

---

## DEDICATION

To my parents, whose sacrifices made every page of this work possible.

To my supervisor, Dr. Rathnakar Achary, for the direction, patience, and rigour that shaped this research.

And to every software developer who has ever inherited someone else's code and wondered what on earth it was supposed to do.

---

## ACKNOWLEDGEMENT

Completing a doctoral thesis is a long and humbling process, and mine was shaped by many people whose contributions I want to acknowledge with honesty rather than ceremony.

Dr. Rathnakar Achary, my supervisor, offered something rarer than technical guidance: he consistently asked better questions than I had thought to ask myself. His insistence that results must be explainable — not just accurate — gave this thesis its defining theme.

The faculty and staff of the Alliance School of Advance Computing provided an environment in which research could be taken seriously. I am grateful for access to computational resources, library systems, and collegial exchange that sustained this work.

My colleagues and peers across six years of doctoral study offered critical feedback, pointed out my blind spots, and were generous enough to disagree with me when they had reason to.

My family understood that a PhD is not a project with weekends. Their patience with my absences — physical and mental — is something I recognise and can only partially repay.

The datasets that made this research possible were created and shared by Paakhim10 (Kaggle Code Snippets: Insights and Readability) and by Perez, Urtado, and Vauttier (Zenodo developer experience dataset). Open data is a public good, and this thesis would not exist without it.

Bharat Babaso Mane
Bengaluru, 2026

---

## ABSTRACT

Program comprehension — the cognitive process by which software developers understand what code does, how it is structured, and who built it — underpins nearly every phase of the software development lifecycle. Maintenance, debugging, refactoring, code review, and developer onboarding all depend on a developer's ability to read and make sense of source code quickly and accurately. Industry estimates consistently place maintenance at sixty to seventy percent of total software lifecycle cost, and a substantial portion of that cost is attributable to code that is difficult to read. Despite this, automated tools for measuring and explaining code quality have remained narrow, most assessing surface characteristics such as line length and indentation while ignoring the semantic content — specifically, the naming quality of identifiers — that experienced developers attend to when judging code.

This thesis attacks the problem from three complementary directions, organised by the level of abstraction at which each study operates.

The first study, IRAF-XADL (Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning), operates at the finest grain: the individual identifier. Source code identifiers — function names, parameter names, class names, and variable names — are the primary carriers of a developer's conceptual model. IRAF-XADL extracts identifiers using language-specific abstract syntax tree parsers for Python (LibCST) and C++ (Tree-Sitter), computes ten linguistically and cognitively grounded readability parameters from each identifier, encodes it with CodeBERT contextual embeddings, and classifies it as High, Medium, or Low readability using a Self-Attention BiLSTM optimised with AdamW. SHAP-based post-hoc explanations identify which features drove each prediction. On the Code Snippets: Insights and Readability benchmark (Kaggle), IRAF-XADL achieves test accuracy of 97.36% for Python and 97.94% for C++, surpassing the best published baseline (SMO at 82.00% for Python) by more than fifteen percentage points.

The second study, ECRVR-MVEL (Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning), widens the unit of analysis from a single identifier to a complete code snippet. ECRVR-MVEL applies CodeBERT to encode the full snippet, then combines three structurally diverse classifiers — a Graph Convolutional Network, a Deep Belief Network, and a Bidirectional Temporal Convolutional Network — in a weighted majority vote, optimised with the Nadam algorithm. LIME provides local explanations for each prediction. On the same benchmark dataset, ECRVR-MVEL achieves test accuracy of 98.15% for Python and 98.38% for C++, outperforming the Neural Network baseline by more than eight percentage points.

The third study, EESQA-DELMOA (Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms), shifts focus from the code artefact to the developer who produced it. Developer experience is a known predictor of software quality, yet it has rarely been assessed automatically at scale. EESQA-DELMOA applies min-max normalisation, Bio-inspired Artificial Hummingbird Behaviour (BAHB) feature selection, a Simplified Spiking Neural Network (SSNN) classifier, and Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) hyperparameter tuning to classify developer experience into six categories. On the Perez et al. dataset (Zenodo, 703 developer profiles), the system achieves test accuracy of 98.74% with an execution time of 8.27 seconds — the lowest of all compared methods, and substantially below the next best (Naïve Bayes at 11.60 seconds).

A cross-study analysis reveals a consistent finding: SHAP explanations in Study 1 and LIME explanations in Study 2 independently identify Meaningful Clarity (MC) and Naming Conformance (NC) as the dominant predictors of code readability. This convergence, across two independent explainability methods and two levels of analysis, validates the relevance of the ten-parameter feature set beyond the identifier level at which it was originally designed.

Together, the three studies establish that program comprehension can be assessed automatically, accurately, and interpretably at every level of the software development artefact hierarchy — from the naming of a single variable, through the structure of a code snippet, to the experience of the developer who wrote it. The thesis makes five original contributions: a ten-dimensional identifier readability parameter set; the IRAF-XADL framework; the ECRVR-MVEL ensemble framework; the EESQA-DELMOA developer assessment system; and a multi-level, explainability-first view of program comprehension that integrates all three.

**Keywords:** Program Comprehension; Code Readability; Identifier Quality; CodeBERT; Self-Attention BiLSTM; Graph Convolutional Network; Deep Belief Network; Bidirectional Temporal Convolutional Network; Spiking Neural Network; Explainable AI; SHAP; LIME; Software Quality Assessment; Developer Experience

---

## PREFACE

This thesis reports three independent but related studies completed as part of a doctoral research programme in computer science and software engineering at Alliance University, Bengaluru. Each study was designed to address a specific gap in the automated assessment of program comprehension and source code quality.

The studies are presented in order of increasing abstraction: from the individual identifier (Chapter 3) to the code snippet (Chapter 4) to the developer behind the code (Chapter 5). Chapters 3, 4, and 5 are substantially based on papers that have been peer-reviewed and accepted for publication. The bibliographic details of these publications appear in the List of Publications at the end of the thesis.

Wherever results, figures, or tables are drawn directly from the published papers, this is indicated in the text. The comparative analysis, cross-study discussion, and synthesis in Chapters 6 and 7 are original to this thesis and do not appear in the published papers.

---

## TABLE OF CONTENTS

1. Introduction
2. Literature Review
3. IRAF-XADL: Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning
4. ECRVR-MVEL: Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning
5. EESQA-DELMOA: Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms
6. Cross-Study Analysis and Discussion
7. Conclusions and Future Work

References  
List of Publications  
Appendices  

---

## LIST OF TABLES

| Table | Caption | Chapter |
|---|---|---|
| 3.1 | Ten readability parameters: name, description, and cognitive basis | 3 |
| 3.2 | Hyperparameter configuration of the SA-BiLSTM model | 3 |
| 3.3 | Dataset statistics: Python and C++ code snippets | 3 |
| 3.4 | Sample Python code snippets and their readability levels | 3 |
| 3.5 | Sample C++ code snippets and their readability levels | 3 |
| 3.6 | IRAF-XADL results on Python data (70/30 split) | 3 |
| 3.7 | IRAF-XADL results on C++ data (70/30 split) | 3 |
| 3.8 | Comparative analysis: IRAF-XADL vs. baselines on Python and C++ | 3 |
| 4.1 | Dataset statistics for ECRVR-MVEL | 4 |
| 4.2 | Individual classifier and ensemble results: Python data, 70% training | 4 |
| 4.3 | Individual classifier and ensemble results: Python data, 30% testing | 4 |
| 4.4 | Individual classifier and ensemble results: C++ data, 70% training | 4 |
| 4.5 | Individual classifier and ensemble results: C++ data, 30% testing | 4 |
| 4.6 | Comparative analysis: ECRVR-MVEL vs. baselines on Python | 4 |
| 4.7 | Comparative analysis: ECRVR-MVEL vs. baselines on C++ | 4 |
| 5.1 | Dataset statistics: developer experience dataset | 5 |
| 5.2 | EESQA-DELMOA classification results (70/30 split) | 5 |
| 5.3 | Comparative analysis: EESQA-DELMOA vs. baselines | 5 |
| 5.4 | Execution time comparison | 5 |
| 6.1 | Summary of contributions across all three studies | 6 |
| 6.2 | Convergence of explainability findings (SHAP vs. LIME) | 6 |

---

## LIST OF FIGURES

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
