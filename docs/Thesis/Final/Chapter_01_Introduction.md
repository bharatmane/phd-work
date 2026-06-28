# CHAPTER 1: INTRODUCTION

---

## 1.1 Background

A developer sitting down to work on an unfamiliar codebase — a task that occupies the majority of professional software engineering time — typically spends more time reading code than writing it. Studies by Minelli, Mocci, and Lanza (2015) put the ratio at roughly ten to one: for every line a developer writes, they read ten. That reading is not passive browsing. It is active inference — reconstructing the intent, the data flow, the invariants, and the edge cases from the symbols on the screen. The cognitive process underlying this activity is called program comprehension, and it is the central concern of this thesis.

Program comprehension is expensive. The industry's widely cited estimate that software maintenance consumes sixty to seventy percent of total lifecycle cost (Lientz and Swanson, 1980) has held remarkably stable across fifty years of empirical measurement, despite vast changes in languages, tools, and development practices. The cost does not arise from the technical difficulty of the changes themselves but from the time developers spend figuring out what the existing code does before they can safely modify it. Code that is difficult to comprehend multiplies this cost at every touchpoint: every bug fix, every feature addition, every code review, every onboarding session.

The quality of source code — the property that determines how easy or hard it is to comprehend — is not a single attribute. It is layered. At the finest grain, it lives in the names chosen for individual program elements. A function named `calculateDiscountedTotalForLoyalCustomer` communicates its purpose before a developer reads a single line of its body. A function named `calcD` or `f2` does not. These naming decisions, multiplied across thousands of identifiers in a real codebase, constitute what researchers call identifier readability, and they have been shown to directly affect how quickly and accurately developers understand code (Lawrie et al., 2006; Binkley et al., 2013; Schankin et al., 2011).

At a broader grain, readability is visible at the snippet or function level. A function that does one thing clearly, uses consistent naming, avoids deep nesting, and limits its length is easier to read than one that does five things, uses abbreviations, nests six levels deep, and spans three hundred lines. At the broadest grain, readability is a property of the developer who wrote the code. Experience shapes every naming decision, every structural choice, every comment. A developer with deep experience in a domain and language tends to produce code that requires less cognitive effort to follow, not because they follow rules but because they have internalised what communicates well.

Each of these levels has been studied in isolation. Identifier naming quality has been examined by researchers in software engineering and linguistics. Code-level readability has been the subject of annotation studies and machine learning models for fifteen years. Developer experience has been assessed using proxy metrics in the context of defect prediction and project assignment research. What has not existed — prior to this thesis — is a unified, explainable framework that assesses all three levels simultaneously, makes its predictions auditable, and applies consistent methodology across the levels.

This gap has become more urgent as AI-generated code enters production. Large language models such as GitHub Copilot, ChatGPT, and Gemini can generate syntactically correct, functionally adequate code. Whether that code is readable — whether its identifiers communicate intent, whether its structure is navigable, whether it reflects the conventions of its surrounding codebase — is a separate question, and one that tools built for human-written code must now address for AI-generated code as well. The problem this thesis addresses is therefore not merely a historical one about human-written legacy code; it is an active and growing challenge in the way software is produced today.

### 1.1.1 The Three Levels of Program Comprehension

The conceptual structure of this thesis follows a hierarchy that moves from the smallest meaningful unit of source code to the broadest relevant context:

```
 MULTI-LEVEL PROGRAM COMPREHENSION FRAMEWORK
 ┌─────────────────────────────────────────────────────────────┐
 │  LEVEL 3: DEVELOPER                                         │
 │  "Who wrote this code — and how experienced are they?"      │
 │  Tool: EESQA-DELMOA │ Method: SSNN + BAHB + AMBOA           │
 │  Output: ESE / SA / SE / NSE / BOT / UNK                    │
 │  Accuracy: 98.74%   │ Time: 8.27s                           │
 │                                ▲                            │
 │  Experience shapes naming decisions at every level below    │
 ├─────────────────────────────────────────────────────────────┤
 │  LEVEL 2: CODE SNIPPET                                      │
 │  "Is this function readable?"                               │
 │  Tool: ECRVR-MVEL  │ Method: GCN + DBN + Bi-TCN ensemble    │
 │  Output: High / Medium / Low readability                    │
 │  Accuracy: 98.15% (Python) / 98.38% (C++)                  │
 │                                ▲                            │
 │  Snippet quality = aggregate of identifier quality          │
 ├─────────────────────────────────────────────────────────────┤
 │  LEVEL 1: IDENTIFIER                                        │
 │  "Is this name readable?"                                   │
 │  Tool: IRAF-XADL   │ Method: CodeBERT + SA-BiLSTM + SHAP    │
 │  Output: High / Medium / Low readability                    │
 │  Accuracy: 97.36% (Python) / 97.94% (C++)                  │
 └─────────────────────────────────────────────────────────────┘
        ↕ All three levels explained by SHAP and LIME
```

> **[Figure 1.1]** *The three-level program comprehension hierarchy addressed in this thesis.*

**Level 1 — Identifier:** The individual name given to a function, parameter, class, or variable. Identifiers are the vocabulary of source code. Their quality determines whether code reads like prose or cipher. A single identifier is tiny, but a codebase may contain tens of thousands of them, and their collective quality determines the reading experience of the whole.

**Level 2 — Code Snippet:** A function, method, or short code fragment that implements a single logical operation. At this level, readability is shaped by structure as well as naming: how the code is organised, how complex its logic is, how many responsibilities it takes on, and how consistently it applies conventions.

**Level 3 — Developer:** The human who wrote the code. Experience shapes everything that appears in Levels 1 and 2. Assessing developer experience from observable activity features — commit patterns, project involvement, contribution history — provides a complementary view of code quality that does not depend on reading the code itself.

### 1.1.2 The Role of Explainability in Automated Assessment

Accuracy alone is not sufficient for an automated tool to be useful in practice. A model that classifies an identifier as "Low readability" without explaining why cannot guide a developer toward improvement. A model that labels a developer as "inexperienced" without showing which features drove that classification cannot support a fair or actionable assignment decision.

Explainable AI (XAI) provides the bridge between a model's prediction and a human's ability to act on it. The two XAI frameworks used in this thesis — SHAP (Shapley Additive Explanations, Lundberg and Lee, 2017) and LIME (Local Interpretable Model-Agnostic Explanations, Ribeiro et al., 2016) — are both well-established, theoretically grounded, and applicable to black-box deep learning models. Their application here is not decorative. SHAP and LIME explanations, by revealing which features drive each prediction, provide the evidence that the model's decisions are based on properties that practitioners recognise as meaningful.

A secondary benefit of explainability is cross-study validation. If SHAP tells us that Meaningful Clarity is the most important feature for identifier readability classification, and LIME independently tells us the same thing at the snippet level, that convergence is evidence that the feature is genuinely informative — not an artefact of the architecture or the training data. As will be shown in Chapter 6, this kind of cross-study validation is one of the thesis's most significant empirical findings.

---

## 1.2 Significance of the Study

The significance of this research can be understood from two perspectives: academic and practical.

**Academic Significance.** Program comprehension has been studied for more than four decades, yet no published framework has addressed all three levels — identifier, snippet, and developer — within a single, coherent methodology. The literature on identifier quality has developed largely independently of the literature on snippet readability, and both have developed independently of the literature on developer experience assessment. This fragmentation has left open a fundamental question: are the features that predict readability at the identifier level also informative at the snippet level? Does the same cognitive dimension — meaningful, consistent naming — drive readability judgements regardless of the grain at which assessment is performed? This thesis provides the first empirical evidence bearing directly on these questions, through a design that applies consistent explainability tools (SHAP at the identifier level, LIME at the snippet level) and compares their findings.

The research also contributes to the growing body of work on Explainable AI in software engineering. Most XAI applications in this domain concern defect prediction and vulnerability detection. Code readability — a problem that affects every developer on every project, every day — has received comparatively little attention from the XAI community. The three studies in this thesis demonstrate that explainability is both achievable and informative for this class of problem.

**Practical Significance.** The three systems proposed in this thesis address real and pressing needs in software development practice. IRAF-XADL provides a mechanism for automated identifier quality assessment that can be integrated into code review workflows, CI/CD pipelines, and IDE environments. Rather than requiring a senior developer to manually inspect naming decisions, IRAF-XADL can flag weak identifiers before a pull request is merged, with an explanation that tells the developer precisely what property of the name is problematic.

ECRVR-MVEL extends this capability to snippet-level assessment. In a large codebase with hundreds of thousands of functions, automated snippet readability scoring could guide refactoring prioritisation: which functions are most likely to slow down a new team member, which are most likely to introduce bugs, which should be reviewed first.

EESQA-DELMOA addresses a different but equally practical need. Developer experience assessment is currently done informally — through interviews, through subjective judgement, through the accumulated opinions of team leads. An objective, data-driven classification system that runs in 8.27 seconds and classifies a developer's experience level from observable activity patterns provides a transparent, reproducible basis for project assignment and mentoring decisions.

Taken together, the three studies represent a step toward a unified software quality intelligence layer — a set of tools that can automatically assess, at multiple levels of abstraction, the human comprehensibility of the software a team is building.

---

## 1.3 Research Problem

Three specific problems motivate the studies in this thesis. Each represents a gap in the existing literature that the corresponding study is designed to close.

**Problem 1: Identifier readability is poorly measured by existing approaches.** Most automated code readability tools assess identifiers, if at all, using only surface features such as length and convention compliance. They do not assess whether an identifier's tokens are semantically meaningful, whether they are familiar to a domain reader, whether they are pronounceable, or whether they are contextually appropriate for their scope. No published framework combines deep contextual embeddings — which capture the meaning of identifiers in their programming context — with a linguistically grounded multi-dimensional feature set and a model that explains which features drove each prediction.

**Problem 2: Code snippet readability prediction has not benefited from ensemble diversity with explanation.** Single-classifier deep learning models have been applied to code readability prediction with increasing accuracy, but they are vulnerable to the biases and blind spots of their particular architecture. Ensemble methods that combine structurally diverse classifiers — one capturing graph structure, one capturing hierarchical features, one capturing temporal patterns — and explain their combined predictions via LIME have not been applied to this problem.

**Problem 3: Developer experience assessment at scale is unsolved.** Project managers need to assess developer experience quickly and fairly, but existing approaches rely either on subjective interview-based evaluations or on crude proxy metrics (commit count, tenure) that do not capture the multi-dimensional nature of experience. A deep learning system that classifies developer experience accurately, selects the most informative features automatically, and runs in seconds has not been previously published.

**Problem 4: No multi-level, explainable program comprehension framework exists.** Each of the three problems above has been studied in isolation. No existing framework assesses identifier quality, snippet quality, and developer quality under a unified methodology with consistent explainability components.

### Research Questions

The above problems are operationalised as four research questions that structure the empirical work of this thesis:

**RQ1:** Can a set of ten linguistically and cognitively grounded readability parameters, combined with CodeBERT contextual embeddings and a Self-Attention BiLSTM classifier, predict identifier readability with higher accuracy than the best published baselines on Python and C++ benchmark data?

**RQ2:** Does a weighted majority voting ensemble that combines a Graph Convolutional Network, a Deep Belief Network, and a Bidirectional Temporal Convolutional Network achieve higher snippet-level readability classification accuracy than any of its constituent classifiers individually, and than the best published single-classifier baselines?

**RQ3:** Can a Simplified Spiking Neural Network, with features selected by the Bio-inspired Artificial Hummingbird Behaviour algorithm and hyperparameters tuned by the Adaptive Migration Butterfly Optimisation Algorithm, classify developer experience level with accuracy and execution speed that makes the system practically deployable?

**RQ4:** Do SHAP-based explanations of identifier readability predictions and LIME-based explanations of snippet readability predictions converge on the same features as the primary drivers of readability, and if so, what does that convergence imply about the validity of the feature set designed for identifier assessment?

---

## 1.4 Objectives

The thesis pursues the following research objectives, each corresponding directly to one or more of the research questions stated above:

**Objective 1:** To design a syntax-aware identifier preprocessing pipeline that extracts and normalises Python and C++ identifiers using abstract syntax tree parsers, and to compute a set of ten linguistically and cognitively grounded readability parameters from each identifier, covering semantic, structural, contextual, and cognitive dimensions of naming quality.

**Objective 2:** To develop a deep learning classifier for identifier readability that combines CodeBERT contextual embeddings with a Self-Attention BiLSTM architecture, optimised using AdamW, and to integrate SHAP-based explainability to identify which features and tokens drive each readability prediction.

**Objective 3:** To construct an ensemble model for code snippet readability prediction that combines Graph Convolutional Network, Deep Belief Network, and Bidirectional Temporal Convolutional Network classifiers using weighted majority voting, with Nadam optimisation and LIME-based local explanations for each prediction.

**Objective 4:** To develop a developer experience classification system that applies bio-inspired feature selection (BAHB algorithm) to identify the most relevant features from a 26-feature developer profile, trains a Simplified Spiking Neural Network on the selected features, and tunes the network using the Adaptive Migration Butterfly Optimisation Algorithm.

**Objective 5:** To evaluate all three proposed models on publicly available benchmark datasets against state-of-the-art baselines across accuracy, precision, recall, F1-score, and AUC metrics, and to demonstrate the practical significance of the explainability outputs through cross-study analysis.

---

## 1.5 Scope of the Study

This thesis is scoped to three related but distinct studies, each addressing program comprehension at a specific level of abstraction. The boundaries of each scope area are defined below.

### 1.5.1 Identifier Readability Analysis and Explainability

The first study addresses the quality of individual identifiers — function names, parameter names, class names, and variable names — in Python and C++ source code. Identifier extraction uses language-specific abstract syntax tree parsers: LibCST for Python and Tree-Sitter for C++. The scope is restricted to these two languages; the extraction and normalisation pipeline is not designed to generalise to other languages without modification. Ten readability parameters are computed from each identifier. These parameters are designed to reflect natural English naming conventions; identifiers in languages other than English are outside the scope of the evaluation. The classifier produces three readability classes: High, Medium, and Low.

### 1.5.2 Code Snippet Comprehension Prediction

The second study addresses the readability of complete code snippets — short functions or code fragments — from the same Python and C++ dataset used in Study 1. Snippet boundaries are defined by the dataset; the model does not perform automatic segmentation of larger programs into snippets. The ensemble classifier produces three readability classes aligned with the identifier study. LIME explanations are generated per prediction; large-scale human evaluation of explanation quality is not within scope.

### 1.5.3 Developer Experience Level Assessment

The third study addresses the classification of developer experience using a dataset of 703 developer profiles drawn from open-source software contributions (Perez, Urtado, and Vauttier, 2023). The dataset defines six experience classes: Experienced Software Engineer (ESE), Software Architect (SA), Software Engineer (SE), Non-Software Engineer (NSE), Bot (BOT), and Unknown (UNK). The study classifies developers into these six categories as defined by the dataset's labelling scheme. It does not assess the quality of specific commits or pull requests, and it does not attempt to predict future performance.

### 1.5.4 Datasets and Evaluation Methodology

All three studies use publicly available benchmark datasets. Studies 1 and 2 share the Code Snippets: Insights and Readability dataset (Kaggle). Study 3 uses the developer experience dataset from Zenodo. All models are evaluated using 70/30 train/test splits and five standard metrics: accuracy, precision, recall, F1-score, and AUC. Each study includes a comparative analysis against published baseline methods.

### 1.5.5 Exclusions

The following are explicitly outside the scope of this thesis:

- Extension to programming languages other than Python and C++ for code-level studies.
- Human user studies or annotation experiments; readability and experience labels are taken from the benchmark datasets.
- Evaluation on AI-generated code; all training and test data consist of human-written code.
- Industrial deployment; a FastAPI-based deployment of IRAF-XADL demonstrates feasibility but full CI/CD or IDE plugin integration is not formally evaluated.
- Fine-tuning of the CodeBERT model; it is used as a frozen feature extractor throughout.

---

## 1.6 Challenges and Limitations

The research reported in this thesis encountered several significant challenges. Acknowledging them is important both for intellectual honesty and because they define the most productive directions for future work.

**Dataset Label Quality.** The readability labels in the Code Snippets: Insights and Readability dataset are derived from a composite score computed from code metrics, not from a controlled human annotation study. This means the models in Studies 1 and 2 are trained to predict a score-based proxy for readability rather than directly measured human judgements. While score-based labels have been widely used in the code readability literature (Buse and Weimer, 2010), their correlation with actual developer comprehension time has been questioned (Scalabrino et al., 2018). The models therefore make predictions that are valid relative to the dataset's labelling scheme, and the question of whether they predict what a human would judge as readable is addressed only indirectly through the explainability analysis.

**Class Imbalance in the Developer Dataset.** The developer experience dataset is severely imbalanced: the Unknown (UNK) class accounts for 505 of the 703 profiles (72%), while the Bot (BOT) and Non-Software Engineer (NSE) classes have only 10 and 17 instances respectively. This imbalance affects the recall on minority classes and limits the generalisability of the Study 3 results to populations with similarly skewed class distributions. Standard oversampling techniques (SMOTE) and class-weighted loss were considered but not used, as the BAHB feature selection and AMBOA tuning pipeline was evaluated as published.

**Computational Requirements for CodeBERT.** The CodeBERT model used in Studies 1 and 2 requires approximately 500 MB of storage and significant GPU memory for inference. Running IRAF-XADL and ECRVR-MVEL at the scale of a large industrial codebase (millions of identifiers) would require either batched processing with GPU infrastructure or a lighter-weight embedding alternative. The current implementation is validated at research scale; production-scale deployment was not evaluated.

**Language Scope Restriction.** The preprocessing pipelines for Studies 1 and 2 are built on LibCST (Python) and Tree-Sitter (C++). Extending to Java, JavaScript, or other languages requires not just different parsers but re-evaluation of the ten readability parameters, some of which (e.g., Naming Conformance) are defined relative to language-specific conventions. This is a genuine extension effort, not a trivial adaptation.

**Explaining Ensemble Decisions.** LIME generates explanations for individual predictions, but in an ensemble of three classifiers, the explanation relates to the combined output rather than to the reasoning of any single classifier. A developer reading a LIME explanation of an ECRVR-MVEL prediction cannot determine whether the GCN, the DBN, or the Bi-TCN drove the decision. Classifier-level explainability within an ensemble remains an open research problem.

---

## 1.7 Potential Impact

The three studies in this thesis, taken individually and together, have significant potential impact across software engineering practice, software quality research, and the wider application of explainable AI.

### 1.7.1 Improved Code Quality Assessment

IRAF-XADL provides the first published tool for automated identifier readability assessment that combines contextual embeddings, multi-dimensional feature analysis, and interpretable per-prediction explanations. Integrated into a code review pipeline, such a tool could flag low-readability identifiers before they enter the main branch, reducing the accumulation of comprehension debt in a codebase. At the snippet level, ECRVR-MVEL could prioritise functions for refactoring within a legacy codebase, directing engineering effort toward the areas most likely to slow down future developers. Together, these two tools address the largest single contributor to maintenance cost: code that is difficult to understand.

### 1.7.2 Accessible Tools for Development Teams

Existing code quality analysis requires either expert human review — which is expensive and inconsistent — or simple linting tools that check formatting conventions without addressing semantic quality. IRAF-XADL and ECRVR-MVEL occupy a middle ground: they are automated, fast, and linguistically informed, yet they produce explanations that a non-expert developer can understand and act on. A junior developer told "your identifier `d` scores low on Meaningful Clarity because none of its tokens match recognisable English words" has actionable information that a linter-style warning ("identifier too short") does not provide. This democratisation of readability feedback has potential impact for teams without dedicated code quality resources.

### 1.7.3 Developer-Centric Quality Insights

EESQA-DELMOA demonstrates that developer experience level can be classified from observable activity patterns with 98.74% accuracy and an execution time of 8.27 seconds. The practical implications are significant: project assignment decisions, mentoring allocation, and code review pairing are all currently made on the basis of informal assessments that may be influenced by recency bias, personal familiarity, or incomplete information. A transparent, data-driven classification system provides an objective, reproducible, and explainable input to these decisions. The BAHB feature selection stage also identifies which observable developer behaviours are most predictive of experience level — a finding of independent interest for HR analytics and talent development in software organisations.

### 1.7.4 Advancement of Explainable AI in Software Engineering

The convergent finding from SHAP (Study 1) and LIME (Study 2) — that Meaningful Clarity and Naming Conformance are the primary drivers of readability predictions at both the identifier and snippet levels — is methodologically significant beyond this thesis. It demonstrates that XAI tools can be used not just to explain individual predictions but to validate feature engineering decisions across independent models and levels of analysis. This cross-level explainability validation methodology is novel and can be applied in any domain where multi-level assessment is performed. The thesis thereby contributes a methodological contribution to the XAI community, distinct from the software engineering contributions of the three studies themselves.

---

## 1.8 Research Contributions

This thesis makes five original contributions to the fields of program comprehension, software quality assessment, and explainable AI:

**Contribution 1 — A ten-dimensional identifier readability parameter set.** Prior work on identifier quality has relied on small feature sets (typically two to six features) covering surface properties such as length and convention compliance. The ten parameters introduced in this thesis — Meaningful Clarity (MC), Naming Conformance (NC), Optimal Length (OL), Domain Relevance (DR), Pronounceability (PR), Lexical Familiarity (LF), Context Consistency (CC), Scope Appropriateness (SA), Cognitive Load Score (CLS), and Predictability (PRED) — provide a substantially richer representation of naming quality. They cover semantic, structural, contextual, and cognitive dimensions simultaneously and are designed to be language-independent in principle, though evaluated on Python and C++.

**Contribution 2 — IRAF-XADL.** The Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning is the first published system to combine language-specific AST-based identifier extraction, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, AdamW optimisation, and SHAP-based post-hoc explanations for identifier-level readability classification across Python and C++. On the benchmark dataset, it achieves test accuracy of 97.36% (Python) and 97.94% (C++), exceeding all published baselines by a substantial margin.

**Contribution 3 — ECRVR-MVEL.** The Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning model introduces weighted majority voting over three structurally diverse deep classifiers (GCN, DBN, Bi-TCN) for snippet-level readability prediction, with LIME explanations and Nadam optimisation. It achieves 98.15% test accuracy for Python and 98.38% for C++, and provides the first LIME-explained snippet readability assessments in the literature.

**Contribution 4 — EESQA-DELMOA.** The Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms is a complete system for classifying developer experience level that combines bio-inspired feature selection, spiking neural network classification, and metaheuristic hyperparameter optimisation. It achieves 98.74% test accuracy on the six-class developer experience dataset with an execution time of 8.27 seconds — the lowest among all compared methods.

**Contribution 5 — A multi-level, explainability-first view of program comprehension.** The three studies share a conceptual framework in which explainability is not an afterthought but a design requirement. The convergent finding — that SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity and Naming Conformance as primary readability drivers — provides cross-validation evidence that the feature engineering choices in Study 1 generalise beyond the identifier level. This is the first reported convergence of SHAP and LIME findings across two levels of code readability analysis.

---

## 1.9 Structure of the Thesis

The remainder of this thesis is structured as follows.

**Chapter 2** presents a critical review of the literature, organised into eleven thematic areas: program comprehension history and theory, code readability definitions and early measurement, identifier quality assessment, machine learning for code analysis, deep learning for code analysis, transformer models in software engineering, ensemble methods, spiking neural networks, explainable AI in software engineering, developer experience assessment, and a research gap analysis that maps reviewed contributions to the gaps addressed by each study.

**Chapter 3** presents IRAF-XADL in full detail: the preprocessing pipeline, the ten readability parameters with their mathematical definitions, the CodeBERT embedding procedure, the SA-BiLSTM architecture with complete equations, the AdamW optimisation formulation, the SHAP explainability procedure, the experimental setup, results on Python and C++ data, comparative analysis, and SHAP-based findings.

**Chapter 4** presents ECRVR-MVEL: the preprocessing pipeline, CodeBERT encoding at the snippet level, the three individual classifiers (GCN, DBN, Bi-TCN) with their architectures and mathematical formulations, the weighted majority voting scheme, Nadam optimisation, LIME explanation procedure, experimental results on both languages, comparative analysis, and LIME-based findings.

**Chapter 5** presents EESQA-DELMOA: the developer experience dataset, min-max normalisation, the BAHB feature selection algorithm with its mathematical formulation, the SSNN architecture and membrane potential dynamics, the AMBOA hyperparameter tuning procedure, experimental results, comparative analysis, and execution time analysis.

**Chapter 6** provides a cross-study analysis that examines relationships between the three studies: the convergence of SHAP and LIME findings, the role of CodeBERT across both code-level studies, the validation of the ensemble diversity principle, the practical implications for software engineering teams, and the threats to validity of the research.

**Chapter 7** concludes the thesis by summarising the contributions, providing explicit answers to the four research questions, acknowledging the remaining limitations, and identifying the most promising directions for future research.

The thesis ends with a full bibliography in Chicago format, a list of publications arising from the research, and appendices containing supplementary dataset statistics, additional experimental results, and hyperparameter tables.

---

## 1.10 Summary

This chapter has established the context, motivation, and structure of the research. Program comprehension — the cognitive process by which developers understand source code — is central to nearly every activity in software engineering, and its cost is substantial. Despite this, automated tools for assessing and explaining the comprehensibility of code have remained narrow, fragmented, and largely unexplainable.

This thesis addresses the problem at three levels of abstraction: the individual identifier name, the code snippet, and the developer who wrote it. The four research problems and five research objectives stated in this chapter define the scope of the empirical work. The five original contributions — the ten-parameter identifier readability feature set, IRAF-XADL, ECRVR-MVEL, EESQA-DELMOA, and the multi-level explainability framework — collectively address a gap in the literature that no prior work has filled.

The challenges identified — dataset label quality, class imbalance, computational requirements, language scope, and ensemble explainability — are real but bounded. The potential impact, spanning improved code quality tooling, accessible feedback for development teams, objective developer assessment, and a novel XAI validation methodology, is substantial and well-grounded in the empirical findings that the remaining chapters present.

Chapter 2 begins the substantive work with a critical survey of the literature across the eleven thematic areas that provide the foundation for the three studies.

---

*End of Chapter 1*
