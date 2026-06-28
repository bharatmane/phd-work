# CHAPTER 6: CROSS-STUDY ANALYSIS AND DISCUSSION

## 6.1 Introduction

The three studies reported in Chapters 3, 4, and 5 were designed as independent contributions — each addressing a specific gap in the literature, using a specific dataset, and proposing a specific technical approach. Each can be read and evaluated on its own terms. However, placing them together reveals patterns, convergences, and tensions that no single study makes visible. This chapter examines those cross-study relationships.

Four analytical questions organise this chapter:

1. **How do the three levels of analysis relate to each other?** Is there a coherent conceptual framework connecting identifier quality, snippet quality, and developer experience?
2. **Do the explainability findings from Studies 1 and 2 converge?** If SHAP and LIME independently identify the same features as important, that convergence is evidence of something real — a signal in the data, not an artifact of the method.
3. **What can be learned from the performance trajectory across the three studies?** The accuracy values (97.36% → 98.15% → 98.74%) show a pattern, but interpreting it requires care.
4. **What are the practical implications, and what are the genuine limitations?**

---

## 6.2 The Multi-Level Program Comprehension Framework

The three studies collectively constitute a multi-level framework for program comprehension assessment. The framework is organised along a single axis: the granularity of the unit of analysis.

```
Level 1: Identifier     →  "Is this name readable?"
              ↓
Level 2: Code Snippet   →  "Is this function readable?"
              ↓
Level 3: Developer      →  "Is this developer experienced?"
```

The hierarchy is not merely conceptual. There are explicit dependencies between levels:

**Level 1 → Level 2:** The identifier-level features computed in Study 1 are features of the identifiers within a snippet. The snippet's identifier naming quality is, in part, the aggregate of its identifiers' qualities. The LIME findings in Study 2 confirm this: identifier tokens are among the most influential features in snippet-level readability predictions.

**Level 2 → Level 3:** Snippet quality is shaped by developer experience. More experienced developers consistently produce code with better identifier naming, clearer structure, and lower complexity. The developer-level study does not directly use snippet-level predictions as features, but the conceptual link is well-established in the literature (Palomba et al., 2019; Butler et al., 2010).

**Level 3 → Level 1:** Experience influences naming decisions. An experienced developer has a larger vocabulary of effective naming patterns, is more likely to follow conventions, and is more likely to choose names that communicate intent precisely. The SA (Software Architect) class, which achieves the strongest per-class performance in Study 3, represents developers whose naming quality is presumably highest — completing the loop.

This hierarchical dependency suggests that a fully integrated framework — one in which developer experience predictions feed into expectations about snippet quality, which in turn informs confidence about identifier quality assessments — is a natural extension of this thesis. Such integration is identified as future work in Chapter 7.

### 6.2.1 The Thesis as a Unified Answer

The research question that motivates the thesis — "Can program comprehension be assessed automatically, accurately, and interpretably at every level of abstraction?" — has a clear answer from the three studies combined: yes, with the following caveats:

- At the identifier level, assessment is accurate (97%+) and explainable (SHAP attributions show which features matter for each prediction).
- At the snippet level, assessment is accurate (98%+) and explainable (LIME attributions show which code tokens drive each prediction).
- At the developer level, assessment is accurate (98.74%) and efficient (8.27 seconds), with the important caveat that class imbalance (BOT, NSE) limits recall for rare experience categories.

---

## 6.3 Convergence of SHAP and LIME: The Central Cross-Study Finding

The most significant empirical finding that emerges from comparing Studies 1 and 2 is the convergence of their explainability outputs.

**SHAP (Study 1, identifier level):** Across both Python and C++ datasets, Meaningful Clarity (MC) and Naming Conformance (NC) have the highest mean absolute SHAP values. The composite readability score has near-zero SHAP importance. This is the finding from an analysis of individual identifier predictions.

**LIME (Study 2, snippet level):** Across Python and C++ datasets, the most influential tokens in snippet-level readability predictions are well-named identifier tokens (function names, parameter names) and structural complexity indicators. LIME explicitly flags identifier naming quality as a primary driver.

**The convergence:** Two independent explainability methods (SHAP and LIME), operating at different levels of analysis (identifier and snippet), using different models (SA-BiLSTM and WMVE ensemble), on different input representations (feature vectors and token embeddings) — independently identify naming quality as the primary driver of code readability predictions.

This convergence has several implications.

**Implication 1: The feature set designed for identifier analysis has snippet-level validity.** The ten readability parameters were designed for identifier assessment. The fact that the features they capture — particularly Meaningful Clarity and Naming Conformance — also dominate snippet-level analysis suggests that they are capturing something fundamental about code readability, not merely something specific to individual identifiers.

**Implication 2: The composite readability score (dataset labels) is a downstream consequence of naming quality, not an independent signal.** Both SHAP and LIME assign minimal importance to the dataset's composite readability score when it is included as a feature. This suggests that the score is mostly explained by the naming and structural features — it adds little information beyond what those features already provide. This finding validates the choice to build richer features rather than rely on the composite score.

**Implication 3: The model's predictions are trustworthy.** When two independent analyses agree on what matters, the convergence is evidence that the models are capturing a real signal rather than overfitting to noise. A practitioner who sees that IRAF-XADL flags an identifier as Low readability because its MC and NC scores are low can trust that this flag would also be associated with a lower snippet-level readability prediction — the two levels are consistent.

### 6.3.1 Significance for the Literature

No prior work in the code readability literature has compared SHAP and LIME findings across two levels of analysis. The convergence reported here is, to the best of the author's knowledge, the first cross-method, cross-level explainability validation in this domain. The finding strengthens the theoretical case for the ten-parameter feature set as a general-purpose code quality signal.

---

## 6.4 Performance Trajectory and Its Interpretation

The test accuracy values across the three studies form an ascending sequence:

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

Chapter 4 reported that the weighted majority voting ensemble (98.15% Python, 98.38% C++) substantially outperforms each of its three components (GCN: 92.87%, DBN: 94.46%, Bi-TCN: 95.38% on the Python test split). This result provides empirical support for a theoretical prediction of ensemble learning: when base classifiers are diverse, their errors are uncorrelated, and combining them reduces the expected generalisation error.

The diversity in ECRVR-MVEL is structural:
- **GCN** learns from graph structure (dependency relationships, control flow).
- **DBN** learns a hierarchical probabilistic representation of the token features.
- **Bi-TCN** learns sequential patterns from both directions.

These three architectures make different errors on the same examples. The 2.77-percentage-point improvement of WMVE over the best individual classifier (Bi-TCN) on the test set — larger than the training improvement — confirms that the ensemble generalises better, not just overfits less.

This finding has practical implications beyond this thesis: for any code analysis task where multiple deep learning architectures have been applied individually, combining them in a learned ensemble is likely to yield meaningful improvements with modest additional computational cost.

---

## 6.6 Efficiency as a Design Goal

Study 3's execution time advantage (8.27 seconds vs. a baseline range of 11.60–17.33 seconds) is the most practically relevant finding for deployment. While the accuracy advantage of EESQA-DELMOA is meaningful (98.74% vs. 94.78% for CNN), the efficiency advantage may be equally important for adoption.

A developer experience classification tool that takes 17 seconds per developer is borderline usable in an interactive interface and problematic in an automated pipeline that must process hundreds of contributors. A tool that takes 8.27 seconds for the full test dataset (703 profiles) — approximately 12 milliseconds per developer — is fast enough for real-time use.

The SSNN's efficiency advantage is not incidental but architectural: sparse spiking computation fundamentally reduces the number of multiply-accumulate operations compared to conventional neural networks. This property becomes more pronounced as the network scales or as the number of input features increases, suggesting that the efficiency advantage of SNNs will grow as developer profile datasets become richer.

---

## 6.7 Practical Implications for Software Engineering Teams

The three studies together support a set of practical recommendations for software engineering teams and organisations:

**Recommendation 1: Integrate identifier readability assessment into code review.**
IRAF-XADL has been deployed as a REST API (FastAPI, Python) that accepts raw source code and returns per-identifier readability labels, the ten feature scores, self-attention weights, and a plain-English explanation within a single HTTP request. This makes integration directly feasible: a code review tool or IDE plugin sends the current function to `POST /predict` and surfaces the result inline. Identifiers with MC < 0.5 or NC < 0.6 are flagged automatically, bringing the most actionable findings — "this variable name contains no recognisable words" or "this function name violates the naming convention" — to the reviewer's attention before the review begins. The API design additionally exposes an `identifier_quality_score` (a weighted composite of MC, NC, OL, and CLS) that provides a single-number readability signal suitable for dashboard reporting or CI/CD threshold checks.

**Recommendation 2: Use snippet-level readability as a code quality gate.**
ECRVR-MVEL predictions can be integrated into CI/CD pipelines as a readability quality gate. Snippets classified as Low readability with high confidence (P(Low) > 0.9) are flagged for review before merging. The 1.85% error rate (100% - 98.15%) implies that approximately 1 in 55 snippets would be incorrectly flagged or missed — acceptable for a quality assistance tool.

**Recommendation 3: Use EESQA-DELMOA to support, not replace, human judgement in developer allocation.**
The system's 98.74% accuracy suggests it can reliably classify developers into experience categories. However, the BOT class's low recall and the UNK class's dominance indicate that the system should be used as a first pass — identifying clearly experienced or clearly inexperienced contributors — with human review applied to ambiguous cases.

**Recommendation 4: Report explainability outputs alongside predictions.**
SHAP attributions (from IRAF-XADL) and LIME explanations (from ECRVR-MVEL) should accompany every prediction. A readability verdict without an explanation is difficult to act on; a verdict with an explanation ("MC = 0.1 — the identifier contains no recognisable words") is directly actionable.

---

## 6.8 Threats to Validity

### 6.8.1 Internal Validity

**Labelling scheme:** Readability labels in Studies 1 and 2 are derived from the Kaggle dataset's composite readability score, which is a weighted combination of structural code metrics (line length, cyclomatic complexity, identifier count, etc.). This composite measures code simplicity rather than identifier naming quality specifically. The fact that IRAF-XADL and ECRVR-MVEL achieve high accuracy on these labels indicates that the models effectively learn to predict code simplicity — which is related to, but not identical with, the semantic readability of identifiers. Future work using human-annotated identifier readability labels would provide a more direct test.

**Data leakage:** The identifier-level labels in Study 1 are propagated from snippet-level labels. This means all identifiers in a "High readability" snippet are labelled High, regardless of their individual quality. A snippet with predominantly excellent identifiers but one cryptic abbreviation would have the abbreviation mislabelled. This is an unavoidable limitation given the available labelling granularity.

### 6.8.2 External Validity

**Language scope:** Studies 1 and 2 cover Python and C++ only. The preprocessing pipelines use language-specific parsers, and the naming convention rules in NC are defined for these languages. Generalisation to Java, JavaScript, Rust, or other languages requires re-specifying the convention rules and re-evaluating on appropriate datasets.

**Dataset source:** Both code-level studies use LeetCode solutions — competitive programming problems solved in a competitive context. LeetCode code has characteristics that may not generalise to industrial code: it is typically more concise, uses algorithmic patterns more frequently, and may use more abbreviated names than production code. Results on production codebases may differ.

**Developer dataset:** Study 3 uses a dataset of 703 developer profiles from open-source projects. The class distribution (71.8% UNK) and the experience categories may not represent the distribution in proprietary software development organisations.

### 6.8.3 Construct Validity

**Readability as a construct:** The readability labels used in this thesis reflect a composite of structural metrics that correlate with human readability judgements but do not perfectly capture them. The underlying construct — how easy a human developer finds the code to read — is partially unobserved.

**Experience level as a construct:** The six experience categories in Study 3 are defined by the dataset authors based on observable activity patterns. They are a practical approximation of the unobservable latent variable "developer experience," which also encompasses domain knowledge, problem-solving skill, and communication ability that no GitHub activity metric can capture.

### 6.8.4 Conclusion Validity

**Statistical significance:** The comparative analyses in Chapters 3, 4, and 5 report accuracy values but do not include statistical significance tests (e.g., McNemar's test for paired classifiers). Given the large test set sizes (504 Python / 451 C++ examples in Study 1; similar in Study 2; 211 in Study 3), the margins observed are almost certainly statistically significant, but this is not formally tested. Future work should include significance testing.

**Baseline selection:** The baselines evaluated in each chapter represent a selection from the literature, not an exhaustive comparison. More recent deep learning models (fine-tuned CodeBERT, GraphCodeBERT, CodeT5) may achieve higher accuracy than the baselines reported. These represent the current state of practice rather than the ceiling of what is achievable.

---

## 6.9 Chapter Summary

This chapter examined four cross-study questions. The three studies form a coherent multi-level program comprehension framework with explicit dependencies between levels. SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity and Naming Conformance as the primary drivers of code readability, providing the first cross-method, cross-level XAI validation in the code readability literature. The ensemble diversity principle is validated by ECRVR-MVEL's substantial improvement over its individual components. And the SSNN's sparse computation provides a practical efficiency advantage that positions EESQA-DELMOA for real-world deployment.

Four threats to validity were identified: composite labelling at the snippet level, language scope limitation, dataset representativeness, and the absence of formal significance testing. These threats are characteristic of empirical research in software engineering and do not undermine the core contributions, but they define the scope within which the results should be interpreted.

Chapter 7 concludes the thesis with a summary of contributions, answers to the four research questions, and directions for future research.

---

*Chapter 6 complete. Proceeding to Chapter 7.*
