# CHAPTER 3: RESEARCH DESIGN AND METHODOLOGY

## 3.1 Introduction

Research methodology is the bridge between a question and an answer. It specifies not just what was done, but why those choices were made over alternatives, what assumptions they rest on, and what the resulting answers can and cannot mean. In software engineering research, this bridge is often crossed quickly — papers report architectures and results without explaining the epistemological commitments that shaped the experimental design. This thesis takes a different approach. Before the three technical studies are presented, this chapter makes those commitments explicit.

The structure of this chapter follows four levels of methodological decision. The first concerns the research paradigm: the philosophical stance that governs how knowledge claims are made and what counts as evidence. The second concerns the research strategy: how the paradigm is translated into a study design. The third concerns the data and evaluation choices: what datasets were selected, why, and how performance is measured. The fourth concerns validity: the steps taken to ensure that the findings mean what they appear to mean.

---

## 3.2 Research Paradigm

### 3.2.1 Positivism in Empirical Software Engineering

This thesis operates within a positivist research paradigm. Positivism holds that the social and natural worlds contain regularities that can be observed, measured, and explained by general laws, and that knowledge claims should be grounded in observable evidence rather than authority, intuition, or tradition. In software engineering, positivist research typically takes the form of controlled experiments, quasi-experiments, and empirical evaluations — designs in which variables are defined precisely, measurements are taken systematically, and conclusions are drawn from statistical comparison (Wohlin et al., 2012).

The alternative paradigm most often considered for software engineering research is interpretivism, which holds that software development is a social practice whose meaning cannot be fully captured by measurement. Interpretivist research employs methods such as ethnography, grounded theory, and case study to understand developers' lived experience. This thesis does not adopt an interpretivist stance, for a specific reason: the research questions concern prediction (can a model classify identifier readability accurately?) rather than understanding (how do developers make naming decisions?). Prediction questions are fundamentally positivist questions — they require a measurable outcome, a replicable procedure, and a standard for comparison.

This choice carries a limitation. The models developed in this thesis can predict readability scores as labelled in benchmark datasets; they cannot directly model the cognitive experience of reading code. Whether the labels in the datasets fully capture what human developers mean by "readable" is a construct validity question, discussed in Section 3.7.

### 3.2.2 Quantitative Methods

Consistent with the positivist paradigm, all three studies use quantitative methods: numerical datasets, statistical metrics (accuracy, precision, recall, F1, AUC), and comparative evaluation against baseline classifiers. No user study, interview, or observational method is employed.

This choice reflects both the nature of the research questions and practical constraints. A controlled user study that measures comprehension time and accuracy for identifiers classified by IRAF-XADL as High versus Low readability would provide strong ecological validity — it would directly test whether the system's predictions correspond to observable developer behaviour. Such a study requires ethics approval, participant recruitment, and a carefully designed experimental protocol. It is identified as a direction for future work in Chapter 8 and was not within the scope of this thesis.

---

## 3.3 Research Questions and Hypotheses

The four research questions stated in Chapter 1 are restated here in formal hypothesis form, as this framing is closer to the positivist tradition and clarifies what the experiments are testing.

**H1:** A classifier combining ten linguistically grounded identifier readability features with CodeBERT embeddings and a Self-Attention BiLSTM achieves higher test accuracy than the best published single-classifier baseline on the Code Snippets: Insights and Readability benchmark for both Python and C++.

**H2:** A weighted majority voting ensemble of GCN, DBN, and Bi-TCN achieves higher snippet-level readability test accuracy than any of its individual component classifiers and than the best published baseline on the same benchmark.

**H3:** A Simplified Spiking Neural Network with BAHB feature selection and AMBOA hyperparameter tuning achieves the highest test accuracy and lowest execution time among all compared classifiers on the Perez et al. developer experience dataset.

**H4:** SHAP feature importance values computed for identifier-level readability predictions and LIME feature importance values computed for snippet-level readability predictions identify the same set of features as the primary drivers of readability classification.

The first three hypotheses are directional and confirmable or refutable by the experimental results. The fourth is not strictly directional — it asks whether two methods agree — but it can be falsified if SHAP and LIME systematically identify different features as primary drivers.

---

## 3.4 Research Strategy: Machine Learning Experimentation

### 3.4.1 Design Philosophy

The research strategy follows the machine learning experimentation paradigm described by Sculley et al. (2015) and formalised in the empirical software engineering literature (Shepperd and MacDonell, 2012). The core design elements are:

1. **Separation of training and test data:** In all three studies, a 70/30 train/test split is applied with a fixed random seed (42). The test set is held out entirely until the final evaluation; it is never used for model selection, hyperparameter tuning, or architectural decisions. This separation is the primary control against overfitting — a threat to conclusion validity that is particularly serious in deep learning, where models have sufficient capacity to memorise training data.

2. **Replication of baselines:** Each study compares the proposed approach against multiple published baselines. Baseline hyperparameters are set to the values reported in the original publications or, where not specified, to standard defaults. This ensures that performance differences are attributable to architectural choices rather than hyperparameter advantage.

3. **Multiple evaluation metrics:** Accuracy alone can be misleading when class distributions are uneven. All studies report accuracy, precision, recall, F1-score, and AUC. For Study 3, execution time is also reported because practical deployability depends on it. Reporting five metrics rather than one reduces the risk of cherry-picking the metric that makes the proposed approach look best.

4. **Fixed random seeds:** All experiments use NumPy seed 42, PyTorch seed 42, and the same train/test split for each dataset. This makes results deterministic and reproducible given the same hardware and software environment.

### 3.4.2 Experimental Variables

For each study, the experimental variables are defined as follows:

**Independent variable:** The classifier or system being evaluated (IRAF-XADL, ECRVR-MVEL, EESQA-DELMOA, or a baseline).

**Dependent variables:** Accuracy, precision, recall, F1-score, AUC on the held-out test set; execution time for Study 3.

**Controlled variables:** Dataset, train/test split ratio, random seed, evaluation metrics, hardware environment.

**Confounding variables:** These are factors that might affect the dependent variables but are not the focus of the study. The most important confounding variables are: (a) dataset label quality (are the readability labels reliable?); (b) dataset representativeness (does the dataset reflect the range of real-world code?); and (c) implementation choices in the baseline classifiers (are they implemented fairly?). Steps taken to control each confound are described in Sections 3.5–3.7.

---

## 3.5 Dataset Selection and Justification

### 3.5.1 Criteria for Dataset Selection

Three criteria guided dataset selection for all studies:

**Criterion 1 — Public availability.** All datasets must be publicly available and properly attributed, so that experiments can be replicated by other researchers without access to proprietary data. This criterion is both a matter of research ethics and a practical requirement for the open science principles increasingly expected in software engineering research.

**Criterion 2 — Established use in the literature.** Datasets that have been used and evaluated in prior published work provide a common ground for comparison. Using a dataset that no prior classifier has been applied to makes comparative evaluation impossible.

**Criterion 3 — Language coverage.** Since the studies cover both Python and C++, the dataset must contain code in both languages with consistent labelling across them.

### 3.5.2 Code Snippets: Insights and Readability (Kaggle)

The Code Snippets: Insights and Readability dataset satisfies all three criteria. It is publicly available under the MIT licence, has been used as a benchmark in multiple published studies of code readability (Mi et al., 2025; Barrameda and Ballera, 2025), and covers both Python (1,681 snippets) and C++ (1,504 snippets) with the same readability scoring methodology.

The dataset's readability scores are computed as a weighted composite of structural code metrics: line count, code length, cyclomatic complexity, identifier count, indentation depth, loop count, and average line length. This composite approach has a recognised limitation — it measures code simplicity rather than the semantic quality of identifier names specifically — which is discussed as a threat to construct validity in Section 3.7. Despite this limitation, the composite score is reproducible, objective, and consistent with the view that readability is a multi-dimensional property.

The three-class labelling (Low, Medium, High) is derived by tertile partition of the continuous readability score after removing outliers (117 rows with score < 0, representing corrupt or malformed entries). This produces balanced class counts (within ±1 of perfect balance), which is desirable for multi-class classification: balanced classes prevent a degenerate classifier from achieving high accuracy by always predicting the majority class.

### 3.5.3 Developer Experience Dataset (Zenodo)

The Perez, Urtado, and Vauttier (2023) dataset was selected for Study 3 on the same criteria. It is publicly available (Zenodo, CC BY 4.0), is the most recent and most comprehensive developer experience dataset with multi-class labels, and its 26 features per developer are substantially richer than the single-metric proxies (commit count, tenure) used in earlier work. The dataset is described in detail in Chapter 6.

The class imbalance in this dataset (UNK: 71.8%) is not a selection flaw but a property of real-world open-source developer distributions: most contributors to any large project have insufficient activity to classify reliably. A balanced dataset would not accurately represent the problem that a deployed system would face.

---

## 3.6 Evaluation Methodology

### 3.6.1 Train/Test Split vs. Cross-Validation

The three studies use a 70/30 holdout split rather than k-fold cross-validation. This choice is justified by three considerations.

First, the datasets are large enough (1,504–1,681 samples for code studies; 703 for Study 3) that a single 30% test split provides sufficient statistical power for the comparisons being made. A 30% test split of 1,681 samples yields 504 test examples, which is sufficient to detect accuracy differences of approximately 2 percentage points at 95% confidence.

Second, the deep learning models in Studies 1 and 2 are computationally expensive to train. Running k-fold cross-validation with k = 10 would require training each model ten times, which at 100 epochs per training run represents a tenfold increase in compute time. Given that all models are trained on CPU (where training takes 8–15 minutes per run), this tradeoff is non-trivial.

Third, a fixed holdout split ensures that all baselines and the proposed methods are evaluated on exactly the same test examples, making the comparison fully controlled.

### 3.6.2 Hyperparameter Selection

Hyperparameters for the proposed models (learning rate, BiLSTM hidden size, number of attention heads, etc.) were selected through a combination of theoretical motivation and manual exploration on the validation portion of the training set (the last 15% of the 70% training partition, held out during training for early stopping). The final hyperparameters were fixed before evaluating on the test set. No test set performance information was used to guide hyperparameter selection, preventing data leakage from the test set into the model.

The baseline classifiers use hyperparameters as reported in the comparative studies they are drawn from. Where hyperparameters are not specified, scikit-learn defaults are used. This approach is conservative: it is possible that carefully tuned baselines would perform better. However, using published parameters is standard practice in the empirical software engineering literature and prevents an artificial advantage for the proposed methods through unfair comparison.

### 3.6.3 Statistical Interpretation

The performance differences reported in Chapters 4, 5, and 6 are treated as empirically meaningful if they satisfy two conditions: (a) the margin exceeds 2 percentage points (a threshold commonly adopted in empirical SE research for practical significance), and (b) the pattern is consistent across multiple metrics (accuracy, precision, recall, F1, and AUC all show the same direction of improvement). Neither condition is a formal statistical significance test, which is acknowledged as a limitation. Formal significance testing (McNemar's test for paired classifier comparison) is identified as a direction for future work.

---

## 3.7 Threats to Validity

A threat to validity is any factor that could weaken the confidence one should place in the conclusions drawn from an experiment. The taxonomy used here follows Wohlin et al. (2012): internal validity (are the observed effects caused by what we think they are?), external validity (do the findings generalise?), construct validity (are we measuring what we think we are measuring?), and conclusion validity (are the statistical conclusions sound?).

### 3.7.1 Internal Validity

**Threat: Confounding from dataset label derivation.** In Studies 1 and 2, identifier-level labels are propagated from snippet-level readability scores. A snippet labelled "Low readability" contributes all of its identifiers to the Low class, even if one of those identifiers is exceptionally well-named. This introduces noise at the identifier level.

**Mitigation:** The magnitude of the noise is bounded by the statistical relationship between snippet-level and identifier-level readability. SHAP analysis shows that the identifier-level features in the training data are genuinely predictive (MC and NC have high Shapley values), which would not be the case if the labels were purely random noise. The noise is real but bounded.

**Threat: Implementation bias in baselines.** If baseline classifiers are implemented sub-optimally, the comparison may overstate the advantage of the proposed methods.

**Mitigation:** All baselines use either published hyperparameters or scikit-learn defaults. The comparison is therefore conservative for the proposed methods.

### 3.7.2 External Validity

**Threat: Language scope.** All code-level findings are based on Python and C++ data. There is no guarantee that the patterns observed — particularly the dominance of MC and NC in SHAP and LIME analyses — hold for Java, JavaScript, or other languages.

**Mitigation:** None within this thesis. Extension to other languages is identified as future work.

**Threat: Dataset representativeness.** The code snippets are drawn from LeetCode, a competitive programming platform. LeetCode solutions are typically shorter, more algorithmic, and more regularly structured than industrial production code. The readability patterns observed may differ in production code.

**Mitigation:** None within this thesis. Evaluation on industrial codebases requires access to proprietary data and is identified as future work.

### 3.7.3 Construct Validity

**Threat: Readability as composite simplicity.** The readability labels in the Kaggle dataset measure code simplicity (shorter, less complex code scores higher), which is related to but not identical with semantic readability of identifiers. The models may be learning to predict code simplicity rather than readability in the cognitive sense.

**Mitigation:** The SHAP and LIME analyses provide partial mitigation: both methods independently identify naming features (MC, NC) as primary drivers, which would not be the case if the labels were purely functions of structural metrics such as line count and loop depth. The correlation between structural metrics and readability labels is real (see Chapter 2 correlation analysis), but the models learn identifier-level signals in addition to structural ones.

**Threat: Developer experience as observable activity.** The developer experience labels in Study 3 are derived from observable GitHub activity, not from a direct assessment of coding skill or domain knowledge. A developer with ten years of experience on a single internal project would appear as UNK in this dataset.

**Mitigation:** The dataset's labelling is explicitly described by its authors as a practical approximation (Perez et al., 2023), not a ground truth for experience. This limitation is acknowledged in Chapter 6 and does not affect the validity of the classification task as defined — it affects the interpretation of what "experience level" means in the results.

### 3.7.4 Conclusion Validity

**Threat: Absence of significance testing.** Accuracy differences are reported without formal statistical significance tests.

**Mitigation:** The margins reported are substantially larger than the minimum detectable effect size for the dataset sizes used, making it highly unlikely that the observed differences are due to chance. Formal testing is identified as future work.

---

## 3.8 Ethical Considerations

### 3.8.1 Data Ethics

All datasets used in this thesis are publicly available with open licences: the Kaggle dataset under MIT, the Zenodo dataset under CC BY 4.0. No personally identifiable information about developers is used directly in model training. Developer profiles in Study 3 are identified by GitHub username, which is a public identifier; no private activity data was accessed. No new data was collected from human participants, and no ethical approval was required.

### 3.8.2 AI Transparency

The explainability commitment in all three studies (SHAP for Study 1, LIME for Study 2, feature importance for Study 3) is itself an ethical choice. Automated systems that classify code quality or developer experience without explanation are not suitable for deployment in contexts where the classification affects human outcomes (code review decisions, developer assignments). The explainability components ensure that every prediction is accompanied by a human-interpretable account that can be challenged, corrected, or overridden.

### 3.8.3 Use and Misuse

The developer experience classifier (Study 3) classifies developers into six categories, one of which (BOT) could be used to automatically exclude contributions from automated accounts. The same system could theoretically be used to discriminate against developers in hiring or project assignment decisions. This potential misuse is noted explicitly: the system is designed to support human decision-making, not replace it, and should never be used as the sole basis for personnel decisions.

---

## 3.9 Chapter Summary

This chapter described the research design underlying the three studies in this thesis. The positivist paradigm was adopted, consistent with the prediction-focused research questions. Four hypotheses were formalised from the four research questions. The 70/30 holdout evaluation strategy was justified for its reliability and computational feasibility. Two datasets were selected on the criteria of public availability, established use, and language coverage. Threats to validity were identified across all four validity types and mitigated where possible. Ethical considerations for data use and system deployment were discussed.

Chapter 4 now presents the first technical study in full detail.

---

*Chapter 3 (Research Methodology) complete.*
