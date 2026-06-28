# CHAPTER 2: LITERATURE SURVEY

---

## 2.1 Introduction

A literature review serves two purposes that pull in opposite directions. It should be broad enough to situate the research within the wider conversation of the field, but selective enough to remain useful — a catalogue of every paper ever written on code quality would occupy the entire thesis without illuminating anything. The review in this chapter navigates that tension by organising the literature thematically, identifying the most important lines of work in each area, and being explicit about why each line of work is relevant to the three studies that follow.

Eleven thematic areas are covered. The first three — program comprehension theory, code readability measurement, and identifier quality — establish the conceptual foundation. The next five — machine learning for code analysis, transformer models, ensemble methods, recurrent architectures, and spiking neural networks — cover the technical approaches that the proposed systems build on or depart from. Two further sections cover explainable AI and developer experience assessment. Following these thematic reviews, the chapter presents dedicated sections on challenges in existing approaches, notable applications and case studies, and justification for the specific models selected for each study. The chapter concludes with a consolidated table of existing works and their limitations, and an explicit identification of the four research gaps that this thesis addresses.

---

## 2.2 Program Comprehension: From Cognitive Theory to Engineering Practice

The study of how developers understand programs has a longer history than most software engineering researchers realise. It began not in computer science but in cognitive psychology, when researchers in the 1970s started asking whether the cognitive processes involved in understanding natural language text also apply to programming languages.

Shneiderman and Mayer (1979) were among the first to frame this question systematically. They proposed that programmer knowledge has two components: syntactic knowledge (the formal rules of the language) and semantic knowledge (understanding of what the code represents). Their model predicted that programmers with better semantic knowledge would comprehend unfamiliar programs faster and with fewer errors — a prediction confirmed in a series of controlled experiments that showed experienced programmers could chunk code into meaningful units while novices processed code token by token.

Brooks (1983) introduced the concept of hypothetical reasoning in program comprehension: programmers do not read code passively but generate hypotheses about its purpose based on clues — the function name, the types of its parameters, the first few lines of its body — and then selectively read the remaining code to confirm or refute those hypotheses. This insight has a direct implication for identifier naming: the identifier is often the first and most important clue. A well-named identifier confirms the hypothesis quickly; a poorly named one forces more reading.

Von Mayrhauser and Vans (1995) synthesised the prior two decades of work into an integrated metamodel that distinguished three comprehension strategies:

1. **Top-down:** Starting from high-level understanding of the program's purpose and decomposing into sub-components. Experienced developers who know the domain use this strategy when reading familiar code patterns.
2. **Bottom-up:** Starting from low-level code details and building up a model of what the code does. This strategy dominates when the code is unfamiliar or poorly structured.
3. **Opportunistic:** Switching between strategies based on local cues. A developer who encounters an unfamiliar function might switch from top-down to bottom-up for that section.

The model predicts that poorly named identifiers force bottom-up comprehension even when a top-down strategy would be more efficient — the developer cannot form a reliable hypothesis from a cryptic name and must fall back to reading the implementation.

Storey (2005) reviewed the empirical and cognitive literature and identified three factors that consistently affect comprehension time and accuracy: the quality of the developer's existing domain knowledge, the quality of the source code itself, and the quality of the tools available. This thesis addresses the second factor directly.

Siegmund et al. (2014) used functional magnetic resonance imaging (fMRI) to study which brain regions activate during program comprehension. They found that comprehension activates areas associated with language processing (Broca's area, Wernicke's area) rather than areas associated with mathematical reasoning. This neurobiological finding strongly suggests that code comprehension is processed as a form of language comprehension — meaning that the linguistic quality of identifiers is a determinant of the neural cost of comprehension, not merely a stylistic preference.

Xia et al. (2017) conducted a large-scale field study with professional developers, tracking their actual reading behaviour over weeks using a custom IDE plugin. Their findings are practically significant: developers spend on average 58% of their coding time reading rather than writing code. Of that reading time, approximately 35% is spent specifically on understanding identifier names in context. No other single activity consumed as large a fraction of reading time. This finding provides empirical grounding for the thesis's primary claim: identifier quality is the most important single determinant of comprehension cost.

### 2.2.1 The Vocabulary Problem

One consistent theme in the program comprehension literature is what Starke et al. (2009) called the vocabulary problem: the names that appear in source code and the concepts they represent often have a many-to-many relationship. The same concept may be named differently in different codebases (`userList`, `users`, `members`, `accounts`). The same name may refer to different concepts in different codebases (`data` is semantically empty; `temp` could mean temperature or temporary). This ambiguity increases comprehension cost because the developer cannot rely on name recognition — they must infer from context.

IRAF-XADL's feature set addresses the vocabulary problem through several of its ten parameters. Meaningful Clarity (MC) directly penalises names whose tokens are not recognisable words. Lexical Familiarity (LF) penalises tokens that are rare in the corpus. Predictability (PRED) rewards names whose tokens co-occur with tokens of neighbouring identifiers — a form of contextual coherence that reduces vocabulary ambiguity.

---

## 2.3 Code Readability: Measurement Approaches and Their Limitations

The transition from cognitive theory to practical measurement is difficult. Readability — like usability or elegance — is easy to recognise and hard to quantify. The research community has tried four broad approaches: human annotation studies, metric-based scoring, machine learning from annotations, and deep learning from code representations.

### 2.3.1 Human Annotation Studies

The foundational work is Buse and Weimer (2008, 2010), who recruited 120 volunteer participants to rate the readability of 100 Java code snippets on a five-point Likert scale. Their analysis revealed that humans agree more than chance would predict (mean inter-rater correlation ≈ 0.65) but substantially less than perfect. The features that correlated most strongly with human ratings in their linear regression model were: the ratio of operators to operands, the number of blank lines, identifier length, the presence of comments, and the depth of nesting — all surface-level structural features, not semantic features of the identifiers.

The Buse-Weimer dataset became the de facto benchmark for a decade of readability prediction research. This is both its value and its limitation: by anchoring research to a single annotation methodology, it may have slowed the field's recognition that semantic identifier quality matters more than structural surface features. Crucially, their 16 features did not include any measure of whether identifier tokens were meaningful English words. Meaningful Clarity (MC) and Lexical Familiarity (LF) in IRAF-XADL are, in a sense, the missing features from Buse and Weimer's model.

Scalabrino et al. (2016) conducted a larger annotation study (121 participants, 444 snippets) and found that several features considered important in the Buse-Weimer model had low inter-rater agreement when examined carefully. They proposed a revised feature set that placed greater weight on documentation quality, cognitive complexity, and identifier-level semantics.

Dorn (2012) conducted an annotation study using professional software developers rather than students and found different feature rankings: identifier naming quality emerged as more important to professionals than to students, while visual alignment and whitespace were more important to student annotators. This is consistent with the hypothesis that experienced developers attend to meaning (identifiers) while novices attend to form (visual presentation).

### 2.3.2 Metric-Based Approaches

Posnett, Hindle, and Devanbu (2011) made a finding that directly motivates this thesis. In a large analysis of the Buse-Weimer dataset, identifier-related features explained substantially more variance in readability ratings than all structural features combined. Specifically, the proportion of identifiers that are recognisable English words explained more variance than line length, nesting depth, and operator density combined. This finding received less attention than it deserved at the time, and the field continued to develop structural metrics (cyclomatic complexity, Halstead measures, Maintainability Index) while largely ignoring the semantic content of identifier names.

### 2.3.3 Machine Learning Approaches

The transition to machine learning for readability prediction began with Buse and Weimer's own logistic regression. Subsequent work applied support vector machines (Scalabrino et al., 2016), random forests, and gradient boosting (Daka et al., 2015). These models achieved incrementally better accuracy but faced a ceiling: hand-engineered features can only capture what the engineer thought to measure.

The ceiling was partially broken by deep learning approaches. White et al. (2015) applied recurrent neural networks to token sequences. Later work (Mi et al., 2018) applied inception convolutional architectures to code readability classification, achieving approximately 87% accuracy on the Buse-Weimer dataset — representing the state of the art that pre-CodeBERT approaches could reach.

### 2.3.4 Limitations of Existing Approaches

Four limitations are common to most prior work and motivate the design choices in this thesis:

1. **Snippet-level labels for identifier-level predictions.** Prior work applies snippet-level labels uniformly to all identifiers in the snippet, treating a poorly named identifier within an otherwise readable snippet as readable. IRAF-XADL addresses this by assigning individual quality scores to each identifier.

2. **No contextual embeddings.** Prior work uses bag-of-words token representations or handcrafted features. CodeBERT's contextual embeddings represent each identifier in the context of the surrounding code, capturing dependencies that no prior feature could represent.

3. **Binary classification.** Most prior work predicts "readable" vs. "unreadable." A three-class prediction (Low/Medium/High) is more informative for practitioners who need to know not just whether a snippet is problematic but how problematic.

4. **No explainability.** With very few exceptions (Mi et al., 2025), prior work does not explain its predictions. A classifier that flags a snippet as Low readability without identifying which identifiers or features drove that verdict is much less actionable than one that does.

---

## 2.4 Identifier Quality: Naming as a First-Class Software Engineering Concern

The observation that identifier names matter for program comprehension predates software engineering research. Kernighan and Plauger's 1978 book *The Elements of Programming Style* devoted an entire chapter to naming, arguing that names should be descriptive, pronounceable, and appropriate for their scope. Formal empirical study began in the 2000s.

Lawrie, Morrell, Field, and Binkley (2006, 2007) ran the first controlled experiments: they showed the same Java code to two groups of developers, one seeing single-letter identifier names and one seeing full descriptive names, and measured comprehension accuracy. Developers with full-word names answered comprehension questions correctly 19% more often than those with single-letter names.

Hofmeister, Siegmund, and Holt conducted a more rigorous follow-up with 72 professional C# developers in a within-subjects design, where each developer was shown code with three identifier naming styles: single letters, abbreviations, and full words. The key quantitative finding — that full words lead to 19% faster comprehension than letters and abbreviations, measured by bug-finding time on real debugging tasks by real professional developers — is the strongest available evidence that Meaningful Clarity captures something that genuinely matters for developer productivity. The null finding is equally important: there was no significant difference between letters and abbreviations, collapsing the two into a single "bad naming" category. IRAF-XADL's MC feature reflects this: both `x` (letter) and `psgCnt` (non-standard abbreviation) receive similarly low MC scores.

Schankin et al. (2018) extended this work to show that descriptive compound names improve semantic bug detection by 14% but make no difference for syntactic error detection. This scaling effect predicts that IRAF-XADL's utility increases with code complexity — it is most valuable for complex, algorithmically rich code where poor naming has the greatest cognitive cost.

Binkley et al. (2009) studied the effect of camelCase vs. snake_case and found that both could be equally readable when used consistently. Consistency with the surrounding codebase was at least as important as the choice of convention. This motivated the Naming Conformance (NC) feature in Study 1, which rewards identifiers that follow their language's established convention without penalising either convention specifically.

Butler, Wermelinger, Yu, and Sharp (2010) analysed twelve large open-source Java projects and found that functions with naming antipatterns had significantly higher defect density than functions without. The strongest antipattern predictors of defects were: single-letter parameter names, inconsistent case convention mixing, and generic words (`data`, `info`, `manager`) without further specificity. This work has an important implication: naming quality is not just a readability concern but a code correctness concern. The SHAP finding (MC and NC dominant) is consistent with this, as both capture the features most associated with defect-correlated naming antipatterns.

Arnaoudova, Di Penta, and Antoniol (2016) introduced the concept of linguistic antipatterns — cases where the semantic content of an identifier is inconsistent with the code it names. A method named `getX` that modifies X rather than returning it is a linguistic antipattern. Their study found linguistic antipatterns in 11% of methods studied, and developers consistently found them harder to understand. This motivates the Domain Relevance (DR) and Predictability (PRED) features in IRAF-XADL, which capture the degree to which an identifier's tokens are consistent with its surrounding context.

Feitelson et al. (2020) conducted the most comprehensive naming study to date, gathering name preferences from 334 developers for 47 naming tasks. The average naming agreement score was 0.47: in any given naming task, developers agree on the same name approximately 47% of the time. This implies there is a "best" name for most programming tasks that most developers converge on, validating the use of frequency-based features (LF, PRED) in IRAF-XADL — names closer to this consensus score higher on these features. A further finding — that agreement increases with naming specificity while general-purpose names like `data` or `value` show lower agreement — is consistent with the penalty IRAF-XADL assigns to semantically empty identifiers.

### 2.4.1 Automated Identifier Renaming

A related line of work concerns automated suggestion of better identifier names. Allamanis et al. (2016) trained a neural network on large Java corpora to predict function names given the function body. Alon et al. (2019) extended this with code2vec, which represents code as paths in abstract syntax trees. These renaming systems differ from IRAF-XADL in an important way: they suggest new names but do not assess the readability of existing ones. IRAF-XADL identifies which identifiers need attention; a renaming system then proposes alternatives. Integrating the two is a natural extension of this work.

### 2.4.2 Eye-Tracking Evidence on Identifier Processing

Sharif and Maletic (2010), in their study comparing camelCase and snake_case, used eye-tracking to show how developers mentally segment identifiers during reading. More generally, Siegmund et al. (2014) showed that identifier names are the first thing developers attend to when reading a new function: the function name determines whether they continue reading, and the parameter names determine whether they understand the function's interface before reading its body. This primacy of identifier processing provides the clearest justification for why identifier-level readability assessment is a primary — not secondary — contribution of this thesis.

---

## 2.5 Machine Learning for Code Quality Prediction

### 2.5.1 Traditional Machine Learning

The earliest automated code quality predictors applied rule-based systems and simple statistical models to hand-crafted features. Halstead (1977) proposed software complexity metrics based on counts of distinct operators and operands. McCabe (1976) proposed cyclomatic complexity, measuring the number of independent paths through a function's control flow graph. Machine learning later offered a path beyond these limitations by learning what features predict human-labelled quality outcomes from data.

Support Vector Machines achieved state of the art on several code quality tasks through the 2010s, including defect prediction (Hall et al., 2012), code smell detection (Palomba et al., 2013), and code readability prediction (Scalabrino et al., 2016). Random forests became competitive alternatives. Both share a fundamental limitation: they operate on fixed-length feature vectors, while code is variable-length and structured.

### 2.5.2 Deep Learning for Sequential Code

The application of recurrent neural networks to code sequences addressed the variable-length limitation. White et al. (2015) trained LSTM networks on code token sequences for code clone detection. BiLSTMs became the natural extension: code has dependencies in both directions. Iyer et al. (2016) applied BiLSTMs to automatic code description generation. The Self-Attention mechanism added on top of BiLSTMs in Study 1 provides a further step: rather than compressing the entire sequence into a fixed-size hidden state, attention weights each position's contribution to the final representation.

### 2.5.3 Graph Neural Networks for Code Structure

Abstract syntax trees naturally represent the hierarchical structure of code. Zhang et al. (2019) used graph neural networks on AST paths for code classification. Devign (Zhou et al., 2019) applied GNNs to vulnerability detection, representing functions as compound graphs that include data flow edges, call edges, and AST edges. In Study 2, the GCN component captures structural properties of code snippets through dependency graphs, focusing specifically on relationships between identifiers.

### 2.5.4 Defect Prediction and Technical Debt

Wang et al. (2016) used a Deep Belief Network (DBN) to learn a hierarchical representation of code metrics for defect prediction, finding that the DBN significantly outperformed all metric-based baselines. The DBN is one of the three component classifiers in ECRVR-MVEL. Tsoukalas et al. (2021) applied SHAP to explain technical debt estimation models — one of the first applications of post-hoc XAI to software quality estimation — finding that code smells and structural complexity metrics were the dominant features. This contrasts with Study 1's finding that identifier naming quality (MC, NC) dominates for readability, illustrating that different quality dimensions are driven by different features.

---

## 2.6 Transformer Models in Software Engineering

### 2.6.1 The Attention Mechanism and BERT

The Transformer architecture (Vaswani et al., 2017) introduced multi-head scaled dot-product attention that allows models to relate any two positions in a sequence directly, regardless of their distance:

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

where Q, K, V are query, key, and value matrices derived from the input, and d_k is the key dimension. BERT (Devlin et al., 2019) applied bidirectional Transformers to pre-training, learning representations from unlabelled text using masked language modelling and next sentence prediction. Pre-trained BERT representations, when fine-tuned on downstream tasks, achieved state-of-the-art across eleven NLP benchmarks.

### 2.6.2 CodeBERT: Pre-Training on Bimodal Data

Feng et al. (2020) introduced CodeBERT, extending BERT's pre-training to a bimodal corpus of (natural language, code) pairs from CodeSearchNet. The bimodal pre-training allows CodeBERT to model the relationship between natural language descriptions and code — particularly relevant for identifier readability, where identifiers are natural language fragments embedded in code. Two properties make CodeBERT appropriate here: its attention mechanism relates the meaning of an identifier token to surrounding code, and its training on six programming languages gives it broad coverage of programming conventions.

A practical limitation is its 512-token context window. For individual identifiers (typically 1–8 tokens), this is no constraint. For full code snippets in Study 2, snippets exceeding 512 tokens are handled via a sliding window approach described in Chapter 4.

### 2.6.3 Post-CodeBERT Models

**GraphCodeBERT** (Guo et al., 2021) incorporates data flow graphs into pre-training. For readability tasks where naming quality and control flow interact, it might offer marginal improvements, but its substantially higher computational cost makes CodeBERT the appropriate choice for this thesis.

**CodeT5** (Wang et al., 2021) is an encoder-decoder model pre-trained on code generation and summarisation. For the classification tasks in this thesis, the encoder-only CodeBERT is more appropriate and computationally lighter.

**UniXcoder** (Guo et al., 2022) extends CodeBERT with cross-modal contrastive learning and achieves state-of-the-art on code search but has not been evaluated on code readability prediction. Comparing UniXcoder and CodeBERT on this task is a natural future experiment.

---

## 2.7 Ensemble Methods for Classification

### 2.7.1 Theoretical Foundations

The theoretical justification for ensemble methods rests on bias-variance decomposition. For a learning algorithm, the expected squared error decomposes as:

```
E[(y - ŷ)²] = Bias² + Variance + Irreducible Noise
```

Ensemble methods typically reduce variance without increasing bias: if B base classifiers each make uncorrelated errors with variance σ², their average has variance σ²/B. The critical word is "uncorrelated." If all base classifiers make the same errors on the same examples, averaging does nothing. Diversity — the property that base classifiers disagree on their errors — is the necessary condition for ensemble effectiveness (Krogh and Vedelsby, 1995).

### 2.7.2 Strategies for Achieving Diversity

Three main strategies achieve classifier diversity:

**Data diversity (bagging):** Training each classifier on a different bootstrap sample. Random forests use this strategy.

**Classifier diversity:** Training different classifiers with different architectures on the same data. This is the strategy used in ECRVR-MVEL. GCN, DBN, and Bi-TCN have fundamentally different computational structures and therefore make different types of errors.

**Feature diversity:** Training each classifier on a different feature representation. ECRVR-MVEL achieves this additionally: the three classifiers not only use different architectures but operate on structurally different representations — dependency graphs (GCN), probabilistic hidden representations (DBN), and temporal sequences (Bi-TCN).

### 2.7.3 Weighted Majority Voting vs. Stacking

**Weighted majority voting** assigns a scalar weight to each classifier's predicted probability distribution and computes a weighted average. Weights can be fixed (based on validation accuracy) or learned jointly with the classifiers.

**Stacking** (Wolpert, 1992) uses a meta-classifier to learn the best combination of base classifier predictions, trained on a held-out dataset. Stacking is more flexible but requires a separate validation set, reducing effective training set size. For datasets of the size used in this thesis (1,681 snippets), this reduction is a meaningful cost. ECRVR-MVEL uses weighted majority voting to preserve simplicity and avoid the training set reduction required by stacking.

---

## 2.8 Recurrent Architectures: LSTM and BiLSTM

Long Short-Term Memory networks (Hochreiter and Schmidhuber, 1997) addressed the vanishing gradient problem that made earlier recurrent networks ineffective for long sequences. The LSTM's gating mechanism — input gate, forget gate, output gate — allows it to selectively retain or discard information from earlier time steps.

Bidirectional LSTMs (Schuster and Paliwal, 1997) run two LSTMs over the input sequence — one forward, one backward — and concatenate their hidden states. This allows the model to use context from both past and future tokens, which is valuable for code: the meaning of an identifier may depend on how it is used later in the function, not only on how it was defined earlier.

The Self-Attention mechanism applied on top of BiLSTM in Study 1 addresses a limitation of BiLSTMs: they compress the entire sequence into a fixed-size hidden state, potentially losing information for long sequences. Self-attention computes a weighted sum of all hidden states, where the weights are learned to reflect the importance of each position. Applied to identifier sequences, self-attention identifies which tokens are most relevant for the readability prediction.

---

## 2.9 Spiking Neural Networks

### 2.9.1 The Three Generations of Neural Networks

Maass (1997) proposed a taxonomy of neural network models by generation. First-generation networks used binary threshold activations. Second-generation networks (modern deep neural networks) use continuous-valued non-linear activations. Third-generation networks — spiking neural networks — use discrete temporal spikes. The distinction matters for efficiency: real neurons fire approximately 1 Hz on average against a maximum of 100 Hz. This sparse activity means the brain performs far fewer multiply-accumulate operations than a comparably sized conventional neural network.

### 2.9.2 The Leaky Integrate-and-Fire Model

The Leaky Integrate-and-Fire (LIF) model governs membrane potential dynamics:

```
τ_m × dU/dt = -U + R × I(t)
```

In discrete-time form:

```
U(t) = (1 - D/τ_m) × U(t-1) + Σᵢ wᵢ × Sᵢ(t)
```

where D is the decay constant, wᵢ are synaptic weights, and Sᵢ(t) ∈ {0,1} is the input spike from presynaptic neuron i. When U(t) ≥ Θ (threshold), the neuron fires and U resets to resting potential. The Simplified SNN in EESQA-DELMOA collapses the membrane resistance and time constant into a single decay parameter:

```
U(t) = U(t-1) + Σᵢ wᵢ × Sᵢ(t) - D
```

This formulation is computationally equivalent for the classification task while reducing the number of hyperparameters.

### 2.9.3 Training Spiking Neural Networks

The primary challenge in training SNNs is that the spiking activation function (a Heaviside step at threshold Θ) is non-differentiable, making standard backpropagation inapplicable. Three approaches address this:

1. **Rate coding:** Converting continuous inputs to Bernoulli spike trains and training on spike rates using standard backpropagation. This is the approach used in Study 3.
2. **Surrogate gradient methods** (Neftci et al., 2019): Replacing the true gradient with a smooth surrogate (Gaussian or sigmoid) during the backward pass.
3. **ANN-to-SNN conversion:** Training a conventional neural network and converting ReLU activations to spiking neurons using threshold balancing.

EESQA-DELMOA uses a combination of rate coding and surrogate gradients, which achieves the best accuracy-efficiency tradeoff for tabular data classification (Wu et al., 2019).

---

## 2.10 Explainable Artificial Intelligence

### 2.10.1 The Interpretability Gap

The most accurate models are increasingly opaque. For decisions that affect human welfare — code review verdicts, developer assignment decisions — this opacity is genuinely problematic. A developer told their code has "Low readability" without further explanation cannot improve it. A project manager told a developer has "Junior experience" without seeing which features drove that classification cannot fairly challenge or act on the verdict.

Post-hoc explainability methods bridge this gap by approximating or attributing a complex model's predictions in human-interpretable terms.

### 2.10.2 SHAP: Game-Theoretic Feature Attribution

SHAP (SHapley Additive exPlanations) was introduced by Lundberg and Lee (2017). In a coalition game, the Shapley value for player i represents the average marginal contribution of player i across all possible coalitions:

```
φᵢ(f, x) = Σ_{S ⊆ N\{i}} [|S|!(|N| - |S| - 1)! / |N|!] × [f_x(S ∪ {i}) - f_x(S)]
```

where N is the set of all features, S is a subset excluding feature i, and f_x(S) is the model's expected prediction when only the features in S are observed.

Shapley values satisfy four axioms that make them uniquely fair attributions: efficiency (all attributions sum to prediction minus baseline), symmetry (equal contributions receive equal attributions), dummy (never-changing features receive zero attribution), and linearity (attributions for model combinations are linear combinations of attributions).

SHAP has been applied to defect prediction (Ni et al., 2022), code smell detection (Palomba et al., 2021), and technical debt estimation (Tsoukalas et al., 2021). Study 1 applies it to identifier readability classification — the first application of SHAP to this specific task.

### 2.10.3 LIME: Local Surrogate Models

LIME (Local Interpretable Model-Agnostic Explanations, Ribeiro et al., 2016) explains a single prediction by locally approximating the complex model with an interpretable surrogate. For a complex model f and input x, LIME:

1. Samples a neighbourhood of perturbed inputs z around x.
2. Weights each perturbed input by proximity to x: w(x, z) = exp(-d(x, z)² / σ²).
3. Fits a linear surrogate model g to minimise: L(f, g, π_x) = Σ_z π_x(z) × (f(z) - g(z))² + Ω(g).
4. Returns the coefficients of g as feature importance scores.

LIME's main advantage is model-agnosticism; its main limitation is instability due to stochastic sampling. For code snippet readability classification in Study 2, LIME perturbs inputs by replacing or removing individual code tokens and observing how the ensemble's prediction changes, producing token-level importance scores.

### 2.10.4 XAI in Practice

Cito et al. (2022) surveyed 80 industrial software engineers about their use of XAI tools for code quality tasks and found that fewer than 20% had used any explainability method, and most found the explanations difficult to interpret without domain-specific customisation. This finding motivates the specific design choices in Studies 1 and 2: SHAP is applied to the ten human-interpretable readability parameters rather than to the high-dimensional CodeBERT embedding (which would produce attribution over 768 dimensions with no direct meaning). The goal is explanations that are actionable, not just technically correct.

---

## 2.11 Developer Experience and Software Quality

### 2.11.1 Experience as a Quality Predictor

Sackman et al. (1968) conducted the earliest systematic study, finding a roughly 20:1 variation in programming performance between experienced and inexperienced programmers. More recent studies have produced a more nuanced picture. Bergersen et al. (2011) found that self-reported years of experience correlated poorly with actual performance; domain-specific experience predicted performance better than general years of experience.

Storey et al. (2019) proposed a theory of developer job satisfaction and productivity positioning experience as one of several interacting factors including autonomy, mastery, and collaboration quality. This broader model is important for interpreting Study 3: the six experience categories in the Perez et al. dataset are proxies for a multi-dimensional construct.

### 2.11.2 Metrics for Developer Experience

**Commit count and frequency** were used by Mockus and Herbsleb (2002), who showed that the number of files previously modified was one of the strongest predictors of defect introduction probability. Commit count alone confounds experience with productivity.

**Code review participation** provides complementary information. Rigby and Bird (2013) showed that developer code review patterns predict expertise better than raw commit counts.

**Project breadth and depth** — the number of distinct projects contributed to and the depth of involvement in each — provide a richer multi-dimensional view. A developer contributing superficially to many projects differs from one contributing deeply to few; both patterns are captured in the 26-feature representation of the Perez et al. dataset.

**Complexity of changed code** was used by Palomba et al. (2019) to show that experienced developers change more complex code on average.

### 2.11.3 Classification of Developer Experience Level

The specific task of classifying developer experience into discrete categories has received limited attention. The closest prior work is Yadav et al. (2019), who classified developer expertise for bug triage using activity metrics similar to those in the Perez et al. dataset, achieving approximately 80% accuracy with Random Forest. This is substantially below the 98.74% achieved by EESQA-DELMOA in Study 3, though the comparison is indirect because the datasets and class definitions differ.

### 2.11.4 Metaheuristic Optimisation for Feature Selection

The BAHB algorithm for feature selection is part of a broader class of bio-inspired optimisation methods. Relevant comparators include:

**Genetic Algorithms** (Holland, 1975): Selection, crossover, and mutation operators. Effective for combinatorial problems but computationally expensive.

**Particle Swarm Optimisation** (Kennedy and Eberhart, 1995): Effective for continuous optimisation; requires discretisation for feature selection.

**Grey Wolf Optimiser** (Mirjalili et al., 2014): Applied to feature selection for defect prediction (Basiri et al., 2020) with strong results.

**Butterfly Optimisation Algorithm** (Arora and Singh, 2019): The basis for AMBOA. The AMBOA modifications — inertia weight adaptation and linearly decaying position weight — address BOA's tendency to converge prematurely to local optima, a weakness observed in preliminary experiments before adopting AMBOA for Study 3.

---

## 2.12 Challenges in Existing Approaches

A review of the literature across the three study areas reveals five recurring challenges that existing methods have not adequately addressed. These define the design requirements for the proposed studies.

**Challenge 1: Semantic shallowness in readability assessment.** The majority of automated code readability systems rely on surface-level features. Posnett et al. (2011) showed that identifier-related features explain more variance than all structural features combined — yet the field continued developing structural metrics. The challenge of building feature sets that capture semantic content — the meaning of names, their contextual appropriateness, their cognitive familiarity — has not been fully met by any prior system. The ten-parameter feature set in Study 1 directly addresses this.

**Challenge 2: Single-architecture fragility in snippet classification.** Deep learning models for code readability have been applied one architecture at a time: an LSTM, or a GCN, or a transformer. Each architecture has characteristic blind spots — LSTMs struggle with very long sequences, GCNs depend on graph construction quality, transformers require large pre-training data. No published system for code readability prediction has combined architecturally diverse classifiers in an ensemble designed to compensate for these individual weaknesses. The ECRVR-MVEL ensemble addresses this.

**Challenge 3: Opacity of predictions.** Most published deep learning systems for code quality prediction provide accuracy figures without explaining why a particular prediction was made. Without explanations, systems cannot be trusted in practice, cannot be debugged when they fail, and cannot provide actionable guidance to developers. The integration of SHAP (Study 1) and LIME (Study 2) addresses this challenge.

**Challenge 4: Scalability and execution time in developer classification.** Neural network classifiers applied to the developer experience problem (CNN and AlexNet variants) achieve reasonable accuracy but require 14–17 seconds. For a system deployed in a project management tool that must classify hundreds of profiles in response to a team restructuring request, this is unacceptable. The SSNN in Study 3, tuned by AMBOA, achieves the same task in 8.27 seconds.

**Challenge 5: Fragmented multi-level assessment.** The three levels of program comprehension (identifier, snippet, developer) have been studied by different communities using different methods, datasets, and explainability tools. No framework has assessed all three levels together, let alone used a shared explainability methodology that would allow cross-level findings to be compared. This thesis is designed as an integrated response to this challenge.

---

## 2.13 Notable Applications and Case Studies

The techniques used in this thesis have each been applied to related problems, providing empirical evidence of their effectiveness.

**CodeBERT in software engineering.** CodeBERT has been used for code search (Feng et al., 2020), code summarisation (Zhang et al., 2020), and vulnerability detection (Zhou et al., 2019). In each case, bimodal pre-training provides representations that outperform models trained on code alone. This pattern strongly motivates its use in identifier readability assessment.

**Attention mechanisms for code quality.** Guo et al. (2021), working on code vulnerability detection, showed that attention weights highlight specific code patterns that trigger the vulnerability classification — providing precedent for using self-attention to contribute to explainability in Study 1.

**Ensemble learning for defect prediction.** Hall et al. (2012) confirmed in a systematic review that ensemble methods outperform single classifiers in defect prediction across diverse datasets. Ni et al. (2020) showed that a stacked ensemble of XGBoost, LightGBM, and Random Forest outperformed all individual models on the PROMISE defect dataset. These findings support the hypothesis that an ensemble of GCN, DBN, and Bi-TCN will outperform any individual classifier for snippet readability prediction.

**XAI in defect prediction.** Ni et al. (2022) applied SHAP to defect prediction and found that process metrics were more predictive than product metrics — a finding that contradicts practitioner intuitions. This illustrates the key value of XAI: it surfaces non-obvious findings with direct practical implications. The same mechanism is at work in Studies 1 and 2, where SHAP and LIME reveal that MC and NC are more important than structural metrics.

**Metaheuristic optimisation in software engineering.** Bio-inspired algorithms have been applied to test suite optimisation (Harman et al., 2012) and software project scheduling (Xiao et al., 2015). Their application to developer experience classification in Study 3 extends this tradition to a new task.

**Naturalize: Learning naming conventions.** Allamanis et al. (2014) introduced the Naturalize tool, which learns project-specific naming conventions from a codebase and suggests names more consistent with those conventions. Naturalize is complementary to IRAF-XADL: IRAF-XADL assesses identifier quality against linguistically grounded absolute criteria; Naturalize assesses quality against project-specific relative criteria. Integrating both approaches is a natural future extension.

---

## 2.14 Justification for Selected Models

This section explains why each specific model and algorithm was chosen over available alternatives.

### 2.14.1 Selection of CodeBERT as the Embedding Layer

The embedding layer in Studies 1 and 2 could have been implemented using word2vec, code2vec, RoBERTa, GraphCodeBERT, or UniXcoder. CodeBERT was selected for four reasons:

**Bimodal pre-training.** CodeBERT is trained on (natural language, code) pairs, encoding the relationship between what a name says and how it is used. For identifier readability — fundamentally a natural-language judgement applied in a programming context — this bimodal representation is more appropriate than a code-only model.

**Task alignment.** CodeBERT's pre-training on CodeSearchNet includes Python and C++, the two languages used in this thesis. Models trained on natural language alone do not capture programming-language structure.

**Computational cost.** GraphCodeBERT and UniXcoder achieve higher performance on some benchmarks but require substantially more memory and computation. For the classification tasks in this thesis, the additional cost is not justified by the marginal accuracy gain.

**Community adoption.** CodeBERT has been validated across multiple software engineering tasks, providing confidence that its representations are robust and well-understood.

### 2.14.2 Selection of Self-Attention BiLSTM in Study 1

Alternative architectures considered include plain BiLSTM (without attention), full transformer encoder, and CNN. A plain BiLSTM compresses the entire input into a single context vector, potentially losing information about which specific tokens are most relevant. Self-attention addresses this by computing a weighted combination of all hidden states, selectively attending to the most informative parts — important for compound identifiers such as `calculateDiscountedTotalForLoyalCustomer`, where readability judgement depends on specific sub-tokens.

A full transformer encoder was not selected because identifier sequences are short (typically 1–5 sub-tokens after splitting) and the recurrent structure is well-suited to sequential identifier token patterns. The SA-BiLSTM combination provides directional context from the recurrent model and selective attention from the mechanism without the large parameter count of a full transformer. AdamW was selected over SGD and standard Adam because its decoupled weight decay improves generalisation on small to medium-sized datasets.

### 2.14.3 Selection of GCN, DBN, and Bi-TCN Ensemble in Study 2

The ensemble was designed by deliberately selecting three classifiers with different inductive biases.

**GCN** was selected for its ability to model structural relationships in code — dependencies between variables, the hierarchical structure of expressions, relationships between function calls. Sequential models cannot capture these structural properties directly. GCN operating on the dependency graph provides a representation complementary to sequence-based models.

**DBN** was selected for its ability to learn hierarchical probabilistic representations. Unlike discriminative classifiers, the DBN's generative pre-training means it models the distribution of input features, not just the boundary between classes. This provides a different error pattern from GCN and Bi-TCN, contributing to ensemble diversity. Wang et al. (2016) demonstrated the DBN's effectiveness on code quality tasks.

**Bi-TCN** was selected for its ability to model long-range sequential dependencies efficiently. Compared to BiLSTMs, Bi-TCNs use dilated convolutions that capture dependencies spanning hundreds of tokens without the sequential bottleneck of recurrent processing. At the snippet level, where inputs are longer than at the identifier level, this efficiency is practically significant.

**Nadam** was selected for the ensemble training because Nesterov momentum improves convergence stability when training three classifiers jointly with a shared voting layer.

### 2.14.4 Selection of SSNN with BAHB and AMBOA in Study 3

The Simplified Spiking Neural Network was selected rather than a conventional deep neural network, Random Forest, or CNN for two reasons: novelty and efficiency. No prior published work classifies developer experience using an SNN. Beyond novelty, the SNN's energy efficiency translates to lower execution time, directly demonstrated in Chapter 5.

**BAHB for feature selection** was chosen over PCA, LASSO, and genetic algorithms because it is a metaheuristic wrapper method that evaluates subsets by their actual predictive performance, not by statistical proxy measures. For a 26-feature tabular dataset with potentially non-linear feature interactions, a wrapper method is more likely to find the genuinely useful subset. BAHB's trap-avoidance behaviour helps it escape local optima in the feature selection landscape.

**AMBOA for hyperparameter tuning** was selected over grid search, random search, and Bayesian optimisation because its migration-based global-to-local search strategy adapts its exploration-exploitation balance over training iterations, avoiding premature convergence. For a small dataset (703 instances) where optimal hyperparameters are sensitive to the specific data distribution, this adaptive strategy outperforms fixed-schedule alternatives.

---

## 2.15 Existing Works and Limitations

Table 2.1 consolidates the most directly relevant prior works, identifying their methods, key results, and the specific limitation that the corresponding thesis study addresses.

**Table 2.1: Summary of related works and identified limitations**

| Authors | Year | Study Area | Method | Key Result | Limitation Addressed |
|---|---|---|---|---|---|
| Buse & Weimer | 2010 | Snippet readability | Logistic regression, surface features | ~66% accuracy | Ignores identifier semantics; no XAI |
| Scalabrino et al. | 2018 | Snippet readability | Extended features + ML | ~70% accuracy | Low inter-rater reliability; no XAI |
| Hofmeister et al. | 2017 | Identifier comprehension | Controlled experiment | 19% speed gain with full words | No automated classifier |
| Lawrie et al. | 2007 | Identifier comprehension | Controlled experiment | 19% accuracy gain | No automated classifier |
| Butler et al. | 2010 | Naming flaws | Mining study, 12 OSS projects | Defect correlation | Rule-based; no deep learning |
| Allamanis et al. | 2016 | Identifier suggestion | Neural name model | State of art for suggestion | Suggestion not assessment; no XAI |
| Posnett et al. | 2011 | Readability metrics | Feature importance | Identifiers dominate variance | Does not build a classifier |
| Feng et al. | 2020 | CodeBERT | Transformer pre-training | SOTA on 6 SE tasks | Not applied to readability |
| Mi et al. | 2018/2025 | Snippet readability | GNN + LIME | ~87%–90% accuracy | No ensemble; no CodeBERT; single classifier |
| Wang et al. | 2016 | Defect prediction | DBN | Improved accuracy | Not applied to readability; no XAI |
| Yadav et al. | 2019 | Developer experience | RF classifier | ~80% accuracy | No feature optimisation; high execution time; no SNN |
| Perez et al. | 2023 | Developer experience | Dataset release | Benchmark dataset | No classification model provided |
| Ni et al. | 2022 | Defect prediction | SHAP | Feature attribution | SHAP not applied to readability |

---

## 2.16 Identified Research Gap and Thesis Contribution

The literature review establishes four specific research gaps:

**Gap 1 (addressed by Study 1 — Chapter 3):** No published system combines language-specific AST-based identifier extraction, a ten-dimensional linguistically and cognitively grounded readability feature set, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, and SHAP-based post-hoc explanations for identifier-level readability assessment across Python and C++. The closest prior work uses at most six features and does not integrate deep contextual embeddings or explainability.

**Gap 2 (addressed by Study 2 — Chapter 4):** No published system applies a weighted majority voting ensemble of three structurally diverse deep classifiers (GCN, DBN, Bi-TCN) with LIME explanations to code snippet readability prediction. The closest prior work (Mi et al., 2025) uses a single GNN without CodeBERT and without ensemble diversity, achieving approximately 90% accuracy compared to ECRVR-MVEL's 98.15%.

**Gap 3 (addressed by Study 3 — Chapter 5):** No published system applies a Simplified Spiking Neural Network with bio-inspired feature selection (BAHB) and metaheuristic hyperparameter optimisation (AMBOA) to developer experience classification. The Perez et al. (2023) dataset, the most comprehensive publicly available dataset for this task, has not been used with deep learning classification beyond the baselines in the data paper itself.

**Gap 4 (addressed by Chapter 6):** No published work has compared SHAP and LIME findings across two different levels of code readability analysis (identifier and snippet) to determine whether explainability findings from one level generalise to another. The convergence of SHAP and LIME attributions found in this thesis is a novel cross-level XAI finding with implications both for software engineering practice and for the XAI research community.

These four gaps directly motivate and define the scope of Studies 1, 2, 3, and the cross-study analysis.

---

## 2.17 Chapter Summary

This chapter reviewed eleven areas of related work spanning the theoretical and empirical foundations of program comprehension, code readability measurement, identifier naming quality, machine learning and deep learning for code analysis, transformer-based code models, ensemble methods, spiking neural networks, explainable AI, and developer experience assessment. It analysed the challenges that existing methods have not adequately addressed, presented notable applications of the selected techniques in related domains, justified each major model and algorithm choice over available alternatives, summarised prior works and their limitations, and identified the four research gaps that the three studies in this thesis address.

The four gaps — in identifier readability assessment, snippet readability ensemble learning, developer experience classification, and cross-level XAI analysis — are specific, well-evidenced, and directly addressed by the research presented in Chapters 3, 4, 5, and 6 respectively. Chapter 3 presents the first study, IRAF-XADL, in full detail.

---

*End of Chapter 2*
