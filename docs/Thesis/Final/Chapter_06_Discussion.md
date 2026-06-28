# CHAPTER 6: CROSS-STUDY ANALYSIS AND DISCUSSION

---

## 6.1 Introduction

The three studies reported in Chapters 3, 4, and 5 were designed as independent contributions — each addressing a specific gap in the literature, using a specific dataset, and proposing a specific technical approach. Each can be read and evaluated on its own terms. However, placing them together reveals patterns, convergences, and tensions that no single study makes visible. This chapter examines those cross-study relationships.

Five analytical questions organise this chapter:

1. How do the three levels of analysis relate to each other? Is there a coherent conceptual framework connecting identifier quality, snippet quality, and developer experience?
2. Do the explainability findings from Studies 1 and 2 converge? If SHAP and LIME independently identify the same features as important, that convergence is evidence of something real — a signal in the data, not an artifact of the method.
3. What can be learned from the performance trajectory across the three studies?
4. What are the practical implications for software engineering teams and organisations?
5. What are the genuine limitations, and what threats to validity constrain interpretation?

---

## 6.2 The Multi-Level Program Comprehension Framework

The three studies collectively constitute a multi-level framework for program comprehension assessment, organised along a single axis: the granularity of the unit of analysis.

```
Level 1: Identifier     →  "Is this name readable?"          [IRAF-XADL]
              ↓
Level 2: Code Snippet   →  "Is this function readable?"      [ECRVR-MVEL]
              ↓
Level 3: Developer      →  "Is this developer experienced?"  [EESQA-DELMOA]
```

The hierarchy is not merely conceptual. There are explicit dependencies between levels:

**Level 1 → Level 2:** The identifier-level features computed in Study 1 are features of the identifiers within a snippet. A snippet's identifier naming quality is, in part, the aggregate of its identifiers' individual qualities. The LIME findings in Study 2 confirm this: identifier tokens are among the most influential features in snippet-level readability predictions. The features designed for identifier assessment (MC, NC, PRED) resurface as snippet-level signals in a completely independent model.

**Level 2 → Level 3:** Snippet quality is shaped by developer experience. More experienced developers consistently produce code with better identifier naming, clearer structure, and lower complexity. The developer-level study does not directly use snippet-level predictions as features, but the conceptual link is well-established in the literature (Palomba et al., 2019; Butler et al., 2010).

**Level 3 → Level 1:** Experience influences naming decisions. An experienced developer has a larger vocabulary of effective naming patterns, is more likely to follow conventions, and is more likely to choose names that communicate intent precisely. The SA (Software Architect) class, which achieves perfect classification in Study 3, represents developers whose naming quality is presumably highest — completing the loop.

This hierarchical dependency suggests that a fully integrated framework — one in which developer experience predictions feed into expectations about snippet quality, which in turn informs confidence about identifier quality assessments — is a natural extension of this thesis and is identified as future work in Chapter 7.

### 6.2.1 The Causal Chain

The three levels form a causal chain in which each level influences the next. Hofmeister et al. (2017) showed that experienced developers leverage descriptive names more effectively and are more likely to produce them. In Study 3's terms, a developer classified as ESE or SA is more likely to produce identifiers that score high on MC and NC — identifiers that IRAF-XADL would classify as High readability.

The aggregate identifier quality across a snippet then determines its snippet-level readability. A snippet where all identifiers score high on MC and NC will receive high ECRVR-MVEL readability predictions — not necessarily because the snippet is simple but because its vocabulary communicates the complexity clearly. This is confirmed by the LIME analysis in Study 2: identifier naming tokens are the primary signal for snippet-level readability classification.

This causal chain has a practical implication. Improving developer experience — through education, mentorship, code review culture, or hiring — is an investment in identifier quality, which is in turn an investment in snippet readability. The three systems in this thesis can measure the effect of such investments at each level.

### 6.2.2 The Thesis as a Unified Answer

The research question motivating the thesis — "Can program comprehension be assessed automatically, accurately, and interpretably at every level of abstraction?" — has a clear answer from the three studies combined: yes, with the following caveats:

- At the identifier level: assessment is accurate (97%+) and explainable (SHAP attributions identify which features drive each prediction).
- At the snippet level: assessment is accurate (98%+) and explainable (LIME attributions identify which code tokens drive each prediction).
- At the developer level: assessment is accurate (98.74%) and efficient (8.27 seconds), with the caveat that class imbalance limits recall for rare experience categories (BOT, NSE).

---

```
 CROSS-STUDY RELATIONSHIP: THREE LEVELS + XAI CONVERGENCE
 ┌─────────────────────────────────────────────────────────────────┐
 │                                                                 │
 │  Developer Experience (EESQA-DELMOA)                           │
 │  ───────────────────────────────────                           │
 │  BAHB selects 18/26 features                                   │
 │  SSNN classifies: ESE / SA / SE / NSE / BOT / UNK              │
 │  98.74% accuracy │ 8.27s execution                             │
 │              │                                                 │
 │              │  Experience shapes naming quality               │
 │              ▼                                                 │
 │  Code Snippet Readability (ECRVR-MVEL)                         │
 │  ─────────────────────────────────────                         │
 │  GCN + DBN + Bi-TCN ensemble                                   │
 │  LIME ──────────────────────────────────┐                      │
 │  98.15% / 98.38% accuracy              │                      │
 │              │                          │  LIME identifies:    │
 │              │  Snippets = aggregate    │  MC, PRED, NC        │
 │              │  of identifiers          │  as primary drivers  │
 │              ▼                          │                      │
 │  Identifier Readability (IRAF-XADL)     │                      │
 │  ──────────────────────────────────     │                      │
 │  CodeBERT + SA-BiLSTM                  │                      │
 │  SHAP ──────────────────────────────────┘                      │
 │  97.36% / 97.94% accuracy                                      │
 │  SHAP identifies: MC, NC as primary drivers                    │
 │                                                                 │
 │  ✓ SHAP (Level 1) and LIME (Level 2) CONVERGE on MC and NC     │
 └─────────────────────────────────────────────────────────────────┘
```

> **[Figure 6.1]** *Cross-study relationship diagram showing the three levels and XAI convergence.*

> **[Figure 6.2]** *Feature importance convergence: SHAP (Study 1) and LIME (Study 2) both identify MC and NC as primary readability drivers.*

## 6.3 Convergence of SHAP and LIME: The Central Cross-Study Finding

The most significant empirical finding from comparing Studies 1 and 2 is the convergence of their explainability outputs.

**SHAP (Study 1, identifier level):** Across both Python and C++ datasets, Meaningful Clarity (MC) and Naming Conformance (NC) have the highest mean absolute SHAP values. The dataset's composite readability score has near-zero SHAP importance. This finding comes from an analysis of individual identifier predictions using Shapley values from cooperative game theory.

**LIME (Study 2, snippet level):** Across Python and C++ datasets, the most influential tokens in snippet-level readability predictions are well-named identifier tokens (function names, parameter names) and structural complexity indicators. LIME explicitly flags identifier naming quality — captured by MC, PRED, and NC feature thresholds — as the primary driver.

**The convergence:** Two independent explainability methods (SHAP and LIME), operating at different levels of analysis (identifier and snippet), using different models (SA-BiLSTM and WMVE ensemble), on different input representations (feature vectors and token embeddings) — independently identify naming quality as the primary driver of code readability predictions.

### 6.3.1 What the Convergence Proves

**First, that MC and NC are genuine signals, not model artefacts.** If SHAP had identified MC as important and LIME had identified something entirely different (say, line length or loop count), a reasonable interpretation would be that each method found the signal its architecture was most sensitive to, rather than finding a genuine feature of the data. The convergence across two methods with fundamentally different explainability approaches — Shapley values versus local linear approximations — makes the signal-as-artefact explanation implausible.

**Second, that the feature set designed for identifier analysis generalises to snippets.** MC and NC are defined for individual identifiers. The fact that they appear as primary signals at the snippet level means that the concepts they capture — whether a name's tokens are recognisable words, and whether they follow conventions — scale up from the identifier to the snippet as the unit of analysis.

**Third, that the two readability levels are measuring aspects of the same underlying construct.** One could imagine a world in which identifier readability is determined primarily by individual naming quality while snippet readability is determined primarily by structural complexity (number of loops, nesting depth, line count). In such a world, SHAP and LIME would point to different features. The convergence shows that at the snippet level used in this dataset, naming quality dominates structural complexity as a readability signal.

### 6.3.2 What the Convergence Does Not Prove

The convergence does not prove that structural features are unimportant. The LIME analysis in Study 2 shows that loop count, nesting depth, and code length do appear as negative drivers for High readability predictions — they pull toward Low or Medium. What the convergence shows is that naming quality is a *stronger* signal than these structural features, not that the structural features are irrelevant.

The convergence also does not generalise automatically to all code types. The LeetCode dataset consists of single-function solutions to algorithmic problems. In this context, identifier naming is relatively more important than in a 50,000-line enterprise application where class design, module organisation, and architectural naming conventions contribute substantially to readability. The convergence should be interpreted as a finding about the LeetCode domain specifically.

### 6.3.3 Significance for the Literature

No prior work in the code readability literature has compared SHAP and LIME findings across two levels of analysis. The convergence reported here is, to the best of the author's knowledge, the first cross-method, cross-level explainability validation in this domain. The finding strengthens the theoretical case for the ten-parameter feature set as a general-purpose code quality signal, connecting this thesis to the broader naturalness hypothesis (Hindle et al., 2012; Allamanis et al., 2018): well-named identifiers follow the same distributional patterns as good natural language descriptions, and CodeBERT — trained on natural language-code pairs — has internalised those patterns.

---

## 6.4 Performance Trajectory and Its Interpretation

The test accuracy values across the three studies form an ascending sequence:

**Table 6.1: Performance summary across three studies**

| Study | Level | Task | Language | Test Accuracy |
|---|---|---|---|---|
| IRAF-XADL | Identifier | Readability | Python | 97.36% |
| IRAF-XADL | Identifier | Readability | C++ | 97.94% |
| ECRVR-MVEL | Snippet | Readability | Python | 98.15% |
| ECRVR-MVEL | Snippet | Readability | C++ | 98.38% |
| EESQA-DELMOA | Developer | Experience | — | 98.74% |

It would be tempting to interpret this as showing that "higher-level" analysis is easier. This interpretation is incorrect. The three studies use different datasets, different numbers of classes, and different class distributions. The accuracy values are not directly comparable.

What the performance trajectory does show is that each study is effective at its level: all five accuracy values exceed the best published baseline for that task by a substantial margin, and all three reach above 97%. The ceiling is not a property of the level of abstraction but of the classifier design and the training data quality.

---

## 6.5 The Ensemble Diversity Principle Validated

Chapter 4 reported that the weighted majority voting ensemble (98.15% Python, 98.38% C++) substantially outperforms each of its three components (GCN: 92.87%, DBN: 94.46%, Bi-TCN: 95.38% on the Python test set). The 2.77-percentage-point improvement of WMVE over the best individual classifier on the test set — larger than the training improvement — confirms that the ensemble generalises better, not just overfits less.

**Table 6.2: Ensemble vs. individual classifier performance (Python test set)**

| Classifier | Accuracy | vs. WMVE |
|---|---|---|
| GCN | 92.87% | −5.28 pp |
| DBN | 94.46% | −3.69 pp |
| Bi-TCN | 95.38% | −2.77 pp |
| **WMVE** | **98.15%** | — |

This result provides empirical support for a theoretical prediction of ensemble learning: when base classifiers are diverse, their errors are uncorrelated, and combining them reduces expected generalisation error. The diversity in ECRVR-MVEL is structural — GCN (graph structure), DBN (hierarchical probabilistic patterns), Bi-TCN (sequential patterns in both directions) — producing pairwise disagreement rates of 7.3% to 11.2%, well below 1.0, enabling the ensemble to correct errors that no individual classifier handles alone.

This finding has implications beyond this thesis: for any code analysis task where multiple deep learning architectures have been applied individually, combining them in a learned ensemble is likely to yield meaningful improvements with modest additional computational cost.

---

## 6.6 Efficiency as a Design Goal

Study 3's execution time advantage (8.27 seconds vs. 11.60–17.33 seconds for baselines) is the most practically relevant finding for deployment. The SSNN's efficiency advantage is not incidental but architectural: sparse spiking computation fundamentally reduces multiply-accumulate operations compared to conventional neural networks. With an average hidden-layer activation rate of approximately 15%, 85% of neuron-timestep computations are zero multiplications that can be skipped in a sparse compute framework.

The 8.27 seconds over 703 profiles corresponds to approximately 12 milliseconds per developer profile — fast enough for real-time use in project management interfaces, CI/CD integrations, or periodic team analytics. This property becomes more pronounced as the network scales or as developer profile datasets become richer, suggesting that the efficiency advantage of SNNs will grow in future applications.

---

## 6.7 Practical Implications for Software Engineering Teams

The three studies together support a set of practical recommendations for software engineering teams and organisations.

### 6.7.1 IRAF-XADL in Code Review

The most natural deployment for IRAF-XADL is as a pre-commit or pre-review analysis step:

1. Extract all identifiers from changed files using the AST-based pipeline.
2. Compute ten readability parameters and CodeBERT embeddings.
3. Run the SA-BiLSTM classifier.
4. Flag identifiers with P(Low) > 0.8 in the pull request review.
5. Include SHAP attributions for flagged identifiers so the developer understands why.

The expected false positive rate is approximately 2.64%. In a pull request with 50 changed identifiers, this implies roughly 1 false positive on average — acceptable for a quality advisory tool where the developer retains the final decision. The SHAP attributions transform the feedback from "this variable name is too short" (a linter) to "this identifier's MC score is 0.2 because the tokens `psg` and `cnt` are not recognisable English words" — directly actionable information.

### 6.7.2 ECRVR-MVEL in Continuous Integration

ECRVR-MVEL is best suited for CI/CD integration at the pull request level. A CI step running ECRVR-MVEL on changed functions and reporting snippet-level readability alongside existing checks (test coverage, static analysis, linting) creates a routine feedback mechanism. Given the 1.85% error rate, a warning policy (surfacing Low predictions without blocking) is more appropriate than a blocking policy for most teams. Progressive threshold tightening as teams build trust in the system is the recommended adoption path.

### 6.7.3 EESQA-DELMOA for Team Management

The developer experience classifier is best deployed at the team level rather than the individual level. Running EESQA-DELMOA on the full contributor roster of a project produces a distribution of experience classifications that project managers can use to:

- Identify the proportion of ESE/SA contributors who should be prioritised as code reviewers.
- Identify SE contributors who would benefit from pairing with ESE contributors.
- Track how the team's experience distribution changes over time.
- Compare experience distributions across project components.

The system is explicitly designed not to be used for individual performance evaluation — its predictions are based on observable activity proxies, not demonstrated skill, and the BOT/UNK limitations mean a substantial fraction of contributors cannot be reliably classified. Ethical use cases are team-level aggregate analysis and identification of mentorship opportunities, not individual ranking or hiring decisions.

---

## 6.8 Comparison with Industrial Code Quality Tools

**SonarQube** is the most widely deployed code quality platform in industry, providing over 5,000 rules across 29 languages. SonarQube includes naming-related rules (e.g., "Method names should not have a specific format," "Field names should not be too short") but these are primarily convention checks rather than semantic quality assessments. SonarQube cannot assess whether an identifier's tokens are meaningful English words, whether they are domain-relevant, or contextually consistent with other identifiers. IRAF-XADL addresses this gap with a semantically grounded assessment that SonarQube's rule-based approach cannot replicate.

**Pylint** (Python) and **cpplint** (C++) are linting tools that enforce naming convention compliance — automating the NC feature from IRAF-XADL but not MC, DR, CC, or other cognitively motivated features. They catch convention violations but not semantic poverty.

**DeepSource** and **CodeClimate** are more recent AI-assisted code quality platforms. Neither has published a system combining CodeBERT embeddings with attention-based classification and SHAP explainability for identifier readability specifically.

The key differentiators of the systems proposed in this thesis are: semantic depth (CodeBERT embeddings capturing contextual meaning), multi-dimensional features (ten parameters covering different quality dimensions), and explainability (SHAP and LIME providing actionable attributions). No existing commercial tool provides all three for identifier or snippet readability assessment.

---

## 6.9 The Naturalness Hypothesis

Hindle et al. (2012) proposed the "naturalness hypothesis" — software code is repetitive and predictable, more like natural language than like mathematical notation. This hypothesis has two implications for the findings of this thesis.

The first implication is that identifier naming patterns follow statistical regularities that machine learning models can learn. The success of IRAF-XADL's CodeBERT embeddings reflects the naturalness of good naming: well-named identifiers follow the same distributional patterns as good natural language descriptions, and CodeBERT has internalised those patterns.

The second implication is that bad naming is identifiable precisely because it violates these statistical regularities. An identifier like `x` or `tmp2` is unnatural — it does not follow the patterns that CodeBERT learned from millions of well-named code examples. IRAF-XADL classifies such identifiers as Low readability not because of an explicit rule, but because their feature profiles and embeddings fall in regions of the model's learned representation corresponding to Low-readability training examples.

This framing suggests a possible extension: using the model's prediction confidence as a "strangeness" score — identifiers producing very high-confidence Low readability predictions are the most statistically unusual, and therefore potentially the most problematic.

---

## 6.10 Threats to Validity

### 6.10.1 Internal Validity

**Labelling scheme.** Readability labels in Studies 1 and 2 are derived from the Kaggle dataset's composite readability score — a weighted combination of structural code metrics (line length, cyclomatic complexity, identifier count, etc.). This composite measures code simplicity rather than identifier naming quality specifically. The SHAP and LIME analyses provide partial mitigation: both independently identify naming features (MC, NC) as primary drivers, which would not be the case if labels were purely functions of structural metrics. However, the label ceiling limits ceiling performance — a model trained on perfectly labelled identifier-level data would likely achieve higher accuracy.

**Label propagation.** Identifier-level labels are propagated from snippet-level scores. Every identifier in a Low-readability snippet is labelled Low, even if some are individually well-named. The error analysis in Chapter 3 estimated approximately 1.6% mislabelled examples in the Low class — manageable but real.

**Implementation fairness.** All baselines use either published hyperparameters or scikit-learn defaults. This approach is conservative for the proposed methods: carefully tuned baselines might perform better. Using published parameters is standard practice in empirical software engineering and prevents artificial advantage for the proposed methods.

### 6.10.2 External Validity

**Language scope.** Studies 1 and 2 cover Python and C++ only. The preprocessing pipelines use language-specific parsers, and NC convention rules are defined for these languages. Generalisation to Java, JavaScript, Rust, or other languages requires re-specifying convention rules and re-evaluating on appropriate datasets.

**Dataset source.** Both code-level studies use LeetCode solutions — competitive programming problems solved in a competitive context. LeetCode code is typically more concise, uses algorithmic patterns more frequently, and may use more abbreviated names than production code. Results on production codebases may differ; tests with production Python code from frameworks like Flask or Django suggest some generalisation limitations.

**Developer dataset.** Study 3 uses 703 developer profiles from open-source GitHub projects. The class distribution (71.8% UNK) and experience categories may not represent the distribution in proprietary software development organisations.

### 6.10.3 Construct Validity

**Readability as a construct.** The readability labels reflect a composite of structural metrics that correlate with human readability judgements but do not perfectly capture them. The underlying construct — how easy a human developer finds code to read — is partially unobserved. Future work using human-annotated identifier readability labels would provide a more direct test.

**Experience level as a construct.** The six experience categories are defined by the dataset authors based on observable activity patterns. They are a practical approximation of the unobservable latent variable "developer experience," which also encompasses domain knowledge, problem-solving skill, and communication ability that no GitHub activity metric can fully capture. A developer who joined a project recently but has extensive experience elsewhere would be classified as UNK while their actual experience may be much higher.

### 6.10.4 Conclusion Validity

**Statistical significance.** The comparative analyses report accuracy values without formal statistical significance tests (e.g., McNemar's test for paired classifiers). Given the large test set sizes (504 Python / 451 C++ examples in Study 1; similar in Study 2; 211 in Study 3), the margins observed are almost certainly statistically significant, but this is not formally tested. Future work should include significance testing.

**Baseline selection.** The baselines represent a selection from the literature, not an exhaustive comparison. More recent models (fine-tuned CodeBERT, GraphCodeBERT, CodeT5) may achieve higher accuracy than the baselines reported. The comparisons establish what IRAF-XADL, ECRVR-MVEL, and EESQA-DELMOA achieve relative to the current state of practice rather than the ceiling of what is achievable.

---

## 6.11 Chapter Summary

This chapter examined five cross-study questions. The three studies form a coherent multi-level program comprehension framework with explicit causal dependencies between levels — experience shapes naming quality, naming quality shapes snippet readability. SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity and Naming Conformance as the primary drivers of code readability, providing the first cross-method, cross-level XAI validation in the code readability literature. The ensemble diversity principle is validated by ECRVR-MVEL's 2.77–4.57 percentage-point improvement over its individual components. The SSNN's sparse computation provides a practical efficiency advantage (8.27s vs. 11.60–17.33s) positioning EESQA-DELMOA for real-world deployment.

Practical deployment recommendations were developed for each system: IRAF-XADL as a code review integration, ECRVR-MVEL as a CI/CD quality gate, and EESQA-DELMOA as a team-level analytics tool. Four categories of threats to validity were identified and discussed: internal (label propagation, implementation fairness), external (language scope, dataset source), construct (readability and experience as partially unobserved constructs), and conclusion (absence of formal significance testing). These threats define the scope within which the results should be interpreted but do not undermine the core contributions.

Chapter 7 concludes the thesis with a summary of contributions, explicit answers to the four research questions, and identification of the most promising directions for future research.

---

*End of Chapter 6*
