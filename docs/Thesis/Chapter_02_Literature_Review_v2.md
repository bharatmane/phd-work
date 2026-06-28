# CHAPTER 2: LITERATURE REVIEW

## 2.1 Introduction

A literature review serves two purposes that pull in opposite directions. It should be broad enough to situate the research within the wider conversation of the field, but selective enough to remain useful — a catalogue of every paper ever written on code quality would occupy the entire thesis without illuminating anything. The review in this chapter navigates that tension by organising the literature thematically, identifying the most important lines of work in each area, and being explicit about why each line of work is relevant to the three studies that follow.

Twelve thematic areas are covered. The first three — program comprehension theory, code readability measurement, and identifier quality — establish the conceptual foundation. The next four — machine learning for code analysis, transformer models, ensemble methods, and recurrent architectures — cover the technical approaches that the proposed systems build on or depart from. Two further sections cover spiking neural networks and explainable AI, which are less established in the software engineering context and therefore require more foundational explanation. The final two sections cover developer experience assessment and a synthesis of research gaps. Each section closes with a brief statement of what the existing literature provides and what it leaves open.

---

## 2.2 Program Comprehension: From Cognitive Theory to Engineering Practice

The study of how developers understand programs has a longer history than most software engineering researchers realise. It began not in computer science but in cognitive psychology, when researchers in the 1970s started asking whether the cognitive processes involved in understanding natural language text also apply to programming languages.

Shneiderman and Mayer (1979) were among the first to frame this question systematically. They proposed that programmer knowledge has two components: syntactic knowledge (the formal rules of the language — how to parse a for loop, what a semicolon means) and semantic knowledge (understanding of what the code represents — what the loop is computing, why this particular range is chosen). Their model predicted that programmers with better semantic knowledge would comprehend unfamiliar programs faster and with fewer errors. This prediction was confirmed in a series of controlled experiments that showed experienced programmers could chunk code into meaningful units — recognising common patterns (a linear search, a bubble sort step) — while novices processed code token by token.

Brooks (1983) introduced the concept of hypothetical reasoning in program comprehension: programmers do not read code passively but generate hypotheses about its purpose based on clues — the function name, the types of its parameters, the first few lines of its body — and then selectively read the remaining code to confirm or refute those hypotheses. This insight has a direct implication for identifier naming: the identifier is often the first and most important clue. A well-named identifier confirms the hypothesis quickly; a poorly named one forces more reading.

Von Mayrhauser and Vans (1995) synthesised the prior two decades of work into an integrated metamodel that distinguished three comprehension strategies:

1. **Top-down:** Starting from high-level understanding of the program's purpose and decomposing it into sub-components. Experienced developers who know the domain use this strategy when reading familiar code patterns.
2. **Bottom-up:** Starting from low-level code details and building up a model of what the code does. This strategy dominates when the code is unfamiliar or poorly structured.
3. **Opportunistic:** Switching between strategies based on local cues. A developer who encounters an unfamiliar function might switch from top-down to bottom-up for that section.

The model predicts that poorly named identifiers force bottom-up comprehension even when a top-down strategy would be more efficient — the developer cannot form a reliable hypothesis from a cryptic name and must fall back to reading the implementation. This prediction aligns with the empirical findings of Lawrie et al. (2007) discussed below.

More recently, Siegmund et al. (2014) used functional magnetic resonance imaging (fMRI) to study which brain regions activate during program comprehension. They found that comprehension activates areas associated with language processing (Broca's area, Wernicke's area) rather than areas associated with mathematical reasoning (parietal cortex). This neurobiological finding strongly suggests that code comprehension is processed as a form of language comprehension — meaning that the linguistic quality of identifiers is not just a stylistic preference but a determinant of the neural cost of comprehension.

Xia et al. (2017) conducted a large-scale field study with professional developers, tracking their actual reading behaviour over weeks using a custom IDE plugin. Their findings are practically significant: developers spend on average 58% of their coding time reading rather than writing code. Of that reading time, approximately 35% is spent specifically on understanding identifier names in context — trying to infer what a variable or function represents from its name and usage. No other single activity consumed as large a fraction of reading time. This finding provides empirical grounding for the thesis's primary claim: identifier quality is the most important single determinant of comprehension cost.

### 2.2.1 The Vocabulary Problem

One consistent theme in the program comprehension literature is what Starke et al. (2009) called the vocabulary problem: the names that appear in source code and the concepts they represent often have a many-to-many relationship. The same concept may be named differently in different codebases (a list of users might be `userList`, `users`, `members`, `accounts`, or `people`). The same name may refer to different concepts in different codebases (`data` is semantically empty; `temp` could be temperature or temporary). This ambiguity increases comprehension cost because the developer cannot rely on name recognition — they must infer context.

IRAF-XADL's feature set addresses the vocabulary problem through several of its ten parameters. Meaningful Clarity (MC) directly penalises names whose tokens are not recognisable words. Lexical Familiarity (LF) penalises tokens that are rare in the corpus. Predictability (PRED) rewards names whose tokens co-occur with tokens of neighbouring identifiers — a form of contextual coherence that reduces vocabulary ambiguity.

---

## 2.3 Code Readability: Measurement Approaches and Their Limitations

The transition from cognitive theory to practical measurement is difficult. Readability — like usability or elegance — is easy to recognise and hard to quantify. The research community has tried four broad approaches: human annotation studies, metric-based scoring, machine learning from annotations, and deep learning from code representations. Each approach improved on its predecessors but left problems for its successors.

### 2.3.1 Human Annotation Studies

The foundational work is Buse and Weimer (2008, 2010), who recruited 120 volunteer participants to rate the readability of 100 Java code snippets on a five-point Likert scale. Their analysis revealed that humans agree more than chance would predict (mean inter-rater correlation ≈ 0.65) but substantially less than perfect. The features that correlated most strongly with human ratings in their linear regression model were: the ratio of operators to operands, the number of blank lines, identifier length, the presence of comments, and the depth of nesting. Notably, all of these are surface-level structural features, not semantic features of the identifiers.

The Buse-Weimer dataset became the de facto benchmark for a decade of readability prediction research. This is both its value and its limitation: by anchoring research to a single annotation methodology and a single set of features, it may have slowed the field's recognition that semantic identifier quality matters more than structural surface features.

Scalabrino et al. (2016) conducted a larger annotation study (121 participants, 444 snippets) and found a troubling pattern: several features considered important in the Buse-Weimer model showed low inter-rater agreement when examined carefully. Their analysis suggested that the apparent inter-rater correlation in Buse and Weimer (2010) partly reflected shared biases (participants were mostly students with similar backgrounds) rather than genuine shared perception of readability. This methodological critique motivated a revision of the feature set that placed greater weight on documentation quality, cognitive complexity, and identifier-level semantics.

Dorn (2012) conducted an annotation study using professional software developers rather than students and found different feature rankings: identifier naming quality emerged as more important to professionals than to students, while visual alignment and whitespace — easy to judge at a glance — were more important to student annotators. This finding is consistent with the hypothesis that experienced developers attend to meaning (identifiers) while novices attend to form (visual presentation).

### 2.3.2 Metric-Based Approaches

Posnett, Hindle, and Devanbu (2011) made a finding that directly motivates this thesis: in a large analysis of the Buse-Weimer dataset, identifier-related features explained substantially more variance in readability ratings than all structural features combined. Specifically, the average length of identifiers and the number of multi-word identifiers (identifiers with more than one recognisable word component) together explained more variance than line length, nesting depth, and operator density combined.

This finding received less attention than it deserved at the time. The field continued to develop structural metrics (cyclomatic complexity, Halstead measures, Maintainability Index) and composite scores, largely ignoring the semantic content of identifier names. The dataset used in this thesis (Code Snippets: Insights and Readability) includes identifier count, average identifier length, and several structural metrics in its composite readability score — partially addressing the gap, but still not capturing naming quality at the level of individual identifier semantic content.

### 2.3.3 Machine Learning Approaches

The transition to machine learning for readability prediction began with Buse and Weimer's own work, which used logistic regression. Subsequent work applied support vector machines (Scalabrino et al., 2016), random forests (various), and gradient boosting (Daka et al., 2015). These models achieved incrementally better accuracy on the Buse-Weimer benchmark but faced a ceiling: the features were hand-engineered, and hand-engineered features can only capture what the engineer thought to measure.

The ceiling was partially broken by deep learning approaches that could learn features directly from code representations. White et al. (2015) applied a recurrent neural network to token sequences and showed that sequence models could capture readability patterns that feature-engineered models missed. Later work (Hongo et al., 2018; Lin et al., 2020) showed that applying convolutional neural networks to code as if it were a character-level or token-level sequence could further improve accuracy.

### 2.3.4 Limitations of Existing Approaches

Four limitations are common to most prior work and motivate the design choices in this thesis:

1. **Snippet-level labels for identifier-level predictions.** Prior work applies snippet-level labels uniformly to all identifiers in the snippet, treating a poorly named identifier within an otherwise readable snippet as readable. IRAF-XADL inherits this limitation but partially compensates through the ten-parameter feature set, which assigns individual quality scores to each identifier regardless of the snippet-level label.

2. **No contextual embeddings.** Prior work uses either bag-of-words token representations or handcrafted features. CodeBERT's contextual embeddings represent each identifier in the context of the surrounding code, capturing dependencies that no prior feature could represent.

3. **Binary classification.** Most prior work predicts "readable" vs. "unreadable" rather than a three-class ordinal scale. A three-class prediction (Low/Medium/High) is more informative for practitioners, who need to know not just whether a snippet is problematic but how problematic.

4. **No explainability.** With very few exceptions (Mi et al., 2025), prior work does not explain its predictions. A classifier that flags a snippet as Low readability without identifying which identifiers or features drove that verdict is much less actionable than one that does.

---

## 2.4 Identifier Quality: Naming as a First-Class Software Engineering Concern

The observation that identifier names matter for program comprehension predates software engineering research. Kernighan and Plauger's 1978 book *The Elements of Programming Style* devoted an entire chapter to naming, arguing that names should be descriptive, pronounceable, and appropriate for their scope. The specific recommendations — avoid abbreviations, use meaningful words, prefer nouns for variables and verbs for functions — remain current in modern style guides (PEP 8 for Python, the Google Style Guide for C++).

Formal empirical study of identifier naming began in the 2000s. Lawrie, Morrell, Field, and Binkley (2006) ran the first controlled experiment: they showed the same Java code to two groups of developers, one seeing single-letter identifier names and one seeing full descriptive names, and measured comprehension accuracy. Developers with full-word names answered comprehension questions correctly 19% more often than those with single-letter names — a practically significant effect.

In a follow-up experiment, Lawrie et al. (2007) compared four naming styles: full words, abbreviations, single letters, and no identifiers at all (variables replaced with placeholders). Full words produced the fastest comprehension time and highest accuracy. The effect was not merely about name length — an abbreviation like `proc` is shorter than `processDocument` but harder to comprehend because it requires inference.

Binkley et al. (2009) introduced the specific comparison between camelCase and snake_case naming. Contrary to common belief, both conventions were equally readable when applied consistently. The key finding was consistency: code that mixed conventions was substantially harder to read than code that used either convention throughout. This motivated the Naming Conformance (NC) feature in Study 1, which rewards identifiers that follow their language's established convention without penalising either convention specifically.

Butler, Wermelinger, Yu, and Sharp (2010) analysed twelve large open-source Java projects and found that functions with naming antipatterns had significantly higher defect density than functions without. The strongest antipattern predictors of defects were: names that use single letters for parameters, names that mix case conventions inconsistently, and names that use generic words (`data`, `info`, `manager`) without further specificity. These findings validate the semantic focus of the IRAF-XADL feature set: the features that matter for defect prediction are the same as those that matter for comprehension.

Arnaoudova et al. (2010, 2016) studied a different class of naming problem: linguistic antipatterns, where the name and the code are semantically inconsistent. A method named `getX` that modifies X rather than returning it is a linguistic antipattern — the name lies about the behaviour. Their study of eight open-source projects found that linguistic antipatterns were common (appearing in 11% of methods they studied) and that developers consistently found them harder to understand than conventionally named methods. This work motivates the Domain Relevance (DR) and Predictability (PRED) features in IRAF-XADL, which capture the degree to which an identifier's tokens are consistent with its surrounding context.

Feitelson (2022) conducted the most comprehensive naming study to date, gathering name preferences from 334 developers for 47 naming tasks. He found that naming preferences are more consistent than previously believed — there is often a clear "right" name that most developers prefer — but that individual variation is non-trivial. The finding that most developers agree on good names supports the use of corpus-based features (LF, DR) that reflect collective naming norms.

### 2.4.1 Automated Identifier Renaming

A related line of work concerns automated suggestion of better identifier names. Allamanis et al. (2016) trained a neural network on large Java corpora to predict function names given the function body — a form of code summarisation. Their system could suggest alternative names for poorly named functions, with human raters preferring the suggested names 40% of the time. Alon et al. (2019) extended this with code2vec, which represents code as paths in abstract syntax trees and achieves state-of-the-art on method naming.

These renaming systems differ from IRAF-XADL in an important way: they suggest new names but do not assess the readability of existing ones. Assessment and suggestion are complementary: IRAF-XADL identifies which identifiers need attention; a renaming system then proposes alternatives. Combining the two is a natural extension of this work.

---

## 2.5 Machine Learning for Code Quality Prediction

### 2.5.1 Traditional Machine Learning

The earliest automated code quality predictors applied rule-based systems and simple statistical models to hand-crafted features. Halstead (1977) proposed a set of software complexity metrics based on the counts of distinct operators and operands. McCabe (1976) proposed cyclomatic complexity, measuring the number of independent paths through a function's control flow graph. These metrics were widely adopted as code quality proxies throughout the 1980s and 1990s.

The limitations of rule-based metrics were well understood by 2000: they captured structural properties of code but not the semantic content of identifiers, comments, or high-level design choices. Machine learning offered a path beyond these limitations by learning what features predict human-labelled quality outcomes from data rather than from theory.

Support Vector Machines (SVMs) achieved state-of-the-art on several code quality tasks through the 2010s, including defect prediction (Hall et al., 2012), code smell detection (Palomba et al., 2013), and code readability prediction (Scalabrino et al., 2016). Random forests became competitive alternatives, offering robustness to irrelevant features and the ability to handle mixed feature types. Both SVMs and random forests share a fundamental limitation for code tasks: they operate on fixed-length feature vectors, while code is variable-length and structured.

### 2.5.2 Deep Learning for Sequential Code

The application of recurrent neural networks to code sequences addressed the variable-length limitation. White et al. (2015) trained LSTM networks on code token sequences for code clone detection, showing that the sequential model could recognise that two functionally identical code fragments expressed with different variable names were semantically similar — something that token-level bag-of-words models could not do.

BiLSTMs became the natural extension: code has dependencies in both directions (the type of a variable is established before it is used; the return statement at the end of a function depends on variables assigned at the beginning). Iyer et al. (2016) applied BiLSTMs to automatic code description generation, using the bidirectional model to capture context from both the beginning and end of a function. The Self-Attention mechanism added on top of BiLSTMs in Study 1 of this thesis provides a further step: rather than compressing the entire sequence into a fixed-size hidden state, attention weights each position's contribution to the final representation, allowing the model to focus on the most informative identifiers.

### 2.5.3 Graph Neural Networks for Code Structure

Abstract syntax trees naturally represent the hierarchical structure of code: a function contains statements, statements contain expressions, expressions contain identifiers. Representing code as a graph rather than a sequence allows models to capture structural relationships that sequential models miss.

Zhang et al. (2019) introduced Automatically Classified and Sliced Programs (ACSP), which used graph neural networks on AST paths for code classification. Devign (Zhou et al., 2019) applied GNNs to vulnerability detection, representing functions as compound graphs that include data flow edges, call edges, and AST edges. Both works showed that graph representations provided complementary information to sequence representations.

In Study 2 of this thesis, the GCN component of the ECRVR-MVEL ensemble captures structural properties of code snippets. The GCN processes dependency graphs rather than full ASTs, focusing specifically on the relationships between identifiers — which variables are used where, which functions call which other functions. This structural sensitivity is complementary to the temporal sensitivity of the Bi-TCN and the hierarchical probabilistic representation of the DBN.

### 2.5.4 Defect Prediction and Technical Debt

Defect prediction — the task of identifying which source files or functions are likely to contain bugs — is the most heavily studied application of machine learning to software quality. The relevant techniques include: metric-based models (Zimmermann et al., 2007), change history models (D'Ambros et al., 2012), and deep learning models (Wang et al., 2016).

The deep learning approach of Wang et al. (2016) is directly relevant to Study 3 of this thesis: they used a Deep Belief Network (DBN) to learn a hierarchical representation of code metrics and found that the DBN significantly outperformed all metric-based baselines on defect prediction benchmarks. The DBN is one of the three component classifiers in ECRVR-MVEL (Chapter 5). Its inclusion in the ensemble is motivated by this established track record on code quality tasks.

Technical debt — the accumulated cost of code quality shortcuts taken for short-term convenience — provides a broader economic context for the work in this thesis. Tsoukalas et al. (2021) applied SHAP to explain the predictions of technical debt estimation models, one of the first applications of post-hoc XAI to software quality estimation. Their finding that code smells and structural complexity metrics were the dominant SHAP features for technical debt prediction provides an interesting contrast with the findings of Study 1, where identifier naming quality (MC, NC) dominates. This contrast reflects the different aspects of quality being measured: technical debt correlates with structural complexity; identifier readability correlates with naming quality.

---

## 2.6 Transformer Models in Software Engineering

### 2.6.1 The Attention Mechanism and BERT

The Transformer architecture (Vaswani et al., 2017) introduced a mechanism — multi-head scaled dot-product attention — that allowed models to relate any two positions in a sequence directly, regardless of their distance. Unlike recurrent networks, which must propagate information through every intermediate step, attention computes a weighted sum of all positions simultaneously:

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

where Q, K, V are query, key, and value matrices derived from the input, and d_k is the key dimension. The scaling by √d_k prevents the dot products from entering regions of the softmax where gradients are very small.

BERT (Devlin et al., 2019) applied bidirectional Transformers to pre-training, learning representations from unlabelled text using two objectives: masked language modelling (predicting randomly masked tokens from context) and next sentence prediction. The pre-trained BERT representations, when fine-tuned on downstream tasks with small labelled datasets, achieved state-of-the-art across eleven NLP benchmarks. The key insight is that large-scale pre-training on unlabelled data can produce representations that transfer to many tasks, reducing the labelled data requirement for each individual task.

### 2.6.2 CodeBERT: Pre-Training on Bimodal Data

Feng et al. (2020) introduced CodeBERT, extending BERT's pre-training to a bimodal corpus of (natural language, code) pairs from CodeSearchNet. The bimodal pre-training objective means CodeBERT learns to represent both the natural language description of a function and the function's code, and to relate them to each other. This is particularly relevant for identifier readability: identifiers are natural language fragments embedded in code, and CodeBERT is specifically designed to model the relationship between natural language semantics and code structure.

Two properties of CodeBERT make it appropriate for identifier readability assessment. First, its attention mechanism can relate the meaning of an identifier token to the surrounding code — a token like `user` in a function that processes login requests has different contextual meaning from a token like `user` in a numerical simulation, and CodeBERT captures this distinction. Second, its training on six programming languages (Python, Java, JavaScript, PHP, Ruby, Go) gives it broad coverage of programming conventions, including naming patterns.

A practical limitation of CodeBERT is its context window: the model accepts inputs of up to 512 tokens. For most individual identifiers (typically 1–8 tokens after normalisation), this is not a constraint. For full code snippets (in Study 2), snippets exceeding 512 tokens require truncation or window averaging. The sliding window approach used in ECRVR-MVEL (described in Chapter 5) addresses this limitation without losing information from long snippets.

### 2.6.3 Post-CodeBERT Models

Several subsequent models have improved on CodeBERT for specific tasks:

**GraphCodeBERT** (Guo et al., 2021) incorporates data flow graphs into pre-training, allowing the model to represent variable dependencies explicitly. For readability tasks where naming quality and control flow interact, GraphCodeBERT might offer marginal improvements. However, its substantially higher computational cost and the marginal gains reported on readability-adjacent tasks make CodeBERT the appropriate choice for this thesis.

**CodeT5** (Wang et al., 2021) is an encoder-decoder model pre-trained on code generation and summarisation tasks. Its encoder provides code representations; its decoder generates natural language summaries. For the classification tasks in this thesis, the encoder-only CodeBERT is more appropriate and computationally lighter.

**UniXcoder** (Guo et al., 2022) extends CodeBERT with cross-modal contrastive learning and unified encoder-decoder architecture. It achieves state-of-the-art on code search and code summarisation but has not been evaluated on code readability prediction. Comparing UniXcoder and CodeBERT on identifier and snippet readability classification is a natural future experiment.

---

## 2.7 Ensemble Methods: Theory and Practice

### 2.7.1 Theoretical Foundations

The theoretical justification for ensemble methods rests on the bias-variance decomposition of generalisation error. For a learning algorithm, the expected squared error on a new example decomposes as:

```
E[(y - ŷ)²] = Bias² + Variance + Irreducible Noise
```

Bias reflects the systematic error of the model class (a linear model has high bias for non-linear functions). Variance reflects the sensitivity to training data (a deep tree trained on a small dataset has high variance). Ensemble methods typically reduce variance without increasing bias: if B base classifiers each make uncorrelated errors with variance σ², the average of their predictions has variance σ²/B.

The critical word is "uncorrelated." If all base classifiers make the same errors on the same examples, averaging their predictions does nothing. Diversity — the property that base classifiers disagree on their errors — is the necessary condition for ensemble effectiveness (Krogh and Vedelsby, 1995).

### 2.7.2 Strategies for Achieving Diversity

Three main strategies achieve classifier diversity:

**Data diversity (bagging):** Training each classifier on a different bootstrap sample of the training data. Random forests use this strategy. The diversity comes from the different training sets.

**Classifier diversity:** Training different classifiers (different architectures, different inductive biases) on the same data. This is the strategy used in ECRVR-MVEL. GCN, DBN, and Bi-TCN have fundamentally different computational structures and therefore make different types of errors.

**Feature diversity:** Training each classifier on a different feature representation. This is related to classifier diversity when the different classifiers process different graph or sequence representations of the same code.

ECRVR-MVEL achieves diversity through the classifier strategy: the three base classifiers not only use different architectures but operate on structurally different representations — dependency graphs (GCN), probabilistic hidden representations (DBN), and temporal sequences (Bi-TCN). This is the most effective form of diversity for deep learning ensembles, as architectural differences produce more qualitatively different errors than random sampling differences.

### 2.7.3 Weighted Majority Voting vs. Stacking

Two main approaches combine the predictions of diverse classifiers:

**Weighted majority voting** assigns a scalar weight to each classifier's predicted probability distribution and computes a weighted average. Weights can be fixed (based on validation accuracy) or learned jointly with the classifiers. Weighted voting is simple, interpretable, and effective when classifier accuracies differ significantly.

**Stacking** (Wolpert, 1992) uses a meta-classifier to learn the best combination of base classifier predictions. The meta-classifier is trained on a held-out dataset using the base classifiers' predictions as features. Stacking is more flexible than voting but requires a separate validation set for meta-classifier training, which reduces the effective training set size. For datasets of the size used in this thesis (1,681 snippets), this reduction is a meaningful cost.

ECRVR-MVEL uses weighted majority voting rather than stacking, primarily to preserve the simplicity and interpretability of the combination mechanism and to avoid the training set reduction required by stacking. The weights are initialised from validation accuracy and fine-tuned during training.

---

## 2.8 Spiking Neural Networks: Biological Plausibility and Efficiency

### 2.8.1 The Three Generations of Neural Networks

Maass (1997) proposed a taxonomy of neural network models by generation. First-generation networks (perceptrons, McCulloch-Pitts neurons) used binary threshold activations. Second-generation networks (modern deep neural networks) use continuous-valued non-linear activations (sigmoid, ReLU, tanh). Third-generation networks — spiking neural networks — use discrete temporal spikes that more closely model the behaviour of biological neurons.

The distinction between the second and third generations is more than biological fidelity. Real neurons in the brain are active only a small fraction of the time — their average firing rate is approximately 1 Hz against a maximum rate of approximately 100 Hz. This sparse activity means the brain performs far fewer multiply-accumulate operations per second than a comparably sized conventional neural network. SNNs inherit this efficiency: a neuron that is inactive (membrane potential below threshold) contributes zero to the output at that time step, requiring no computation.

### 2.8.2 The Leaky Integrate-and-Fire Model

The Leaky Integrate-and-Fire (LIF) model is the most widely used SNN neuron model in computational neuroscience and machine learning applications. Its membrane potential dynamics are governed by a first-order differential equation:

```
τ_m × dU/dt = -U + R × I(t)
```

where τ_m is the membrane time constant, U is the membrane potential, R is the membrane resistance, and I(t) is the input current at time t. In the discrete-time formulation used in computational implementations:

```
U(t) = (1 - D/τ_m) × U(t-1) + Σ_i w_i × S_i(t)
```

where D is the discrete decay constant, w_i are synaptic weights, and S_i(t) ∈ {0,1} is the input spike from presynaptic neuron i at time t. When U(t) ≥ Θ (the threshold), the neuron fires (output = 1) and U resets to the resting potential.

The simplified version used in EESQA-DELMOA (Chapter 6) collapses the membrane resistance and time constant into a single decay parameter:

```
U(t) = U(t-1) + Σ_i w_i × S_i(t) - D
```

This formulation is computationally equivalent to the full LIF model for the classification task at hand while reducing the number of hyperparameters.

### 2.8.3 Training Spiking Neural Networks

The primary challenge in training SNNs is that the spiking activation function (a Heaviside step at threshold Θ) is non-differentiable at Θ and zero almost everywhere else, making standard backpropagation inapplicable. Three approaches address this:

1. **Rate coding with conventional backpropagation:** Converting continuous inputs to Bernoulli spike trains (input x → spike with probability x at each time step) and training the network on the spike rates using standard backpropagation. This is the approach used in Study 3.

2. **Surrogate gradient methods** (Neftci et al., 2019): Replacing the true gradient of the spiking function (zero everywhere except at threshold) with a smooth surrogate during the backward pass. The most common surrogate is a Gaussian or sigmoid function centred at the threshold.

3. **Converting pre-trained ANNs to SNNs:** Training a conventional neural network with identical architecture and converting its ReLU activations to spiking neurons using a threshold balancing method. This approach achieves near-lossless conversion for image classification tasks.

EESQA-DELMOA uses a combination of rate coding and surrogate gradients, as this combination has been shown to achieve the best accuracy-efficiency tradeoff for tabular data classification (Wu et al., 2019).

---

## 2.9 Explainable Artificial Intelligence in Software Engineering

### 2.9.1 The Interpretability Gap

The past decade has produced a fundamental tension in applied machine learning: the most accurate models are increasingly opaque, and the most interpretable models are increasingly inaccurate. A linear regression model is completely interpretable — its coefficients directly indicate feature importance — but its accuracy on complex, non-linear problems is limited. A deep neural network with billions of parameters can achieve human-level accuracy on many tasks but provides no natural account of why any particular prediction was made.

In most consumer applications, this opacity is tolerable. In applications where predictions affect human welfare — medical diagnosis, credit scoring, criminal risk assessment, or the code review and developer assignment decisions relevant to this thesis — opacity is genuinely problematic. A developer told that their code has "Low readability" without further explanation cannot improve it. A project manager told that a developer has "Junior experience" without seeing which features drove that classification cannot fairly challenge or act on the verdict.

Post-hoc explainability methods attempt to bridge this gap by approximating or attributing a complex model's predictions in terms that humans can understand. The two methods used in this thesis — SHAP and LIME — are the most widely adopted in the literature.

### 2.9.2 SHAP: Game-Theoretic Feature Attribution

SHAP (SHapley Additive exPlanations) was introduced by Lundberg and Lee (2017) as a unification of several existing feature attribution methods (LIME, DeepLIFT, integrated gradients, and others) under the framework of Shapley values from cooperative game theory.

In a coalition game, the Shapley value for player i represents the average marginal contribution of player i across all possible coalitions of the other players. Applied to machine learning, players are features, coalitions are subsets of features presented to the model, and the value function is the model's prediction:

```
φᵢ(f, x) = Σ_{S ⊆ N\{i}} [|S|!(|N| - |S| - 1)! / |N|!] × [f_x(S ∪ {i}) - f_x(S)]
```

where N is the set of all features, S is a subset excluding feature i, and f_x(S) is the model's expected prediction when only the features in S are observed.

Shapley values satisfy four axioms that make them uniquely fair attributions: efficiency (the sum of all Shapley values equals the prediction minus the baseline), symmetry (features with equal marginal contributions receive equal attributions), dummy (features that never change predictions receive zero attribution), and linearity (attributions for a linear combination of models are the linear combination of attributions).

SHAP has been applied to software quality tasks including defect prediction (Ni et al., 2022), code smell detection (Palomba et al., 2021), and technical debt estimation (Tsoukalas et al., 2021). In Study 1 of this thesis, it is applied to identifier readability classification — the first application of SHAP to this specific task. The key finding (MC and NC are the dominant features) is the basis for Contribution 5 of the thesis: the cross-study XAI validation.

### 2.9.3 LIME: Local Surrogate Models

LIME (Local Interpretable Model-Agnostic Explanations) takes a different approach to explainability. Rather than computing a global attribution based on all possible feature subsets, LIME explains a single prediction by locally approximating the complex model with an interpretable surrogate.

For a complex model f and an input x to be explained, LIME:

1. Samples a neighbourhood of perturbed inputs z around x.
2. Weights each perturbed input by its proximity to x: w(x, z) = exp(-d(x, z)² / σ²).
3. Fits a simple interpretable model g (typically linear regression) to minimize: L(f, g, π_x) = Σ_z π_x(z) × (f(z) - g(z))² + Ω(g).
4. Returns the coefficients of g as the feature importance scores for the explanation.

LIME's main advantage is flexibility: it is model-agnostic and can explain any classifier's predictions for any input type (tabular data, text, images, code). Its main limitation is instability: the perturbation sampling is stochastic, and explanations for the same input can differ between runs.

For code snippet readability classification in Study 2, LIME perturbs inputs by replacing or removing individual code tokens and observing how the ensemble's prediction changes. This produces token-level importance scores that identify specific code elements (function names, loop keywords, literal values) as readability drivers.

### 2.9.4 XAI in Practice: The Gap Between Theory and Use

Despite substantial research on explainability methods, their practical adoption by software engineers remains limited. Cito et al. (2022) surveyed 80 industrial software engineers about their use of XAI tools for code quality tasks and found that fewer than 20% had used any explainability method, and most of those who had found the explanations difficult to interpret without domain-specific customisation.

This finding motivates the specific design choices in Studies 1 and 2: SHAP is applied to the ten human-interpretable readability parameters rather than to the high-dimensional CodeBERT embedding (which would produce attribution over 768 dimensions with no direct meaning). LIME is applied to token-level perturbations of code snippets, producing explanations in terms that developers naturally think about when reading code. The goal is explanations that are actionable, not just technically correct.

---

## 2.10 Developer Experience and Software Quality

### 2.10.1 Experience as a Quality Predictor

The intuition that more experienced developers produce higher quality code is widely held and partially supported by empirical evidence. Sackman et al. (1968) conducted the earliest systematic study, finding a roughly 20:1 variation in programming performance between experienced and inexperienced programmers — a finding so dramatic that it dominated the field's thinking for decades.

More recent and methodologically careful studies have produced a more nuanced picture. Bergersen et al. (2011) ran a series of controlled programming experiments and found that self-reported years of experience correlated poorly with actual performance: developers who reported fifteen years of experience performed similarly to those with two years on many tasks. Domain-specific experience (familiarity with the particular language, framework, and problem type) predicted performance better than general years of experience.

Storey et al. (2019) proposed a theory of software developer job satisfaction and productivity that positioned experience as one of several interacting factors. Their model included factors such as autonomy, mastery, collaboration quality, and tool support. This broader model is important for interpreting the results of Study 3: the six experience categories in the Perez et al. dataset are proxies for a multi-dimensional construct, and the classifier's predictions should be interpreted accordingly.

### 2.10.2 Metrics for Developer Experience

Research on developer experience metrics has progressed from simple proxy measures (commit count, years of tenure) to multi-dimensional feature sets:

**Commit count and frequency** have been used as experience proxies by Mockus and Herbsleb (2002), who showed that developer experience (measured by the number of files previously modified) was one of the strongest predictors of defect introduction probability. The limitation is that raw commit count confounds experience with productivity — an experienced developer who commits rarely may appear less experienced than a junior developer who commits frequently.

**Code review participation** provides information about both experience (experienced developers are more often reviewers than reviewees) and collaboration patterns (experienced developers tend to review a wider range of code areas). Rigby and Bird (2013) showed that developer code review patterns predict expertise better than raw commit counts.

**Project breadth and depth** — the number of distinct projects contributed to (breadth) and the depth of involvement in each (measured by file count and commit count per project) — have been proposed as complementary measures. A developer who has contributed to many projects superficially is different from one who has contributed deeply to a few; both patterns are captured in the 26-feature representation of the Perez et al. dataset.

**Complexity of changed code** — the cyclomatic complexity and size of files modified by a developer — has been used by Palomba et al. (2019) to show that experienced developers change more complex code on average, as they are assigned to or choose to work on harder problems. This metric is included in the Perez et al. feature set.

### 2.10.3 Classification of Developer Experience Level

The specific task of classifying developer experience into discrete categories — as opposed to predicting a continuous measure or using experience as a covariate — has received limited attention. The closest prior work is Yadav et al. (2019), who classified developer expertise for bug triage by training classifiers on a set of activity metrics similar to those in the Perez et al. dataset. Their best result (Random Forest, ~80% accuracy) is substantially below the 98.74% achieved by EESQA-DELMOA in Study 3, but the comparison is indirect because the datasets and class definitions differ.

### 2.10.4 Metaheuristic Optimisation for Feature Selection

The Artificial Hummingbird Behaviour (BAHB) algorithm used for feature selection in Study 3 is part of a larger class of bio-inspired optimisation methods. The broader class includes:

**Genetic Algorithms** (Holland, 1975): Selection, crossover, and mutation operators applied to a population of candidate solutions. Effective for combinatorial problems but computationally expensive.

**Particle Swarm Optimisation** (Kennedy and Eberhart, 1995): Particles move through the search space guided by their own best position and the swarm's best position. Effective for continuous optimisation; requires discretisation for feature selection.

**Grey Wolf Optimiser** (Mirjalili et al., 2014): Mimics the leadership hierarchy of grey wolf packs. Has been applied to feature selection for software defect prediction (Basiri et al., 2020) with strong results.

**Butterfly Optimisation Algorithm** (Arora and Singh, 2019): The basis for AMBOA. BOA's local-global search balance has been shown to outperform PSO and GA on several benchmark optimisation problems.

The AMBOA modifications (inertia weight from PSO, linearly decaying position weight) address BOA's tendency to converge prematurely to local optima — a known weakness observed empirically in preliminary experiments before adopting AMBOA for Study 3.

---

## 2.11 Synthesis: Research Gaps Addressed by This Thesis

The review above identifies four specific gaps in the literature that the three studies in this thesis address:

**Gap 1 — Identifier-level readability with deep contextual embeddings and multi-dimensional features.** The identifier quality literature has established that naming quality matters (Lawrie et al., 2006–2013; Butler et al., 2010; Arnaoudova et al., 2016) and has developed small feature sets for assessing it. No prior work combines (a) language-specific AST extraction, (b) a ten-dimensional linguistically grounded feature set, (c) CodeBERT contextual embeddings, (d) a Self-Attention BiLSTM classifier, and (e) SHAP explainability into a single system. IRAF-XADL fills this gap.

**Gap 2 — Ensemble of structurally diverse classifiers for snippet readability with LIME explanation.** The snippet readability prediction literature has applied individual classifiers (SVMs, neural networks, GNNs) with increasing accuracy. No prior work combines a GCN, a DBN, and a Bi-TCN in a weighted majority vote with LIME-based local explanations. ECRVR-MVEL fills this gap.

**Gap 3 — Developer experience classification with SNN and metaheuristic optimisation.** The developer experience literature has used proxy metrics and conventional classifiers. No prior work applies a Simplified Spiking Neural Network with bio-inspired feature selection and metaheuristic hyperparameter tuning to this task. EESQA-DELMOA fills this gap.

**Gap 4 — Cross-method, cross-level XAI validation.** No prior work has compared SHAP and LIME findings across two levels of a program comprehension hierarchy (identifier and snippet), or interpreted the convergence of their findings as cross-validation of a feature set. The cross-study analysis in Chapter 7 fills this gap.

**Table 2.1: Summary of related work and research gaps**

| Authors | Year | Task | Best accuracy | Key limitation | Gap addressed |
|---|---|---|---|---|---|
| Buse & Weimer | 2010 | Snippet readability | ~66% | Surface features only | Gap 2 |
| Scalabrino et al. | 2018 | Snippet readability | ~70% | Low inter-rater reliability | Gap 2 |
| Lawrie et al. | 2007 | Identifier comprehension | Experimental | No automated classifier | Gap 1 |
| Butler et al. | 2010 | Naming antipatterns | Correlation study | Rule-based; no deep learning | Gap 1 |
| Allamanis et al. | 2016 | Identifier suggestion | Top-5 accuracy | Suggestion, not assessment | Gap 1 |
| Feng et al. | 2020 | CodeBERT pre-training | State of art (6 tasks) | Not applied to readability | Gaps 1, 2 |
| Mi et al. | 2025 | Snippet readability | ~90%+ | Single classifier; no CodeBERT | Gap 2 |
| Yadav et al. | 2019 | Developer experience | ~80% | Simple metrics; no SNN | Gap 3 |
| Perez et al. | 2023 | Developer experience | Dataset release | No classification model | Gap 3 |
| Ni et al. | 2022 | Defect prediction + SHAP | State of art | Not applied to readability | Gap 4 |

---

## 2.12 Chapter Summary

This chapter reviewed twelve areas of related work spanning cognitive theory of program comprehension, empirical measurement of code readability, identifier naming quality, machine learning and deep learning for code analysis, transformer-based code models, ensemble methods, spiking neural networks, explainable AI, and developer experience assessment. Four specific research gaps were identified that the three studies in this thesis address. The gap analysis establishes that all three proposed systems are genuine contributions to a literature that has not yet solved these specific problems in this specific combination.

Chapter 3 presents the research design and methodology that governs all three studies.
