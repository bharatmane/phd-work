# CHAPTER 7: CONCLUSIONS AND FUTURE WORK

## 7.1 Summary of the Research

This thesis set out to address a long-standing gap in the automated assessment of software quality: the absence of a unified, explainable framework that measures code comprehensibility at multiple levels of abstraction. Three studies were conducted, each targeting a different level of the program comprehension hierarchy — the individual identifier, the code snippet, and the developer who wrote the code. All three studies were evaluated on publicly available benchmark datasets, compared against published baselines, and equipped with explainability components that make their predictions auditable and actionable.

**Study 1 — IRAF-XADL** proposed the first system that combines AST-based identifier extraction, a ten-dimensional linguistically grounded readability parameter set, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, AdamW optimisation, and SHAP explainability for identifier-level readability classification in Python and C++. The system achieved test accuracy of 97.36% (Python) and 97.94% (C++), exceeding the best published baseline by over fifteen percentage points.

**Study 2 — ECRVR-MVEL** proposed a weighted majority voting ensemble of three structurally diverse deep classifiers — a Graph Convolutional Network, a Deep Belief Network, and a Bidirectional Temporal Convolutional Network — for snippet-level readability prediction, with Nadam optimisation and LIME explanations. The ensemble achieved test accuracy of 98.15% (Python) and 98.38% (C++), exceeding the best baseline by over eight percentage points and substantially outperforming each individual classifier.

**Study 3 — EESQA-DELMOA** proposed a developer experience classification system combining bio-inspired feature selection (BAHB), a Simplified Spiking Neural Network classifier, and metaheuristic hyperparameter tuning (AMBOA) for six-class developer experience classification. The system achieved test accuracy of 98.74% — the highest among all compared methods — with an execution time of 8.27 seconds — the lowest among all compared methods.

A cross-study analysis (Chapter 6) revealed the thesis's most significant emergent finding: SHAP explanations from Study 1 and LIME explanations from Study 2 independently identify Meaningful Clarity and Naming Conformance as the primary drivers of code readability predictions, providing the first cross-method, cross-level XAI validation in the code readability literature.

---

## 7.2 Answers to the Research Questions

**RQ1:** *Can a set of ten linguistically and cognitively grounded readability parameters, combined with CodeBERT contextual embeddings and a Self-Attention BiLSTM classifier, predict identifier readability with higher accuracy than the best published baselines?*

**Yes.** IRAF-XADL achieves 97.36% test accuracy for Python and 97.94% for C++, compared with 82.00% and 80.56% for the best baselines (SMO) on the respective languages. The margin of 15+ percentage points is consistent across accuracy, precision, recall, F1-score, and AUC. The combination of the ten-parameter feature set and CodeBERT embeddings provides richer representation than any prior approach; the SA-BiLSTM captures sequential and contextual relationships that simpler classifiers miss.

**RQ2:** *Does a weighted majority voting ensemble of GCN, DBN, and Bi-TCN achieve higher snippet-level readability classification accuracy than any individual classifier and the best baselines?*

**Yes.** The ECRVR-MVEL ensemble achieves 98.15%/98.38% (Python/C++) compared to the best individual classifier (Bi-TCN: 95.38%/93.81%) and the best baseline (Neural Network: 90.11% for Python; Decision Tree: 92.84% for C++). The ensemble advantage over individual classifiers is larger on the test set than the training set, confirming that diversity reduces generalisation error as predicted by ensemble theory.

**RQ3:** *Can a Simplified Spiking Neural Network with BAHB feature selection and AMBOA hyperparameter tuning classify developer experience level with accuracy and efficiency suitable for practical deployment?*

**Yes.** EESQA-DELMOA achieves 98.74% test accuracy — the highest of all eight compared methods — with an execution time of 8.27 seconds — the lowest of all eight methods. The 12-millisecond per-developer inference time is well within the requirements for interactive tools and CI/CD pipeline integration. The BOT class's low recall (20%) is a known limitation arising from extreme class imbalance (10 total BOT profiles) rather than a systemic failure of the approach.

**RQ4:** *Do SHAP and LIME explanations converge on the same features as primary drivers of readability predictions across two levels of analysis?*

**Yes.** SHAP analysis (Study 1) identifies Meaningful Clarity (MC) and Naming Conformance (NC) as the dominant features for identifier-level readability across both Python and C++. LIME analysis (Study 2) independently identifies identifier naming tokens as the most influential elements in snippet-level readability predictions. This convergence — across two independent explainability methods, two levels of analysis, two different classifiers, and two programming languages — is the thesis's central cross-study finding. It validates the ten-parameter feature set as capturing a genuinely informative signal about code readability, and it provides practitioners with consistent, actionable guidance: improve identifier naming quality first.

---

## 7.3 Contributions Revisited

Five original contributions were claimed in Chapter 1. Each has been demonstrated through the research:

**Contribution 1 — Ten-dimensional identifier readability parameter set.** Chapters 3 defines all ten parameters with mathematical formulations and cognitive justifications. The SHAP analysis confirms that these parameters carry predictive signal: MC and NC together account for the majority of the predictive information in IRAF-XADL's predictions.

**Contribution 2 — IRAF-XADL.** Demonstrated in Chapter 3 with full architectural detail, experimental results, and comparative analysis. Test accuracy exceeds all seven baselines by a substantial margin on both languages. Beyond the trained model, a deployable REST API has been implemented (FastAPI) that operationalises the full pipeline — AST extraction, ten-feature computation, CodeBERT embedding, SA-BiLSTM inference, and plain-English explanation generation — in a single HTTP endpoint. This demonstrates that the contribution extends from a research prototype to a practically deployable system, with documented integration paths for IDE plugins, CI/CD pipelines, and static code analysis tools.

**Contribution 3 — ECRVR-MVEL.** Demonstrated in Chapter 4. The ensemble design, LIME explainability, and Nadam optimisation are all novel in the code snippet readability context. The ensemble outperforms all baselines and all individual classifiers.

**Contribution 4 — EESQA-DELMOA.** Demonstrated in Chapter 5. The combination of SSNN with BAHB feature selection and AMBOA tuning is novel for developer experience classification. The system achieves the highest accuracy and lowest execution time among compared methods.

**Contribution 5 — Multi-level, explainability-first program comprehension framework.** Demonstrated in Chapter 6 through the cross-study analysis. The convergence of SHAP and LIME findings is the empirical validation of this contribution's central claim: that explainability components not only make predictions auditable but also validate the feature engineering choices across levels.

---

## 7.4 Limitations

Three principal limitations of this thesis should be noted.

**Limitation 1: Label granularity and validity.** Readability labels in Studies 1 and 2 are derived from a composite code quality score that reflects code simplicity (length, complexity, identifier count) rather than human-evaluated readability of identifier names specifically. Future work with human-annotated identifier readability labels would directly test whether IRAF-XADL's features capture what human annotators attend to, rather than what a composite metric captures.

**Limitation 2: Language scope.** Studies 1 and 2 cover Python and C++ only. The results do not generalise to Java, JavaScript, Rust, or other languages without re-specifying the naming convention rules and evaluating on appropriate datasets. The preprocessing pipelines are designed to be extensible (new language parsers can be substituted), but extensibility has not been demonstrated empirically.

**Limitation 3: Class imbalance in Study 3.** The developer experience dataset's extreme imbalance (71.8% UNK, 1.4% BOT) limits the system's ability to reliably classify rare categories, particularly BOT (20% recall). This limitation is inherent to the available labelled data and is not resolvable within the current approach without additional data collection.

---

## 7.5 Future Research Directions

Several directions emerge from the limitations, findings, and questions raised in this thesis.

**Direction 1: Fine-tuning CodeBERT.** Both Studies 1 and 2 use CodeBERT in a frozen (feature extraction) mode. Fine-tuning the full 125M-parameter model on the code readability task would likely improve performance substantially by adapting the pre-trained representations specifically to readability-relevant features. The primary constraint is computational: fine-tuning requires substantially more GPU memory and training time than feature extraction.

**Direction 2: Human-annotated identifier readability labels.** Conducting an annotation study in which software developers rate the readability of individual identifiers would produce a more direct ground truth than the snippet-level composite scores currently available. Such a dataset would enable a direct test of whether IRAF-XADL's feature set captures what human annotators attend to.

**Direction 3: Extension to additional languages.** Java, JavaScript, TypeScript, and Python (with type annotations) are the most prevalent languages in industry. Each requires a language-specific parser and convention rules for the NC feature. Extending IRAF-XADL to these languages is straightforward in principle and would substantially broaden the system's applicability.

**Direction 4: Integrated multi-level pipeline.** The three studies currently operate independently. An integrated pipeline that runs IRAF-XADL on identifiers, feeds identifier quality scores as additional features to ECRVR-MVEL for snippet classification, and combines both with EESQA-DELMOA's developer experience classification would provide a richer, more holistic assessment. The technical challenge is the bidirectional dependency: developer experience shapes identifier quality, but identifier quality evidence can also inform developer experience classification.

**Direction 5: Class rebalancing for Study 3.** Synthetic oversampling methods (SMOTE, ADASYN) or data collection strategies targeting underrepresented experience classes (BOT, NSE, SA) would likely improve recall for these classes substantially. A balanced dataset would also enable more reliable evaluation of per-class performance.

**Direction 6: AI-generated code readability assessment.** As AI code generation tools (GitHub Copilot, ChatGPT, Gemini Code Assist) produce an increasing fraction of production code, assessing the readability of AI-generated code becomes practically important. None of the datasets used in this thesis contain AI-generated code. Evaluating IRAF-XADL and ECRVR-MVEL on AI-generated code — and comparing their predictions to human readability judgements — would be a timely and practically relevant study.

**Direction 7: IDE integration and user study.** A user study in which developers use IRAF-XADL's output during code review — and their code quality and review efficiency are measured — would provide ecological validity that benchmark evaluation cannot. IDE plugins for VS Code and JetBrains are natural delivery mechanisms. The API developed as part of this research (deployed at phd.dgtula.com) provides a starting point for such an integration.

**Direction 8: Spiking neural networks with neuromorphic hardware.** The efficiency advantage of EESQA-DELMOA's SSNN is demonstrated on conventional GPU hardware. On neuromorphic processors (Intel Loihi, IBM TrueNorth) that natively support sparse spiking computation, the efficiency advantage is expected to grow by one to two orders of magnitude. Evaluating EESQA-DELMOA on neuromorphic hardware would demonstrate the full efficiency potential of the approach.

---

## 7.6 Closing Remarks

The question that opened this thesis — "When code is written, by AI or human, can we automatically judge its quality?" — has a practical answer in the three systems described here. Identifier names can be assessed with 97%+ accuracy and explained with SHAP. Code snippets can be classified with 98%+ accuracy and explained with LIME. Developer experience levels can be classified with 98.74% accuracy in 8.27 seconds.

But the more important finding is what the explainability analyses reveal about what quality means. Meaningful Clarity and Naming Conformance — whether an identifier's tokens are recognisable words, and whether it follows the conventions of its language — are the primary drivers of readability predictions at both the identifier and snippet levels. This convergence suggests that code readability, at its core, is about communication: does the code say what it means, in a language the reader can parse without effort?

That is not a surprising finding. Experienced developers have known it for decades. What this thesis contributes is the machinery to measure it automatically, explain it to any reader, and validate it empirically across two levels of analysis with two independent methods.

The practical work of making code more readable — one identifier at a time — can now be supported by tools that know what they are measuring and why.

---

*Chapter 7 complete. Proceeding to References and Appendices.*
