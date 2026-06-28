# CHAPTER 7 (DISCUSSION): EXTENDED ANALYSIS — CROSS-STUDY DEEP DIVE, IMPLICATIONS FOR PRACTICE, AND RESEARCH POSITIONING

*This file supplements Chapter_06_Discussion.md with deeper analysis of findings, broader positioning in the literature, and detailed practical implications.*

---

## D6.1 The Readability Measurement Problem: A Twenty-Year Perspective

Code readability is not a new concern. Kernighan and Plauger's observation in 1978 that names should be descriptive is almost half a century old, and the empirical investigation of that claim began in earnest around 2004 with Relf's systematic naming guidelines study. Yet in 2024, software teams still routinely produce codebases where identifiers communicate nothing — where a developer encountering a function named `proc`, a variable named `d`, or a class named `Handler` must read the entire implementation before understanding what that code element represents.

The gap between the advice and the practice is not a failure of communication. Developers know that names should be descriptive. The gap is a failure of feedback: there is no routine, automated signal that tells a developer, in the flow of their work, that a name they just wrote is problematic. Code review catches some naming issues, but reviewers primarily focus on correctness, security, and architecture — naming is a second-order concern that many teams address only when it becomes severe enough to cause a bug.

The three systems proposed in this thesis address the feedback problem. IRAF-XADL can be deployed as a pre-commit hook that flags identifiers with MC < 0.5 or NC < 0.6 before they enter the repository. ECRVR-MVEL can be integrated into a pull request review bot that scores snippet readability and surfaces low-scoring snippets for human attention. EESQA-DELMOA can be run periodically on contributor profiles to inform pair-programming assignments and mentorship decisions.

What distinguishes these systems from prior attempts at automated naming quality enforcement is the explainability. A linter that says "this variable name is too short" provides actionable feedback. But IRAF-XADL's SHAP attributions say something more informative: "this identifier's Meaningful Clarity score is 0.2 because the tokens `psg` and `cnt` are not recognisable English words, and Domain Relevance is 0 because neither token appears in the domain vocabulary inferred from the surrounding code." The developer does not just know that the name is bad — they know exactly why, in terms they can act on.

---

## D6.2 Connecting the Three Studies: A Causal Chain

The three levels studied in this thesis — identifier, snippet, developer — are not independent. They form a causal chain in which each level influences the next.

A developer's experience level shapes their naming decisions at the identifier level. This has been established empirically by Hofmeister et al. (2017), who showed that experienced developers leverage descriptive names more effectively and are more likely to produce them. In the terms of Study 3, a developer classified as ESE (Experienced Software Engineer) or SA (Software Architect) is more likely to produce identifiers that score high on MC and NC — and therefore identifiers that IRAF-XADL would classify as High readability.

The aggregate identifier quality across a snippet determines its snippet-level readability. A snippet where all identifiers score high on MC and NC will have high ECRVR-MVEL readability — not necessarily because the snippet is simple (it may be algorithmically complex) but because its vocabulary communicates the complexity clearly. This is the insight that the LIME analysis in Study 2 confirms: identifier naming tokens are the primary signal for snippet-level readability classification.

This causal chain has a practical implication. Improving developer experience — through education, mentorship, code review culture, or hiring — is an investment in identifier quality, which is in turn an investment in snippet readability. The three systems in this thesis can be used to measure the effect of such investments at each level: EESQA-DELMOA to assess the development team's experience distribution, IRAF-XADL to measure the resulting identifier quality in the codebase, and ECRVR-MVEL to assess the snippet-level readability outcome.

---

## D6.3 The Explainability Convergence: What It Means for the Field

The thesis's central empirical finding — that SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity and Naming Conformance as the primary readability drivers — warrants extended treatment because of its implications for the research field.

### D6.3.1 What the Convergence Proves

The convergence proves three things:

**First, that MC and NC are genuine signals, not model artefacts.** If SHAP had identified MC as important and LIME had identified something else (say, line length or loop count), a reasonable interpretation would be that each method found the signal its architecture was most sensitive to, rather than finding a genuine feature of the data. The convergence across two methods with fundamentally different explainability approaches — Shapley values from cooperative game theory versus local linear approximations — makes the signal-as-artefact explanation implausible.

**Second, that the feature set designed for identifiers generalises to snippets.** MC and NC are defined for individual identifiers. The fact that they appear as primary signals at the snippet level (via LIME, which operates on token perturbations of full snippets) means that the concepts they capture — whether a name's tokens are recognisable words, and whether they follow conventions — scale up from the identifier to the snippet as the unit of analysis.

**Third, that the two readability levels are measuring aspects of the same underlying construct.** This sounds obvious but is not guaranteed. One could imagine a world in which identifier readability is determined primarily by individual naming quality while snippet readability is determined primarily by structural complexity (number of loops, nesting depth, line count). In such a world, SHAP and LIME would point to different features. The convergence shows that at least at the snippet level used in this dataset (LeetCode solutions), naming quality dominates structural complexity as a readability signal.

### D6.3.2 What the Convergence Does Not Prove

The convergence does not prove that structural features are unimportant. The LIME analysis in Study 2 shows that loop count, nesting depth, and code length do appear as negative drivers for High readability predictions — they pull toward Low or Medium. What the convergence shows is that naming quality (via identifier tokens) is a *stronger* signal than these structural features, not that the structural features are irrelevant.

The convergence also does not generalise automatically to all code types. The LeetCode dataset used in this thesis consists of single-function solutions to algorithmic problems. In this context, identifier naming is relatively more important than in, say, a 50,000-line enterprise application where class design, module organisation, and architectural naming conventions contribute substantially to readability. The convergence should be interpreted as a finding about the LeetCode domain specifically, with the hypothesis that it would extend to other domains requiring further validation.

---

## D6.4 The Role of the Raw Material Literature in Contextualising the Findings

The 42 source papers in the raw-material collection (including Buse and Weimer's "Learning a Metric for Code Readability," Schankin et al.'s "Descriptive Compound Identifier Names Improve Source Code Comprehension," Butler et al.'s "Relating Identifier Naming Flaws and Code Quality," and Posnett et al.'s "A Simpler Model of Software Readability") collectively establish the landscape of prior work that IRAF-XADL, ECRVR-MVEL, and EESQA-DELMOA extend.

Buse and Weimer (2010) showed that automated readability metrics can be learned from human annotations using logistic regression. Their work established that code readability is measurable — the question they left open was whether it could be measured accurately enough to be useful in practice, and whether the measurement could be explained. The accuracy gap they left — approximately 66% for their best model — has been substantially closed by IRAF-XADL (97.36%) and ECRVR-MVEL (98.15%).

Posnett, Hindle, and Devanbu (2011) in "A Simpler Model of Software Readability" made the argument that identifier-related features explain more variance in readability annotations than all structural features combined. This claim — which was somewhat counterintuitive at the time — is now validated by the SHAP and LIME findings of this thesis at two levels of analysis. The naming quality signal that Posnett et al. identified in a correlation analysis is the same signal that IRAF-XADL and ECRVR-MVEL learn to predict with high accuracy.

Schankin et al.'s "Descriptive Compound Identifier Names Improve Source Code Comprehension" found that developers find bugs 14% faster when identifiers use descriptive compound names rather than abbreviated or single-letter names. This human performance benefit is the underlying justification for building automated identifier readability tools: if poor naming costs developers 14% of their time on debugging tasks alone, the aggregate cost across a large codebase is substantial.

Butler et al.'s "Relating Identifier Naming Flaws and Code Quality" connected naming conventions to defect density in open-source Java projects. Their finding that functions with more naming antipatterns contain more defects provides the economic justification for IRAF-XADL: reducing identifier naming flaws is not just an aesthetic improvement but a quality improvement with measurable effects on defect rates.

---

## D6.5 Practical Workflow Integration

### D6.5.1 IRAF-XADL in Code Review

The most natural deployment for IRAF-XADL is as a pre-commit or pre-review analysis step. A practical integration would:

1. Extract all identifiers from changed files using the same AST-based pipeline as IRAF-XADL.
2. Compute the ten readability parameters and CodeBERT embeddings.
3. Run the SA-BiLSTM classifier.
4. Flag identifiers with P(Low) > 0.8 in the pull request review.
5. Include the SHAP attributions for flagged identifiers so the developer understands why the identifier was flagged.

The expected false positive rate (identifiers incorrectly flagged as Low) is approximately 2.64% based on the test accuracy. In a pull request with 50 changed identifiers, this implies roughly 1 false positive on average — an acceptable rate for a quality advisory tool where the developer always has the final decision.

The API developed for this thesis (live at https://phd.dgtula.com/api/predict) provides the foundation for such an integration. The `/predict` endpoint accepts a code snippet and returns identifier-level predictions with SHAP attributions in approximately 50 milliseconds per request — fast enough for real-time IDE integration.

### D6.5.2 ECRVR-MVEL in Continuous Integration

ECRVR-MVEL is best suited for CI/CD integration at the pull request level. A CI step that runs ECRVR-MVEL on changed functions and reports snippet-level readability scores alongside existing checks (test coverage, static analysis, linting) would create a routine feedback mechanism for readability improvement.

The key design question for CI integration is the threshold for blocking versus warning. Given the 1.85% error rate (100% - 98.15%), a blocking policy (failing the CI pipeline on Low readability predictions) would produce approximately 1 false failure per 54 pull requests. For most teams, this is too aggressive — a warning policy (surfacing Low predictions without blocking) is more appropriate. Teams can progressively tighten the threshold as they accumulate trust in the system's predictions and develop a naming culture.

### D6.5.3 EESQA-DELMOA for Team Management

The developer experience classifier is best deployed at the team level rather than the individual level. Running EESQA-DELMOA on the full contributor roster of a project produces a distribution of experience classifications that project managers can use to:

- Identify the proportion of ESE/SA contributors who should be prioritised as code reviewers.
- Identify SE contributors who would benefit from pairing with ESE contributors.
- Track how the team's experience distribution changes over time as contributors join and leave.
- Compare experience distributions across project components (some modules may be maintained primarily by inexperienced contributors, creating technical risk).

The system is explicitly designed not to be used for individual performance evaluation — its predictions are based on observable activity proxies, not on demonstrated skill, and the BOT/UNK limitations mean that a substantial fraction of contributors cannot be reliably classified. The ethical use cases are team-level aggregate analysis and identification of mentorship opportunities, not individual ranking or hiring decisions.

---

## D6.6 Comparison with Industrial Code Quality Tools

Several commercial and open-source tools assess code quality and could be considered competitors or complements to the systems proposed in this thesis. This section positions the three systems relative to the most prominent existing tools.

**SonarQube** (SonarSource) is the most widely deployed code quality platform in industry. It provides over 5,000 rules for detecting bugs, code smells, security vulnerabilities, and style violations across 29 programming languages. SonarQube does include some naming-related rules (e.g., "Method names should not have a specific format," "Field names should not be too short") but these are primarily convention checks rather than semantic quality assessments. SonarQube cannot assess whether an identifier's tokens are meaningful English words, whether they are domain-relevant, or whether they are contextually consistent with other identifiers. IRAF-XADL addresses this gap with a deeper, semantically grounded assessment that SonarQube's rule-based approach cannot replicate.

**Pylint** (for Python) and **cpplint** (for C++) are linting tools that enforce naming convention compliance — essentially automating the NC feature from IRAF-XADL. However, they cannot assess MC (meaningful clarity), DR (domain relevance), CC (context consistency), or any of the cognitively motivated features. They catch convention violations but not semantic poverty.

**DeepSource** and **CodeClimate** are more recent AI-assisted code quality platforms that use machine learning to detect code patterns associated with quality problems. Neither has published a system that combines CodeBERT embeddings with attention-based classification and SHAP explainability for identifier readability specifically.

The key differentiator of the systems proposed in this thesis is the combination of semantic depth (CodeBERT embeddings capturing contextual meaning), multi-dimensional features (ten parameters capturing different quality dimensions), and explainability (SHAP and LIME providing actionable attributions). No existing commercial tool provides all three for identifier or snippet readability assessment.

---

## D6.7 Limitations in Depth: A Candid Assessment

The threats to validity catalogued in Chapter 4 deserve expanded discussion in the light of the full experimental results.

### D6.7.1 The Label Propagation Limitation and What It Actually Costs

The most fundamental limitation of Studies 1 and 2 is that identifier-level labels are propagated from snippet-level scores. This means that every identifier in a Low-readability snippet is labelled Low, even if some of those identifiers are individually well-named.

The cost of this limitation can be estimated from the error analysis in Section A3.5. The Low→Medium confusions (8 cases out of 504 test examples) represent identifiers in Low-readability snippets that the model predicts as Medium — suggesting these identifiers have better naming quality than the snippet-level label implies. If the model's prediction is correct (the individual identifier is genuinely Medium quality), then the training set has 8/504 ≈ 1.6% mislabelled examples in the Low class. For a dataset of this size and a model of this accuracy, 1.6% label noise is manageable — it reduces ceiling performance but not by a disqualifying amount.

The deeper limitation is that this creates a ceiling: no matter how well IRAF-XADL's model is trained, it cannot exceed the quality of the labels it is trained on. A model trained on perfectly labelled identifier-level data would likely achieve higher accuracy — and perhaps even clearer SHAP attributions — than one trained on propagated snippet-level labels. This is the primary motivation for future work on human-annotated identifier readability datasets.

### D6.7.2 The LeetCode Distribution Problem

LeetCode solutions have characteristics that do not represent all types of code:

- They are typically single-function solutions, making them unusually short (median 11 lines for High-readability snippets in the dataset).
- They solve algorithmic problems that encourage certain naming patterns — loop indices (`i`, `j`), temporary accumulator variables (`res`, `ans`), graph nodes (`u`, `v`) — that are common in competitive programming but rare in production code.
- They have no project context: there are no imports that would establish domain vocabulary, no related functions that would provide context for DR and CC scoring.

The consequence is that the models trained on this dataset have learned the readability patterns of competitive programming code, not production code. A function from a Django web application — with its model objects, queryset operations, and framework-specific naming — might look very different in the model's feature space from what it learned from LeetCode.

This is not just a theoretical concern. The live demo at phd.dgtula.com, when tested with production Python code from frameworks like Flask or Django, sometimes produces predictions that feel off to an experienced developer — correctly identifying poor identifier names but occasionally misclassifying well-named but non-algorithmic code patterns. This limitation is inherent to the training data and would require a broader, more diverse dataset to address.

### D6.7.3 The BOT Class and Real-World Bot Detection

The BOT class's low recall (20%) reflects more than just class imbalance. Even with balanced training data, BOT detection from activity features is inherently difficult because modern CI/CD bots (GitHub Actions, Renovate, Dependabot) are designed to look like human contributors in their activity patterns — they create descriptive commit messages, submit meaningful pull requests, and participate in code review workflows.

The most reliable BOT-detection signals are temporal regularity (exact scheduling of commits) and scope specialisation (BOTs typically modify only a narrow set of files, usually configuration or dependency files). Both signals are captured in the 26 features but with low selection frequency in BAHB (suggesting they are inconsistently predictive). A dedicated BOT detection system using temporal regularity analysis would likely achieve much higher BOT recall than a general experience classifier.

---

## D6.8 The Naturalness Hypothesis and Its Implications

Hindle et al. (2012) proposed the "naturalness hypothesis" — the observation that software code is repetitive and predictable, more like natural language than like mathematical notation, and therefore amenable to the same statistical modelling techniques that have succeeded for NLP. This hypothesis, now widely accepted, has two implications for the findings of this thesis.

The first implication is that identifier naming patterns follow statistical regularities that machine learning models can learn. The success of IRAF-XADL's CodeBERT embeddings in capturing identifier quality reflects the naturalness of good naming: well-named identifiers follow the same distributional patterns as good natural language descriptions, and CodeBERT — trained on natural language-code pairs — has internalised those patterns.

The second implication is that bad naming is identifiable precisely because it violates these statistical regularities. An identifier like `x` or `tmp2` is unnatural — it does not follow the patterns that CodeBERT learned from millions of well-named code examples. IRAF-XADL classifies such identifiers as Low readability not because of an explicit rule, but because their feature profiles and embeddings fall in regions of the model's learned representation that correspond to Low-readability examples from training.

This framing connects IRAF-XADL to the broader naturalness literature (Allamanis et al., 2018; Hindle et al., 2012) and suggests a possible extension: using the model's prediction confidence as a "strangeness" score — identifiers that produce very high-confidence Low readability predictions are the most statistically unusual, and therefore potentially the most problematic.

---

## D6.9 Future Research Agenda

Beyond the specific future directions noted in Chapter 8 (Conclusions), this section describes a broader research agenda for multi-level program comprehension assessment.

### D6.9.1 The Human Study Gap

The most impactful future study would be a controlled human experiment that directly measures developer comprehension speed and accuracy on code where identifiers have been classified by IRAF-XADL as High versus Low readability. Such a study would:

1. Identify 50 code functions and classify all their identifiers using IRAF-XADL.
2. For 25 functions, rename the Low-readability identifiers to High-readability equivalents (guided by the SHAP attributions to understand what needs to change).
3. Present both versions to 60 developers (30 seeing the original, 30 seeing the renamed version) and measure: time to describe the function's purpose, time to identify a seeded bug, and number of correct answers on comprehension questions.
4. Compare outcomes between groups.

If developers comprehend the High-readability renamed version faster and more accurately, this would provide the ecological validity that the benchmark evaluation cannot: direct evidence that IRAF-XADL's predictions correspond to real comprehension outcomes.

This study design mirrors Hofmeister et al. (2017), who found a 19% speed improvement with descriptive names, but would use IRAF-XADL predictions rather than manually assigned naming styles. The result would establish whether IRAF-XADL's classification threshold corresponds to a meaningful human comprehension difference.

### D6.9.2 Multi-Language Extension

The preprocessing pipeline in IRAF-XADL is modular: the AST parser is a pluggable component, and the naming convention rules (NC feature) are language-specific rules tables. Extending to Java would require integrating the JavaParser library and defining NC rules based on Java's camelCase and PascalCase conventions. Extending to JavaScript would require an Esprima or Babel AST parser and rules for the loose JavaScript ecosystem.

A multi-language study would also enable a comparison across languages: do the SHAP importance rankings of the ten features differ between Python, C++, and Java? If MC and NC are dominant for all three languages, the finding generalises strongly. If different features dominate for different languages (e.g., if domain relevance is more important in Java enterprise code because of its strongly typed, interface-driven naming conventions), the finding is language-specific.

### D6.9.3 Longitudinal Codebase Study

All three studies in this thesis use cross-sectional data — snapshots of code and developer profiles at a point in time. A longitudinal study would track a codebase and its contributors over 12–24 months and measure:

- How identifier readability evolves as the team grows (does it degrade as new contributors with lower experience join?).
- Whether interventions (deploying IRAF-XADL as a code review tool) improve identifier readability scores over time.
- Whether developer experience levels (as measured by EESQA-DELMOA) correlate with the trend in identifier quality they introduce.

This longitudinal design would address two open questions from the thesis: whether the systems' predictions are ecologically valid at the project level, and whether their deployment creates the quality improvement they are designed to enable.

---

## D6.10 Summary and Research Positioning

This thesis contributes to a literature that has been asking the same core question since the 1970s — do identifier names matter for program comprehension? — but answering it with progressively more sophisticated tools. The early work answered with controlled experiments and human annotation. The 2010s answered with automated metrics and machine learning. This thesis answers with deep learning, multi-dimensional features, contextual embeddings, and explainability — at three levels simultaneously.

The five contributions sit in a clear progression:

1. The ten-parameter feature set operationalises fifty years of cognitive theory into computable features.
2. IRAF-XADL applies those features at the identifier level with state-of-the-art accuracy.
3. ECRVR-MVEL demonstrates that the snippet level benefits from ensemble diversity.
4. EESQA-DELMOA extends the assessment to the developer level with practical efficiency.
5. The cross-study XAI validation provides the first empirical evidence that naming quality features are consistent primary readability drivers across two levels of analysis and two explainability methods.

The live demo at https://phd.dgtula.com makes all three findings accessible to practitioners who have never read this thesis. Paste in a Python snippet; receive a readability verdict, a factor analysis, and an identifier-level breakdown with attention weights. The system embodies the core claim: program comprehension can be assessed automatically, accurately, and interpretably, at every level from the individual identifier name to the human who chose it.

---

*End of Chapter 6 Extended Analysis.*
