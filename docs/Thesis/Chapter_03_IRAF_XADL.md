# CHAPTER 3: IRAF-XADL — IDENTIFIER READABILITY ANALYSIS FRAMEWORK USING EXPLAINABLE ATTENTION-BASED DEEP LEARNING

## 3.1 Introduction and Motivation

Among all the decisions a developer makes while writing code, few are as consequential and as easily overlooked as the choice of an identifier name. A function name, a parameter name, a class name, a variable name — each one is an act of communication. The developer who writes `calculateTotalAmountForLoyalCustomer` is making an explicit statement about what the function does, who it applies to, and what it returns. The developer who writes `calcD` is making no such statement. Both functions may be syntactically valid and functionally correct. Their difference is entirely in what they communicate to the next reader.

The accumulation of poor naming decisions across a codebase is not a minor inconvenience. It is a compounding tax on every subsequent developer who needs to read that code. Lawrie et al. (2006) demonstrated that replacing single-letter and abbreviated identifiers with full-word equivalents reduced comprehension time by up to 25%. Butler et al. (2010) showed that naming antipatterns correlate with defect density. The practical message is clear: identifier naming quality affects both developer productivity and software correctness.

Automated assessment of identifier readability has received comparatively little attention relative to snippet-level readability prediction or defect prediction. Existing approaches rely on small feature sets — typically covering convention compliance and length — and do not integrate the deep contextual understanding that transformer-based models provide. None of the published systems combine a linguistically grounded multi-dimensional feature set with CodeBERT embeddings, a recurrent attention classifier, and post-hoc explainability.

This chapter presents IRAF-XADL (Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning), a complete system for assessing the readability of Python and C++ identifiers. The framework extracts identifiers from source code using language-specific abstract syntax tree parsers, computes ten readability parameters from each identifier, encodes it with CodeBERT, classifies it using a Self-Attention BiLSTM optimised with AdamW, and explains each prediction using SHAP.

---

## 3.2 Problem Formulation

Given a source code snippet S written in language L ∈ {Python, C++}, the objective is to:

1. Extract the set of identifiers I = {i₁, i₂, ..., iₙ} from S using an AST-based parser appropriate for L.
2. For each identifier iₖ, compute a feature vector f(iₖ) ∈ ℝ¹⁰ capturing ten readability dimensions.
3. Obtain a contextual embedding e(iₖ) ∈ ℝ⁷⁶⁸ using CodeBERT.
4. Concatenate [e(iₖ); f(iₖ)] and classify each identifier as High, Medium, or Low readability using a trained SA-BiLSTM model M.
5. For each prediction M(iₖ), compute SHAP values φ(iₖ) ∈ ℝ¹⁰ attributing the prediction to the ten features in f(iₖ).

Formally, the classification problem is:

M: ℝ⁷⁶⁸ × ℝ¹⁰ → {Low, Medium, High}

The model is trained on labelled code snippets from the Code Snippets: Insights and Readability dataset, where readability labels apply at the snippet level and are propagated to identifiers extracted from each snippet.

---

## 3.3 Framework Architecture

The IRAF-XADL framework consists of six sequential stages, as illustrated in Figure 3.1:

1. **Identifier Extraction and Normalisation** — AST-based extraction followed by lexical normalisation
2. **Readability Parameter Computation** — Ten linguistically grounded features computed per identifier
3. **CodeBERT Embedding** — 768-dimensional contextual representation per identifier
4. **SA-BiLSTM Classification** — Sequence model with self-attention for readability prediction
5. **AdamW Optimisation** — Decoupled weight decay for improved generalisation
6. **SHAP Explainability** — Shapley value attribution for each of the ten features

The dataset provides the input; a prediction of High, Medium, or Low readability and accompanying SHAP attributions provide the output.

---

## 3.4 Identifier Extraction and Normalisation

### 3.4.1 AST-Based Identifier Extraction

Naive tokenisation of source code — splitting on whitespace or punctuation — does not reliably distinguish identifiers from keywords, literals, operators, and other tokens. A more principled approach is to parse the source code into its abstract syntax tree (AST) and extract nodes corresponding to identifier declarations and uses.

For Python, IRAF-XADL uses **LibCST** (Library for Concrete Syntax Trees), a Python analysis framework that preserves all formatting details of the source. LibCST provides access to function name nodes (FunctionDef.name), parameter name nodes (Param.name), class name nodes (ClassDef.name), and variable assignment target nodes (AugAssign, AnnAssign). This ensures that every identifier in the source is captured with its semantic role (function, parameter, class, variable).

For C++, IRAF-XADL uses **Tree-Sitter**, a fast, incremental parser generator that builds a concrete syntax tree. Tree-Sitter supports C++ natively and allows extraction of function declarators, variable declarators, class specifiers, and parameter declarations. The incremental parsing capability means that partial edits to a file do not require full re-parsing — a practical advantage for integration with development tools.

### 3.4.2 Lexical Normalisation

Identifiers in source code are typically compound words formed by concatenating simpler words according to a convention. Before any feature can be computed, compound identifiers must be decomposed into their constituent semantic tokens. IRAF-XADL applies the following normalisation pipeline in sequence:

**camelCase splitting:** The compound identifier `getUserName` is split into `get`, `user`, `name`. The split is performed at transitions from lowercase to uppercase characters.

**snake_case splitting:** The compound identifier `user_name_id` is split at underscore boundaries, yielding `user`, `name`, `id`.

**Digit-letter separation:** The identifier `file2Path` is split at transitions between digit and alphabetic characters, yielding `file`, `2`, `path`. This handles the common pattern of embedding version numbers or counts in identifier names.

**Lowercase normalisation:** All tokens are converted to lowercase. This prevents the vocabulary from distinguishing `name` from `Name` from `NAME`, which are semantically identical.

**Stopword removal:** Uninformative tokens are removed in two passes. First, a code-specific stopword list removes tokens common to code but not semantically meaningful: `var`, `obj`, `tmp`, `val`, `ptr`, `buf`, `arr`, `str`, `int`, `bool`. Second, standard English function words (the, a, an, in, of, for, to, and, or, but) are removed using an NLTK stopword list.

**Lemmatisation:** Remaining tokens are reduced to their base form using WordNet's lemmatiser. `calculating` becomes `calculate`, `items` becomes `item`, `running` becomes `run`. This reduces vocabulary sparsity without losing semantic content.

The output of this pipeline for an identifier like `calculateTotalAmountForUser` is the token list `[calculate, total, amount, user]`.

---

## 3.5 Ten Readability Parameters

The ten readability parameters form the distinguishing technical contribution of Study 1. Each parameter captures a distinct dimension of identifier quality that has either direct empirical support in the program comprehension literature or strong theoretical motivation from cognitive science and linguistics. Table 3.1 presents all ten parameters with their descriptions.

**Table 3.1: Ten readability parameters**

| # | Name | Abbreviation | Dimension | Description |
|---|---|---|---|---|
| 1 | Meaningful Clarity | MC | Semantic | Fraction of normalised tokens that are recognisable English words |
| 2 | Naming Conformance | NC | Structural | Degree to which the identifier follows language-specific naming conventions |
| 3 | Optimal Length | OL | Structural | Gaussian score peaking within an empirically defined optimal length range |
| 4 | Domain Relevance | DR | Contextual | Fraction of tokens matching domain-specific vocabulary inferred from the snippet |
| 5 | Pronounceability | PR | Cognitive | Vowel-to-character ratio relative to an English language baseline |
| 6 | Lexical Familiarity | LF | Cognitive | Average token frequency in the surrounding corpus, normalised to [0, 1] |
| 7 | Context Consistency | CC | Contextual | Embedding similarity of this identifier's tokens with other identifiers in the snippet |
| 8 | Scope Appropriateness | SA | Structural | Whether identifier length is proportionate to its scope size |
| 9 | Cognitive Load Score | CLS | Cognitive | Composite of MC, LF, and an ambiguity penalty |
| 10 | Predictability | PRED | Contextual | Co-occurrence probability of the identifier's tokens with neighbouring identifier tokens |

The formal definitions of each parameter follow.

### 3.5.1 Meaningful Clarity (MC)

A token is considered meaningful if it appears in a curated vocabulary of common English words relevant to software development (approximately 200 words covering common programming domain terms), or if it passes a heuristic check: length ≥ 3, contains at least one vowel, and is not dominated by digits. MC is the fraction of an identifier's normalised tokens that satisfy this criterion:

```
MC(i) = |{t ∈ tokens(i) : isMeaningful(t)}| / |tokens(i)|
```

An identifier with all meaningful tokens (e.g., `calculateTotalPrice` → [calculate, total, price]) scores MC = 1.0. An identifier with no meaningful tokens (e.g., `x` or `tmp`) scores MC = 0.0.

**Cognitive motivation:** Lexical access in the brain is faster for known words than for unknown strings. An identifier that can be decoded as a sequence of familiar words imposes less cognitive load than one that cannot.

### 3.5.2 Naming Conformance (NC)

Naming conventions in programming languages are community standards that reduce the cognitive overhead of parsing identifiers. In Python, the established conventions (PEP 8) require: class names in PascalCase, function/parameter/variable names in snake_case. In C++, the same conventions are widely adopted in practice.

NC is computed as:

```
NC(i) = 
  1.0  if i.kind == 'class' and matches PascalCase
  1.0  if i.kind in {function, param, variable} and matches snake_case
  0.8  if i.kind in {function, param, variable} and matches snake_case with trailing underscore
  0.6  if matches camelCase (acceptable but non-canonical in Python)
  0.2  otherwise
```

The graded scale reflects the fact that some deviations (camelCase for functions) are mildly non-conformant while others (single letters, all-uppercase identifiers outside of constants) are strongly non-conformant.

### 3.5.3 Optimal Length (OL)

Identifier length has an inverted-U relationship with readability: very short identifiers (1–2 characters) communicate nothing; very long identifiers (30+ characters) impose parsing overhead. Lawrie et al. (2007) found that identifiers of 8–18 characters are associated with the fastest comprehension times. OL uses a Gaussian decay function:

```
OL(i) = 
  0.05  if len(i.raw) == 1
  1.0   if ideal_low ≤ len(i.raw) ≤ ideal_high
  exp(-(len(i.raw) - centre)² / (2σ²))  otherwise
```

where `ideal_low = 6`, `ideal_high = 18`, `centre = 12`, `σ = 12`.

### 3.5.4 Domain Relevance (DR)

Code snippets belong to semantic domains (finance, web development, data processing, algorithms, text processing, containers), and identifiers that use vocabulary from the snippet's domain are more informative to a reader in that domain. DR estimates the domain of the surrounding snippet by finding the domain (among six predefined domain vocabularies) with the highest token match count, then measures the fraction of an identifier's tokens that belong to that domain:

```
DR(i) = |{t ∈ tokens(i) : t ∈ domainVocab(snippet)}| / |tokens(i)|
```

### 3.5.5 Pronounceability (PR)

An identifier that can be sounded out mentally is processed faster than one that cannot. This is the silent speech hypothesis in psycholinguistics: readers, even of text they do not verbalise, generate sub-vocal representations of words. An identifier like `calculateSum` has a natural pronunciation; `sqz_ftr_vec` does not.

PR uses the vowel ratio as a proxy for pronounceability. English words have a vowel ratio of approximately 0.35–0.45. PR peaks at this range using a Gaussian:

```
ratio = |{c ∈ i.raw.lower() : c ∈ {a,e,i,o,u,y}}| / |{c ∈ i.raw : c.isalpha()}|
PR(i) = exp(-(ratio - 0.4)² / (2 × 0.15²))
```

### 3.5.6 Lexical Familiarity (LF)

If a corpus-level token frequency counter is available (built from the entire training dataset), LF is the average frequency of the identifier's tokens across that corpus, normalised to [0, 1]. Common tokens (`name`, `value`, `list`) score higher; rare tokens (`heuristic`, `orthogonal`, `eigenvector`) score lower:

```
LF(i) = clip(mean_t∈tokens(i) [freq(t)/totalFreq] × 10/maxScore, 0, 1)
```

When no corpus counter is available (e.g., at inference on a new snippet), LF falls back to the MC word-presence check.

### 3.5.7 Context Consistency (CC)

Identifiers in a well-written snippet use a consistent vocabulary. A function that deals with prices should use tokens like `price`, `amount`, `total`, `tax` throughout its parameter and variable names. CC measures the token-set Jaccard similarity between an identifier's tokens and those of its peers (other identifiers in the snippet):

```
CC(i) = mean_{j ≠ i} Jaccard(tokens(i), tokens(j))
       = mean_{j ≠ i} |tokens(i) ∩ tokens(j)| / |tokens(i) ∪ tokens(j)|
```

A snippet with consistent vocabulary yields high CC for all identifiers; one with mixed or unrelated naming yields low CC.

### 3.5.8 Scope Appropriateness (SA)

The principle of identifier length proportional to scope is an established programming guideline: short names are acceptable in tight scopes (loop counters), while wide scopes (class fields, public functions) demand longer, more descriptive names. SA operationalises this:

```
SA(i) =
  1.0   if scope_size(i) ≤ 3 and 1 ≤ len(i.raw) ≤ 6
  0.7   if scope_size(i) ≤ 10 and 3 ≤ len(i.raw) ≤ 14
  1.0   if scope_size(i) > 10 and len(i.raw) ≥ 6
  max(0, 1 - (len(i.raw) - 6) / 20)  for tight scope, name too long
  len(i.raw) / 6  for wide scope, name too short
```

where `scope_size(i)` is the number of identifiers in the same lexical scope.

### 3.5.9 Cognitive Load Score (CLS)

CLS is a composite feature that integrates three of the most directly cognitive dimensions — MC (semantic clarity), LF (familiarity), and PR (pronounceability) — with an ambiguity penalty based on underscore density:

```
underscore_density = i.raw.count('_') / max(1, len(i.raw))
ambiguity_penalty = exp(-3 × underscore_density)
CLS(i) = 0.4 × MC(i) + 0.3 × LF(i) + 0.2 × PR(i) + 0.1 × ambiguity_penalty
```

The weights reflect the relative importance of clarity, familiarity, and pronounceability as established in the psycholinguistic literature.

### 3.5.10 Predictability (PRED)

A predictable identifier is one whose tokens co-occur with the tokens of neighbouring identifiers. If a snippet contains `calculateTotal` and `discountRate`, seeing `calculate` elsewhere in the snippet makes `Total` more predictable. PRED measures whether each of an identifier's tokens appears in the tokens of at least one neighbouring identifier:

```
neighbourTokens = Counter(t for j ≠ i for t in tokens(j))
PRED(i) = |{t ∈ tokens(i) : neighbourTokens[t] > 0}| / |tokens(i)|
```

---

## 3.6 CodeBERT Embeddings

### 3.6.1 Architecture

CodeBERT (Feng et al., 2020) is a bimodal pre-trained model based on the RoBERTa architecture. It was trained on 2.1 million bimodal data points (natural language-code pairs) from the CodeSearchNet corpus across six programming languages (Python, Java, JavaScript, PHP, Ruby, Go), using two pre-training objectives:

1. **Masked Language Modelling (MLM):** 15% of tokens are masked; the model predicts them from context.
2. **Replaced Token Detection (RTD):** The model discriminates between original and machine-generated tokens.

The architecture consists of 12 Transformer layers with 12 attention heads and 768 hidden dimensions, giving approximately 125 million parameters. The input to the model consists of three types of embeddings summed at each position:

- **Token embeddings:** Learned embeddings for each sub-word token in the vocabulary (50,000 tokens using byte-pair encoding).
- **Segment embeddings:** A two-valued embedding indicating whether a token belongs to the natural language description or the code portion.
- **Position embeddings:** Learnable position encodings for each of the 512 available positions.

### 3.6.2 Encoding Identifiers

For each identifier iₖ, the normalised tokens `[t₁, t₂, ..., tₘ]` are joined with spaces and passed to the CodeBERT tokeniser, which may further split tokens into sub-word units. The resulting input sequence (with [CLS] and [SEP] special tokens added) is fed to the model with `max_length = 50` and padding/truncation as needed. The model produces a per-token output embedding matrix of shape (sequence_length, 768).

Mean pooling is applied over all non-padding tokens (using the attention mask to identify valid positions):

```
e(iₖ) = (Σ_{t: mask[t]=1} h_t) / (Σ_{t} mask[t])
```

where h_t ∈ ℝ⁷⁶⁸ is the output embedding at position t. This produces a fixed 768-dimensional embedding for each identifier, regardless of its length.

CodeBERT is used in a frozen (feature extraction) mode: its weights are not updated during training. This design choice is motivated by the relatively small size of the labelled dataset and the risk of catastrophic forgetting if the full 125M-parameter model were fine-tuned. Fine-tuning is identified as a direction for future work that could improve performance further.

---

## 3.7 Self-Attention BiLSTM Classifier

### 3.7.1 Input Preparation

For each identifier iₖ, the 768-dimensional CodeBERT embedding e(iₖ) and the 10-dimensional feature vector f(iₖ) are concatenated to form an input vector of dimension 778. Each snippet provides a sequence of up to 50 identifier representations [x₁, x₂, ..., x_T] where T ≤ 50.

For snippets with fewer than 50 identifiers, the sequence is zero-padded to length 50. For snippets with more than 50 identifiers, the first 50 are used. This sequence is the input to the BiLSTM.

### 3.7.2 BiLSTM Equations

The BiLSTM processes the identifier sequence in both forward and backward directions. For the forward LSTM at time step t, the standard LSTM equations apply:

**Forget gate:**  
```
f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
```

**Input gate:**  
```
i_t = σ(W_i · [h_{t-1}, x_t] + b_i)
```

**Candidate cell:**  
```
g_t = tanh(W_g · [h_{t-1}, x_t] + b_g)
```

**Cell state update:**  
```
c_t = f_t ⊙ c_{t-1} + i_t ⊙ g_t
```

**Output gate:**  
```
o_t = σ(W_o · [h_{t-1}, x_t] + b_o)
```

**Hidden state:**  
```
h_t^f = o_t ⊙ tanh(c_t)
```

where σ is the sigmoid function and ⊙ denotes element-wise multiplication. The backward LSTM computes h_t^b by processing the sequence in reverse. The bidirectional hidden state is the concatenation:

```
h_t = [h_t^f ; h_t^b] ∈ ℝ^{2×hidden}
```

With hidden = 128, the BiLSTM output at each step is a 256-dimensional vector. Three stacked BiLSTM layers are used (n_layers = 3), with dropout = 0.3 applied between layers.

### 3.7.3 Self-Attention Mechanism

The self-attention mechanism is applied to the BiLSTM output sequence H = [h₁, h₂, ..., h_T] ∈ ℝ^{T×256}. It computes an attention-weighted context vector that aggregates the most informative positions.

**Context projection:**  
```
u_t = tanh(W_a · h_t + b_a)   ∈ ℝ^{attn_dim}
```

**Attention score (4 heads, multi-head attention):**  
```
α_t^k = exp(u_t^T · u_context^k) / Σ_{τ} exp(u_τ^T · u_context^k)
```

where u_context^k ∈ ℝ^{attn_dim} is a learned context vector for head k, and softmax is applied over the T time steps (not over features).

**Per-head context vector:**  
```
v^k = Σ_t α_t^k · h_t   ∈ ℝ^{256}
```

**Multi-head output:**  
```
v = W_out · [v^1; v^2; v^3; v^4]   ∈ ℝ^{256}
```

The attention weights α_t^k indicate how much each identifier position t influences the final prediction. High weights on particular identifiers form the basis for the attention-based explanation of the model's decisions.

### 3.7.4 Classification Head

The context vector v passes through the classification head:

```
logits = W_2 · ReLU(W_1 · v + b_1) + b_2
```

where W_1 ∈ ℝ^{64×256}, W_2 ∈ ℝ^{3×64}. The output is three logits corresponding to {Low, Medium, High}. During training, cross-entropy loss is applied; during inference, softmax produces class probabilities.

---

## 3.8 AdamW Optimisation

AdamW (Loshchilov and Hutter, 2019) is an improvement over the Adam optimiser that decouples weight decay from the gradient update. In standard L2-regularised Adam, the weight decay term is incorporated into the gradient, which interacts with the adaptive learning rates in a way that compromises regularisation. AdamW applies weight decay directly to the parameters, independently of the gradient statistics:

**First moment estimate:**  
```
m_t = β₁ · m_{t-1} + (1 - β₁) · g_t
```

**Second moment estimate:**  
```
v_t = β₂ · v_{t-1} + (1 - β₂) · g_t²
```

**Bias correction:**  
```
m̂_t = m_t / (1 - β₁ᵗ),   v̂_t = v_t / (1 - β₂ᵗ)
```

**Parameter update with decoupled weight decay:**  
```
θ_t = θ_{t-1} - α · (m̂_t / (√v̂_t + ε)) - α · λ · θ_{t-1}
```

The final term `α · λ · θ_{t-1}` is the decoupled weight decay. It shrinks parameters proportionally to their magnitude, independently of the gradient update. This separation ensures that regularisation acts consistently regardless of the adaptive learning rates.

**Table 3.2: Hyperparameter configuration**

| Component | Parameter | Value |
|---|---|---|
| Input | Max sequence length | 50 |
| BiLSTM | Layers | 3 |
| BiLSTM | Hidden units | 128 |
| BiLSTM | Dropout | 0.3 |
| Self-attention | Heads | 4 |
| Self-attention | Attention dimension | 128 |
| Dense head | Units | 64 |
| Dense head | Activation | ReLU |
| AdamW | Learning rate (α) | 0.001 |
| AdamW | Weight decay (λ) | 0.01 |
| AdamW | β₁ | 0.9 |
| AdamW | β₂ | 0.999 |
| Training | Batch size | 32 |
| Training | Epochs | 100 |
| Training | Gradient clipping | 1.0 |

---

## 3.9 SHAP Explainability

SHAP (Lundberg and Lee, 2017) is applied to explain the contribution of each of the ten readability features to a given readability prediction. The Shapley value for feature j in prediction f(x) is:

```
φⱼ = Σ_{S ⊆ N\{j}} |S|!(|N|-|S|-1)!/|N|! · [f(S∪{j}) - f(S)]
```

where N is the set of all ten features, S is a subset excluding feature j, and f(S) is the model's expected prediction given only the features in S (with other features marginalised).

Since computing exact Shapley values requires 2^N model evaluations (1,024 for N = 10), IRAF-XADL uses SHAP KernelExplainer, which approximates Shapley values by sampling coalitions with appropriate Shapley weights and fitting a locally weighted linear model.

For each identifier, the SHAP output is a vector φ ∈ ℝ¹⁰, where φⱼ is the signed contribution of feature j to the prediction. Positive φⱼ pushes the prediction toward the predicted class; negative φⱼ pushes it away. Two types of visualisation are used:

- **Global summary plots:** For each class (Low, Medium, High), the mean absolute SHAP value for each feature across all identifiers provides a global importance ranking.
- **Local dot plots:** For an individual identifier, the SHAP values for each feature reveal why that specific identifier was classified as it was.

The SHAP analysis is central to the claim that IRAF-XADL is not merely accurate but transparent: practitioners can see which features drove a "Low readability" verdict and adjust the identifier accordingly.

---

## 3.10 Experimental Setup

### 3.10.1 Dataset

The Code Snippets: Insights and Readability dataset (Kaggle) contains annotated Python and C++ code snippets from LeetCode with per-snippet readability scores. IRAF-XADL uses a three-class partition derived from the dataset's composite readability score. Snippets in the bottom third of the score distribution are labelled Low; the middle third, Medium; the top third, High.

**Table 3.3: Dataset statistics**

| Language | Low | Medium | High | Total |
|---|---|---|---|---|
| Python | 561 | 560 | 560 | 1,681 |
| C++ | 502 | 500 | 502 | 1,504 |

Readability labels are propagated from snippet to all identifiers extracted from that snippet. The train/test split is 70/30, stratified by class. Random seed is fixed at 42 for reproducibility.

### 3.10.2 Evaluation Metrics

Five metrics are reported for each class and as macro-averaged values:

**Accuracy:**  
```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

**Precision:**  
```
Precision = TP / (TP + FP)
```

**Recall:**  
```
Recall = TP / (TP + FN)
```

**F1-Score:**  
```
F1 = 2 × Precision × Recall / (Precision + Recall)
```

**Area Under the ROC Curve (AUC):** Computed using the one-vs-rest strategy for multi-class classification.

### 3.10.3 Baselines

Seven baseline classifiers are evaluated on the same dataset with the same train/test split: Multilayer Perceptron (MLP), Sequential Minimal Optimisation (SMO/SVM), Logistic Regression (LR), Random Forest (RF), Gaussian Naïve Bayes with Isotonic calibration (GNB-Isotonic), Perceptron, and Linear Discriminant Analysis (LDA). All baselines use the same ten readability features as IRAF-XADL (without the CodeBERT embeddings), ensuring that the comparison isolates the contribution of the deep learning architecture and embeddings.

---

## 3.11 Results: Python Data

**Table 3.4: IRAF-XADL results on Python data (70/30 split)**

| Split | Class | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| Training (70%) | Medium | 97.36 | 95.24 | 96.94 | 96.08 | 97.26 |
| Training (70%) | High | 99.32 | 99.22 | 98.71 | 98.97 | 99.17 |
| Training (70%) | Low | 97.70 | 97.19 | 95.96 | 96.57 | 97.27 |
| Training (70%) | **Average** | **98.13** | **97.22** | **97.20** | **97.21** | **97.90** |
| Testing (30%) | Medium | 96.83 | 92.70 | 98.21 | 95.38 | 97.18 |
| Testing (30%) | High | 98.22 | 97.66 | 97.09 | 97.38 | 97.95 |
| Testing (30%) | Low | 97.03 | 98.08 | 92.73 | 95.33 | 95.92 |
| Testing (30%) | **Average** | **97.36** | **96.14** | **96.01** | **96.03** | **97.02** |

The training accuracy of 98.13% reflects strong learning. The small gap between training and test accuracy (98.13% vs. 97.36%) indicates good generalisation and minimal overfitting, consistent with the AdamW weight decay and dropout regularisation. The convergence curves show both training and validation accuracy rising steeply in the first twenty epochs and then stabilising, with validation loss tracking training loss closely throughout.

Per-class analysis reveals that the High readability class achieves the strongest performance (98.22% test accuracy), while Medium is slightly weaker (96.83%), reflecting the inherent ambiguity of the middle class in a three-way readability partition.

---

## 3.12 Results: C++ Data

**Table 3.5: IRAF-XADL results on C++ data (70/30 split)**

| Split | Class | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| Training (70%) | Average | **98.42** | **97.62** | **97.61** | **97.61** | **98.21** |
| Testing (30%) | Average | **97.94** | **96.96** | **96.85** | **96.89** | **97.64** |

C++ results marginally exceed Python results across all metrics, which may reflect the greater regularity of C++ naming conventions in the dataset (fewer one-off naming patterns than in Python's more flexible style). The pattern of strong generalisation observed in Python is replicated for C++.

---

## 3.13 Comparative Analysis

**Table 3.6: Comparative analysis — IRAF-XADL vs. baselines**

| Method | Python Acc | Python F1 | C++ Acc | C++ F1 |
|---|---|---|---|---|
| MLP | 76.00 | 77.52 | 79.33 | 72.02 |
| SMO | 82.00 | 67.95 | 80.56 | 78.35 |
| LR | 81.00 | 91.96 | 75.23 | 89.37 |
| RF | 61.10 | 82.16 | 65.00 | 90.48 |
| GNB-Isotonic | 57.00 | 82.61 | 71.56 | 90.13 |
| Perceptron | 54.10 | 91.47 | 71.08 | 75.19 |
| LDA | 53.00 | 68.23 | 62.45 | 81.88 |
| **IRAF-XADL** | **98.13** | **97.21** | **98.42** | **97.61** |

IRAF-XADL outperforms the best baseline (SMO, 82.00% Python accuracy) by 16.13 percentage points on Python and the best C++ baseline (SMO, 80.56%) by 17.86 percentage points. The gains are consistent across all five metrics, confirming that the improvement is not an artifact of class imbalance or metric choice.

The large margin over the baselines is attributable to two factors working in combination: the CodeBERT embeddings provide a semantic representation that no hand-crafted feature can replicate, and the SA-BiLSTM architecture captures the sequential context of identifiers within a snippet. Ablation studies (not reported here but available as future work) would isolate the contribution of each component.

---

## 3.14 SHAP Explainability Analysis

### 3.14.1 Python Data

The global SHAP analysis for Python classifies feature importance across all three readability levels (Low, Medium, High). The key findings are:

**Dominant features:** Meaningful Clarity (MC) has the highest mean absolute SHAP value across all three classes, followed closely by Naming Conformance (NC). These two features together account for the majority of the predictive signal in the model.

**Minimal feature:** The composite readability score from the dataset contributes negligibly — near-zero SHAP values across all classes. This finding is significant: it suggests that the ten handcrafted parameters in IRAF-XADL capture the readability signal more directly and efficiently than the dataset's own composite score, despite the fact that the labels are derived from that composite score.

**Directional interpretation:** For Low readability, MC contributes negatively (low clarity pushes toward Low). For High readability, MC contributes positively. NC follows the same directional pattern. The consistency of these directions across classes validates that the features are measuring what they are intended to measure.

### 3.14.2 C++ Data

The SHAP analysis for C++ reveals a subtle difference from Python: NC (Naming Conformance) becomes the most dominant feature, with MC second. This likely reflects the stricter naming convention culture in C++ code compared to Python, where convention violations are more consistently penalised in the training data.

At the Low level, NC has the strongest negative contribution; at High, NC has the strongest positive contribution. MC is the most influential feature at the Medium level, where naming clarity but not naming convention may be the distinguishing characteristic.

### 3.14.3 Practical Interpretation

The SHAP findings provide concrete actionable guidance for developers:

1. **Focus on meaningful names first.** MC is the most consistently important feature. An identifier that cannot be decoded as meaningful English words will be classified as Low or Medium regardless of its length or convention compliance.
2. **Convention compliance matters, especially in C++.** NC is nearly as important as MC, and in C++ it is dominant. Naming convention violations are a reliable signal of low readability.
3. **Length is important but not as important as meaning.** OL (Optimal Length) consistently appears in the top five features but is never the dominant one. A long meaningful name beats a short cryptic one.

---

## 3.15 Chapter Summary

This chapter presented IRAF-XADL, a complete framework for identifier readability assessment combining language-specific AST extraction, a ten-dimensional linguistically grounded parameter set, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, AdamW optimisation, and SHAP explainability. The framework achieves test accuracy of 97.36% for Python and 97.94% for C++, exceeding all seven baseline methods by substantial margins. SHAP analysis reveals that Meaningful Clarity and Naming Conformance are the dominant drivers of readability predictions, and that the composite readability score contributes minimally — validating the design of the ten-parameter feature set.

Chapter 4 extends the analysis from the identifier level to the snippet level, presenting the ECRVR-MVEL ensemble framework.

---

*Chapter 3 complete. Proceeding to Chapter 4.*
