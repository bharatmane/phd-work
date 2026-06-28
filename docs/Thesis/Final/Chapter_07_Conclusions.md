# CHAPTER 7: CONCLUSIONS AND FUTURE WORK

---

## 7.1 Summary of the Research

This thesis set out to address a long-standing gap in the automated assessment of software quality: the absence of a unified, explainable framework that measures code comprehensibility at multiple levels of abstraction. Three studies were conducted, each targeting a different level of the program comprehension hierarchy — the individual identifier, the code snippet, and the developer who wrote the code. All three studies were evaluated on publicly available benchmark datasets, compared against published baselines, and equipped with explainability components that make their predictions auditable and actionable.

**Study 1 — IRAF-XADL** proposed the first system that combines AST-based identifier extraction, a ten-dimensional linguistically grounded readability parameter set, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, AdamW optimisation, and SHAP explainability for identifier-level readability classification in Python and C++. The system achieved test accuracy of 97.36% (Python) and 97.94% (C++), exceeding the best published baseline (SMO) by over fifteen percentage points. An ablation study confirmed that CodeBERT provides the largest single contribution (12.64 pp), followed by the ten-feature set (5.91 pp), self-attention (2.53 pp), and AdamW (2.25 pp). A deployable REST API (FastAPI) operationalises the full pipeline in a single HTTP endpoint.

**Study 2 — ECRVR-MVEL** proposed a weighted majority voting ensemble of three structurally diverse deep classifiers — a Graph Convolutional Network, a Deep Belief Network, and a Bidirectional Temporal Convolutional Network — for snippet-level readability prediction, with Nadam optimisation and LIME explanations. The ensemble achieved test accuracy of 98.15% (Python) and 98.38% (C++), exceeding the best baseline by over eight percentage points and substantially outperforming each individual classifier. The ablation study confirmed that CodeBERT (12.72 pp), the GCN's structural sensitivity (5.28 pp marginal contribution to ensemble), and learned rather than equal weights (1.81 pp) all contribute meaningfully.

**Study 3 — EESQA-DELMOA** proposed a developer experience classification system combining bio-inspired feature selection (BAHB), a Simplified Spiking Neural Network classifier, and metaheuristic hyperparameter tuning (AMBOA) for six-class developer experience classification. The system achieved test accuracy of 98.74% — the highest among all eight compared methods — with an execution time of 8.27 seconds — the lowest among all eight methods. The ablation study confirmed contributions from min-max normalisation (3.56 pp), SSNN vs. conventional ANN (2.82 pp), AMBOA tuning (2.63 pp), and BAHB feature selection (1.87 pp).

A cross-study analysis (Chapter 6) revealed the thesis's most significant emergent finding: SHAP explanations from Study 1 and LIME explanations from Study 2 independently identify Meaningful Clarity (MC) and Naming Conformance (NC) as the primary drivers of code readability predictions — providing the first cross-method, cross-level XAI validation in the code readability literature.

---

## 7.2 Answers to the Research Questions

**RQ1:** *Can a set of ten linguistically and cognitively grounded readability parameters, combined with CodeBERT contextual embeddings and a Self-Attention BiLSTM classifier, predict identifier readability with higher accuracy than the best published baselines?*

**Yes.** IRAF-XADL achieves 97.36% test accuracy for Python and 97.94% for C++, compared with 82.00% and 80.56% for the best baselines (SMO) on the respective languages. The margin of 15+ percentage points is consistent across accuracy, precision, recall, F1-score, and AUC. The combination of the ten-parameter feature set and CodeBERT embeddings provides richer representation than any prior approach; the SA-BiLSTM captures sequential and contextual relationships that simpler classifiers miss. The ablation study confirms that each component of this combination contributes uniquely.

**RQ2:** *Does a weighted majority voting ensemble of GCN, DBN, and Bi-TCN achieve higher snippet-level readability classification accuracy than any individual classifier and the best baselines?*

**Yes.** The ECRVR-MVEL ensemble achieves 98.15%/98.38% (Python/C++) compared to the best individual classifier (Bi-TCN: 95.38%/93.81%) and the best baseline (Neural Network: 90.11% for Python; Decision Tree: 92.84% for C++). The ensemble advantage over individual classifiers is larger on the test set than the training set, confirming that diversity reduces generalisation error as predicted by ensemble theory. Pairwise diversity analysis (GCN–DBN disagreement: 11.2%) quantifies the mechanism behind this gain.

**RQ3:** *Can a Simplified Spiking Neural Network with BAHB feature selection and AMBOA hyperparameter tuning classify developer experience level with accuracy and efficiency suitable for practical deployment?*

**Yes.** EESQA-DELMOA achieves 98.74% test accuracy — the highest of all eight compared methods — with an execution time of 8.27 seconds — the lowest of all eight. The 12-millisecond per-developer inference time is well within requirements for interactive tools and CI/CD pipeline integration. The BOT class's low recall (20%) is a known limitation arising from extreme class imbalance (10 total BOT profiles) rather than a systemic failure of the approach. The sensitivity analysis in Section 5.15 demonstrated that threshold adjustment can improve BOT recall to 40% with minimal degradation to other classes.

**RQ4:** *Do SHAP and LIME explanations converge on the same features as primary drivers of readability predictions across two levels of analysis?*

**Yes.** SHAP analysis (Study 1) identifies Meaningful Clarity (MC) and Naming Conformance (NC) as the dominant features for identifier-level readability across both Python and C++. LIME analysis (Study 2) independently identifies identifier naming tokens as the most influential elements in snippet-level readability predictions, with MC, PRED, and NC feature thresholds emerging as the primary signals. This convergence — across two independent explainability methods, two levels of analysis, two different classifiers, and two programming languages — is the thesis's central cross-study finding. It validates the ten-parameter feature set as capturing a genuinely informative signal, and provides practitioners with consistent, actionable guidance: improve identifier naming quality first.

---

## 7.3 Contributions Revisited

Five original contributions were claimed in Chapter 1. Each has been demonstrated through the research:

**Contribution 1 — Ten-dimensional identifier readability parameter set.** Chapter 3 defines all ten parameters with mathematical formulations and cognitive justifications derived from fifty years of program comprehension and psycholinguistic research. The SHAP analysis confirms that these parameters carry predictive signal: MC and NC together account for the majority of IRAF-XADL's predictive information. The feature correlation matrix (Table 3.7) confirms that no feature pair exceeds r = 0.90, establishing that the ten features measure genuinely distinct dimensions.

**Contribution 2 — IRAF-XADL.** Demonstrated in Chapter 3 with full architectural detail, experimental results, ablation study, worked qualitative examples, and comparative analysis. Test accuracy exceeds all seven baselines by a substantial margin on both languages. A deployable REST API (FastAPI) operationalises the full pipeline — AST extraction, ten-feature computation, CodeBERT embedding, SA-BiLSTM inference, and plain-English explanation generation — in a single HTTP endpoint, demonstrating that the contribution extends from a research prototype to a practically deployable system.

**Contribution 3 — ECRVR-MVEL.** Demonstrated in Chapter 4. The ensemble design (GCN + DBN + Bi-TCN with weighted majority voting), LIME explainability, Nadam optimisation, and LIME stability analysis are all novel in the code snippet readability context. The ensemble outperforms all baselines, all individual classifiers, and demonstrates that the gains arise from genuine architectural diversity rather than weight tuning alone (equal-weight voting achieves only 96.34% vs. learned-weight WMVE at 98.15%).

**Contribution 4 — EESQA-DELMOA.** Demonstrated in Chapter 5. The combination of SSNN with BAHB feature selection and AMBOA tuning is novel for developer experience classification. The system achieves the highest accuracy and lowest execution time among compared methods. Feature importance analysis from BAHB confirms domain-intuitive rankings (commit ownership and project diversity are consistently the most predictive features). Manual assessment comparison showed EESQA-DELMOA performing comparably to human expert judges.

**Contribution 5 — Multi-level, explainability-first program comprehension framework.** Demonstrated in Chapter 6 through the cross-study analysis. The convergence of SHAP and LIME findings is the empirical validation of this contribution's central claim: that explainability components not only make predictions auditable but also validate feature engineering choices across levels. The explicit causal chain (developer experience → identifier quality → snippet readability) positions the three studies as a coherent framework, not merely three independent papers.

---

## 7.4 Limitations

Three principal limitations of this thesis should be noted by researchers and practitioners who build on this work.

**Limitation 1: Label granularity and validity.** Readability labels in Studies 1 and 2 are derived from a composite code quality score measuring code simplicity (length, complexity, identifier count) rather than human-evaluated readability of identifier names specifically. The models are learning, in part, to predict code simplicity — a related but distinct construct. The SHAP and LIME analyses provide partial mitigation (naming features dominate even given the imperfect labels), but future work with human-annotated identifier-specific readability labels would directly test whether IRAF-XADL's features capture what human annotators attend to.

**Limitation 2: Language scope.** Studies 1 and 2 cover Python and C++ only. The preprocessing pipelines use language-specific parsers, and NC convention rules are language-specific. Results do not generalise to Java, JavaScript, Rust, or other languages without re-specifying convention rules and evaluating on appropriate datasets.

**Limitation 3: Class imbalance in Study 3.** The developer experience dataset's extreme imbalance (71.8% UNK, 1.4% BOT) limits reliable classification of rare categories — particularly BOT (20% recall). This limitation is inherent to the available labelled data and is not resolvable without additional data collection targeting underrepresented categories.

---

## 7.5 Future Research Directions

Eight research directions emerge from the limitations, findings, and open questions raised in this thesis. They are ordered by estimated impact and feasibility.

### 7.5.1 Human Validation Study

**Research question:** Do IRAF-XADL's High/Medium/Low classifications correspond to measurable differences in developer comprehension speed and accuracy?

**Proposed methodology:** Select 60 Python functions with predominantly High, Medium, and Low IRAF-XADL-classified identifiers. For Low-readability functions, create paired versions where SHAP-guided renaming replaces the worst identifiers (targeting the primary negative features: if MC dominates, replace non-word tokens; if NC dominates, fix convention violations). Recruit 90 professional Python developers across three conditions; measure comprehension accuracy, time-to-first-correct-hypothesis, and bug detection time for seeded defects.

**Expected contribution:** Direct ecological validity evidence — whether IRAF-XADL's classifications correspond to real comprehension consequences — and calibration of the model's deployment threshold (what P(Low) score corresponds to a practically significant comprehension cost?). This study mirrors Hofmeister et al. (2017) but uses IRAF-XADL predictions rather than manually assigned naming styles.

### 7.5.2 Fine-Tuning CodeBERT

**Research question:** How much does fine-tuning CodeBERT improve identifier and snippet readability classification accuracy?

**Proposed methodology:** Unfreeze CodeBERT weights (125M parameters) and train the full model jointly with the SA-BiLSTM head using a lower learning rate (1e-5), smaller batch size (8), gradient accumulation, and layer-wise learning rate decay to prevent catastrophic forgetting.

**Expected contribution:** Establishes the performance ceiling achievable with full computational budget. The gap between frozen (97.36%) and fine-tuned performance will quantify how much identifier readability signal is already in CodeBERT's pre-training versus how much requires task-specific adaptation.

### 7.5.3 Multi-Language Extension

**Research question:** Do the ten readability parameters, the SA-BiLSTM architecture, and the SHAP importance rankings generalise to Java and JavaScript?

**Proposed methodology:** Extend AST-based extraction to Java (JavaParser) and JavaScript (Esprima/Babel). Specify NC convention rules per language. Train IRAF-XADL on Java and JavaScript data and compare SHAP rankings to Python/C++ findings.

**Expected contribution:** A four-language IRAF-XADL covering the most commonly used languages in industry, with empirical evidence of either consistent or language-specific feature importance.

### 7.5.4 Integrated Multi-Level Pipeline

**Research question:** Does feeding IRAF-XADL identifier quality scores as additional features to ECRVR-MVEL improve snippet classification accuracy?

**Proposed methodology:** Extend the ECRVR-MVEL preprocessing to include IRAF-XADL's ten-parameter scores (aggregated across all identifiers in the snippet) as additional input features alongside the CodeBERT embedding. Evaluate whether this richer representation improves snippet-level accuracy beyond the standalone ECRVR-MVEL.

**Expected contribution:** The first empirical test of whether the causal dependency between Level 1 and Level 2 in the multi-level framework — identifier quality informing snippet quality prediction — provides measurable performance improvement when modelled explicitly.

### 7.5.5 Class Rebalancing for Developer Classification

**Research question:** If BOT and NSE classes are augmented with additional labelled profiles, does BOT recall improve substantially?

**Proposed methodology:** Collect additional BOT profiles from known GitHub bots (Renovate, Dependabot, GitHub Actions) and additional NSE profiles from verified non-developer GitHub accounts (designers, project managers). Augment the Perez et al. dataset with 50 additional BOT and 50 additional NSE profiles, retrain EESQA-DELMOA, and compare BOT recall to the 20% baseline.

**Expected contribution:** Determines whether the BOT recall limitation is a data problem (solvable with more labelled examples) or an inherent difficulty of distinguishing BOTs from sparse human contributors using the available features.

### 7.5.6 AI-Generated Code Readability Assessment

**Research question:** Do AI-generated code snippets systematically achieve different IRAF-XADL and ECRVR-MVEL readability scores than human-written code for the same tasks?

**Proposed methodology:** Collect 200 programming tasks, generate solutions using three AI tools (GitHub Copilot, ChatGPT, Gemini Code Assist) and three human developers per task. Run IRAF-XADL and ECRVR-MVEL on all outputs. Compare readability distributions across AI tools and human developers, and validate against human raters.

**Expected contribution:** First systematic readability assessment of AI-generated code. Given the rapidly growing proportion of AI-generated code in production, this finding would have immediate practical implications for code review practices and AI tool evaluation benchmarks.

### 7.5.7 IDE Integration and Longitudinal User Study

**Research question:** Does providing IRAF-XADL predictions as real-time IDE feedback during coding improve naming quality over time?

**Proposed methodology:** Develop a VS Code extension calling the IRAF-XADL API. Display predicted readability class and SHAP attributions as inline hover text. Conduct a randomised controlled trial with 40 developers (20 with plugin, 20 without) on a standardised coding task, measuring MC/NC score distributions and developer-reported cognitive overhead.

**Expected contribution:** Direct evidence that automated identifier readability feedback during coding improves naming quality, and quantification of cognitive overhead — critical for adoption decisions.

### 7.5.8 Spiking Neural Networks with Neuromorphic Hardware

**Research question:** What is the efficiency advantage of EESQA-DELMOA on neuromorphic processors (Intel Loihi, IBM TrueNorth) that natively support sparse spiking computation?

**Expected contribution:** The SSNN's efficiency advantage demonstrated on conventional CPU hardware (8.27s) is expected to grow by one to two orders of magnitude on neuromorphic hardware. This would demonstrate the full efficiency potential of the SSNN approach and establish a roadmap for energy-efficient deployment at scale.

---

## 7.6 Impact Statement

Three practical impacts can be anticipated from this thesis:

**Impact 1 — Quality assurance practice.** Deployment of IRAF-XADL and ECRVR-MVEL as CI/CD quality gates gives development teams a routine, automated mechanism for monitoring identifier naming quality and snippet readability. Teams that currently rely entirely on human code review to catch naming problems can supplement that review with automated pre-screening, reducing reviewer burden and the latency between code submission and feedback.

**Impact 2 — Developer education.** The explainability outputs of IRAF-XADL provide personalised naming quality education. A junior developer whose `psgCnt` identifier is flagged with "MC = 0 because `psg` and `cnt` are not recognisable English words" learns not just that the name is problematic but why, in terms that map directly to the principle they should internalise: use meaningful words. This is qualitatively different from the feedback a linter provides.

**Impact 3 — AI code quality benchmarking.** As AI code generation becomes pervasive, the need for automated readability assessment grows proportionally. A developer using GitHub Copilot does not review each identifier name with the same attention as code they write themselves. IRAF-XADL's ability to automatically flag AI-suggested identifiers falling below readability thresholds would provide a lightweight quality gate for AI-assisted development that currently exists in no commercial tool.

---

## 7.7 Closing Remarks

The question that opened this thesis — can program comprehension be assessed automatically, accurately, and interpretably at every level of abstraction? — has a clear, evidence-based answer in the three systems described here.

At the identifier level, IRAF-XADL assesses readability with 97%+ accuracy and explains each prediction with SHAP attributions that identify the precise dimensions of naming quality that drove the verdict. At the snippet level, ECRVR-MVEL classifies readability with 98%+ accuracy using an ensemble whose diversity is quantified and whose predictions are explained by LIME. At the developer level, EESQA-DELMOA classifies experience with 98.74% accuracy in 8.27 seconds, fast enough for real-time deployment.

The more important finding, however, is what the explainability analyses reveal about what quality means. Meaningful Clarity and Naming Conformance — whether an identifier's tokens are recognisable words, and whether it follows the conventions of its language — are the primary drivers of readability predictions at both the identifier and snippet levels. This convergence suggests that code readability, at its core, is about communication: does the code say what it means, in a language the reader can parse without effort?

That is not a surprising finding. Experienced developers have known it for decades. Kernighan and Plauger wrote as much in 1978. What this thesis contributes is the machinery to measure it automatically, explain it to any reader, and validate it empirically across two levels of analysis with two independent methods — moving the insight from received wisdom to empirically grounded, quantifiable knowledge.

The practical work of making code more readable — one identifier at a time — can now be supported by tools that know what they are measuring and why.

---

*End of Chapter 7*
