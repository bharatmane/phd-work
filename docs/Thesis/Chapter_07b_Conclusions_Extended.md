# CHAPTER 8 (CONCLUSIONS): EXTENDED — FUTURE RESEARCH PROGRAMME AND THESIS IMPACT

*This file supplements Chapter_07_Conclusions.md with a detailed future research programme, impact statement, and final reflections.*

---

## C7.1 A Detailed Future Research Programme

The seven future directions identified in Chapter 7 are elaborated here with specific research questions, methodology sketches, and expected timelines. Together they constitute a research programme that the results of this thesis make feasible and necessary.

### C7.1.1 Priority 1: Human Validation Study (12–18 months)

**Research question:** Do IRAF-XADL's High/Medium/Low identifier classifications correspond to measurable differences in developer comprehension speed and accuracy?

**Proposed methodology:**

1. Select 60 Python functions from open-source repositories (20 each with predominantly High, Medium, and Low IRAF-XADL-classified identifiers).
2. For each function, create a paired version where Low-readability identifiers are renamed to High-readability equivalents (guided by SHAP attributions to understand what specifically to change: if MC is the primary negative driver, replace non-word tokens with recognisable English words; if NC is primary, fix convention violations).
3. Recruit 90 professional Python developers (30 per condition: original Low-rated, renamed High-rated, and control functions with no change).
4. Measure comprehension accuracy (correct answers on standardised questions about function purpose and behaviour), time-to-first-correct-hypothesis, and bug detection time for seeded single-line defects.
5. Analyse: is there a significant difference in comprehension outcomes between IRAF-XADL High and IRAF-XADL Low identifier conditions? How does this compare to the 19% improvement found by Hofmeister et al. (2017) for full-word vs. single-letter naming?

**Expected contribution:** This study would provide the ecological validity that benchmark evaluation cannot — direct evidence that IRAF-XADL's classifications correspond to real comprehension consequences. It would also allow calibration of the model's threshold (what P(Low) score corresponds to a practically significant comprehension cost?).

### C7.1.2 Priority 2: Multi-Language Extension (6–12 months)

**Research question:** Do the ten readability parameters, the SA-BiLSTM architecture, and the SHAP importance rankings generalise to Java and JavaScript?

**Proposed methodology:**

1. Extend the AST-based extraction pipeline to Java (using JavaParser) and JavaScript (using Esprima or Babel AST).
2. Specify NC convention rules for each language:
   - Java: PascalCase for classes/interfaces, camelCase for methods/variables, UPPER_SNAKE_CASE for constants.
   - JavaScript: camelCase for variables/functions, PascalCase for constructors, consistent module conventions.
3. Identify or create benchmark datasets for Java and JavaScript readability. The most suitable existing dataset is Scalabrino et al.'s (2018) extended annotation dataset, which includes Java snippets.
4. Train IRAF-XADL on Java and JavaScript data and compare SHAP importance rankings to the Python and C++ findings. If MC and NC remain dominant across all four languages, the generalisation is established.

**Expected contribution:** A four-language IRAF-XADL that covers the most commonly used languages in industry (Python, C++, Java, JavaScript), with empirical evidence of either consistent or language-specific feature importance.

### C7.1.3 Priority 3: Fine-Tuned CodeBERT (3–6 months, high compute required)

**Research question:** How much does fine-tuning CodeBERT (rather than using it frozen) improve identifier and snippet readability classification accuracy?

**Proposed methodology:**

1. Unfreeze CodeBERT weights and train the full model (125M parameters + SA-BiLSTM head) on the readability dataset with a lower learning rate (1e-5, as is standard for fine-tuning transformers).
2. Use a smaller batch size (8) and gradient accumulation to compensate for the increased memory requirements.
3. Apply techniques to prevent catastrophic forgetting: warm-up scheduling, layer-wise learning rate decay (lower rates for earlier CodeBERT layers, higher for later layers and the SA-BiLSTM head).
4. Compare test accuracy, F1, and AUC to the frozen-CodeBERT baseline reported in this thesis.

**Expected contribution:** Establishes the performance ceiling achievable with the full computational budget (fine-tuned transformer + SA-BiLSTM). The gap between frozen and fine-tuned performance will quantify how much of the identifer readability signal is already encoded in CodeBERT's pre-training versus how much requires task-specific adaptation.

### C7.1.4 Priority 4: IDE Plugin Development (6–12 months)

**Research question:** Does providing IRAF-XADL predictions as real-time IDE feedback during coding improve the naming quality of code produced by developers?

**Proposed methodology:**

1. Develop a VS Code extension that calls the IRAF-XADL API (deployed at phd.dgtula.com) whenever a developer types an identifier declaration.
2. Display the predicted readability class and SHAP attributions as inline hover text: "This identifier is classified as Low readability. Primary reason: Meaningful Clarity (MC = 0.2) — the tokens `psg` are not recognisable English words."
3. Conduct a randomised controlled trial: 40 developers (20 with the plugin, 20 without) work on a standardised coding task for 2 hours.
4. Measure: distribution of MC and NC scores in code produced by plugin vs. control group; developer-reported cognitive overhead of the plugin; subjective satisfaction with the feedback.

**Expected contribution:** Direct evidence that automated identifier readability feedback during coding improves naming quality, and quantification of the cognitive overhead of real-time feedback (important for adoption decisions).

### C7.1.5 Priority 5: Longitudinal Codebase Study (24 months)

**Research question:** How does deploying IRAF-XADL and ECRVR-MVEL as CI/CD quality gates affect the trajectory of codebase readability over time?

**Proposed methodology:**

1. Partner with a medium-sized software development team (50–200 developers, active codebase).
2. Run IRAF-XADL and ECRVR-MVEL on the codebase at baseline (month 0) and monthly for 24 months.
3. Integrate the tools as CI/CD quality advisors (pull request comments for Low readability identifiers) from month 6 onward, comparing months 6–24 to the baseline 0–6 period.
4. Track: distribution of MC, NC, and OL scores across the codebase over time; proportion of Low-readability pull requests; developer feedback on the tool's utility.

**Expected contribution:** The only longitudinal evidence of whether automated readability feedback creates lasting improvement in codebase naming quality, addressing one of the most significant open challenges in the program comprehension literature.

### C7.1.6 Priority 6: Developer Experience with Balanced Data (3–6 months)

**Research question:** If the BOT and NSE classes in EESQA-DELMOA's training data are augmented with additional labelled profiles, does the model's BOT recall improve substantially?

**Proposed methodology:**

1. Collect additional BOT profiles from GitHub by identifying known bot accounts (Renovate, Dependabot, GitHub Actions bots) and extracting their activity profiles.
2. Collect additional NSE profiles by identifying verified non-developer GitHub accounts (designers, project managers, documentation writers) through their stated roles in profile descriptions.
3. Augment the Perez et al. dataset with 50 additional BOT profiles and 50 additional NSE profiles.
4. Retrain EESQA-DELMOA with the augmented dataset and compare BOT recall to the 20% baseline.

**Expected contribution:** Demonstrates whether the BOT recall limitation is a data problem (solvable with more labelled BOT examples) or an inherent difficulty of distinguishing BOTs from sparse human contributors using the available features.

### C7.1.7 Priority 7: AI-Generated Code Readability Assessment (6–12 months)

**Research question:** Do AI-generated code snippets (from GitHub Copilot, ChatGPT, or Gemini Code Assist) achieve systematically different IRAF-XADL and ECRVR-MVEL readability scores than human-written code for the same tasks?

**Proposed methodology:**

1. Collect 200 programming tasks and generate solutions using three AI code generation tools (Copilot, ChatGPT, Gemini) and three human developers for each task.
2. Run IRAF-XADL on all identifiers and ECRVR-MVEL on all snippets.
3. Compare the readability distributions: do AI-generated solutions show systematically higher or lower readability than human solutions? Do different AI tools have characteristic naming styles (e.g., one tends to use verbose descriptive names, another tends toward abbreviations)?
4. Validate against human raters: show pairs of AI-generated and human-written solutions to 30 developers and ask which is more readable.

**Expected contribution:** First systematic readability assessment of AI-generated code, establishing whether current AI code generation tools produce more or less readable code than human developers. Given the rapidly growing proportion of AI-generated code in production, this finding would have immediate practical implications for code review practices.

---

## C7.2 Impact Statement

The work in this thesis addresses a problem that is growing more important as software development scales and as AI-assisted code generation enters mainstream practice. Three practical impacts can be anticipated:

**Impact 1 — Quality assurance practice.** The deployment of IRAF-XADL and ECRVR-MVEL as CI/CD quality gates gives development teams a routine, automated mechanism for monitoring identifier naming quality and snippet readability. Teams that currently rely entirely on human code review to catch naming problems can supplement that review with automated pre-screening, reducing the burden on reviewers and the latency between code submission and feedback.

**Impact 2 — Developer education.** The explainability outputs of IRAF-XADL — SHAP attributions that explain why an identifier is classified as Low readability — provide a form of personalized naming quality education. A junior developer whose `psgCnt` identifier is flagged with "MC = 0 because `psg` and `cnt` are not recognisable English words" learns not just that the name is bad but why, in terms that map directly to the principle they should internalise: use meaningful words.

**Impact 3 — AI code quality benchmarking.** As AI code generation becomes pervasive, the need for automated readability assessment grows proportionally. A developer using GitHub Copilot does not review each identifier name with the same attention as code they write themselves — they accept suggestions more quickly. IRAF-XADL's ability to automatically flag AI-suggested identifiers that fall below readability thresholds would provide a lightweight quality gate for AI-assisted development that does not currently exist in any commercial tool.

---

## C7.3 Reflections on the Research Process

### C7.3.1 What Took Longer Than Expected

The most time-consuming aspect of the research was not the model development but the dataset preparation and labelling decisions. The Kaggle dataset's composite readability score required substantial analysis (checking for outliers, understanding the correlation structure, deciding on tertile thresholds) before it was usable for three-class classification. The realisation that the composite score is primarily a measure of code structural simplicity rather than identifier semantic quality — and the implications of that for interpreting the models' learned signals — required revisiting several architectural and evaluation choices.

### C7.3.2 What Worked Better Than Expected

The convergence of SHAP and LIME findings was not anticipated when the studies were designed. The two explainability methods were included independently — SHAP for Study 1 and LIME for Study 2 — based on their appropriateness for the respective input types (feature vectors for SHAP, token perturbations for LIME). The convergence on the same primary features (MC and NC) across both methods and both levels of analysis is the most compelling finding of the thesis and the one most likely to influence how the field thinks about identifier-level and snippet-level readability assessment.

### C7.3.3 The Most Honest Limitation

The most honest limitation of this thesis is the label quality issue. Both code-level studies use labels derived from a composite score that measures code simplicity rather than identifier semantic quality. The models are therefore learning, in part, to predict code simplicity — a related but distinct construct from what the thesis claims to assess. The SHAP and LIME findings provide partial mitigation (they show that naming quality features are predictive even given the imperfect labels), but a future study with human-annotated identifier-specific readability labels would provide a more direct test of the systems' core claims.

Acknowledging this limitation honestly is not just a matter of academic integrity — it is a practical signal for users of these systems. A developer who uses IRAF-XADL to assess a short, algorithmically simple function with clear naming will receive a reliable High readability prediction. A developer who uses it to assess a long, complex function with clear naming may receive a Low readability prediction that reflects the structural complexity more than the naming quality. Understanding this limitation allows practitioners to use the system appropriately: as one signal among several in a quality assessment, not as a definitive verdict.

---

## C7.4 The Closing Argument

This thesis began with the observation that developers read code far more than they write it, and that identifier names are the primary medium through which code communicates with its readers. Twenty pages later, the same observation supports the same conclusion — but now it is backed by 97%+ accuracy classifiers, 98%+ ensemble predictions, SHAP attributions that converge with LIME findings across two levels, and a developer experience classifier running in 8 seconds.

The closing argument is simple: if we can measure readability — at the identifier level, the snippet level, and the developer level — with high accuracy and with explanations, then we can give developers the feedback they need to improve it. Not all code problems can be fixed with better naming. But a surprising number of maintenance headaches, onboarding challenges, and debugging delays trace directly to a developer who chose `x` when they could have chosen `currentPosition`, or `calc` when they could have chosen `calculateDiscountedTotal`. These are small choices that accumulate into large costs.

IRAF-XADL, ECRVR-MVEL, and EESQA-DELMOA make those costs visible, one identifier at a time.

---

*End of Chapter 7 Extended.*
