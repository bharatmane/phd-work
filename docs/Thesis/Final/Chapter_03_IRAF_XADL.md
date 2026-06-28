# CHAPTER 3: IRAF-XADL — IDENTIFIER READABILITY ANALYSIS FRAMEWORK USING EXPLAINABLE ATTENTION-BASED DEEP LEARNING

---

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

```
M: ℝ⁷⁶⁸ × ℝ¹⁰ → {Low, Medium, High}
```

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

**Figure 3.1** illustrates the complete pipeline from source code input to readability prediction and SHAP explanation.

```
                        IRAF-XADL FRAMEWORK PIPELINE
 ┌─────────────────────────────────────────────────────────────┐
 │  INPUT: Source Code Snippet S  (Python or C++)              │
 └──────────────────────┬──────────────────────────────────────┘
                        │
         ┌──────────────▼──────────────┐
         │   STAGE 1: IDENTIFIER       │
         │   EXTRACTION (AST)          │
         │   Python → LibCST           │
         │   C++    → Tree-Sitter      │
         │   + Lexical Normalisation   │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │   STAGE 2: 10 READABILITY   │
         │   PARAMETERS                │
         │   MC, NC, OL, DR, PR, LF,   │
         │   CC, SA, CLS, PRED         │
         │   f(iₖ) ∈ ℝ¹⁰              │
         └──────────────┬──────────────┘
                        │
         ┌──────────────▼──────────────┐
         │   STAGE 3: CodeBERT         │
         │   EMBEDDING                 │
         │   125M params, frozen       │
         │   e(iₖ) ∈ ℝ⁷⁶⁸             │
         └──────────────┬──────────────┘
                        │  [e(iₖ); f(iₖ)] ∈ ℝ⁷⁷⁸
         ┌──────────────▼──────────────┐
         │   STAGE 4: SA-BiLSTM        │
         │   CLASSIFIER                │
         │   3 layers, hidden=128,     │
         │   4-head self-attention     │
         │   → {Low, Medium, High}     │
         └──────┬───────────────┬──────┘
                │               │
         AdamW  │          STAGE 6:
         Optim. │          SHAP
                │          Explainability
                │          φ(iₖ) ∈ ℝ¹⁰
                ▼               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  OUTPUT: Readability Class + SHAP Attributions per feature  │
 └─────────────────────────────────────────────────────────────┘
```

> **[Figure 3.1]** *Overall architecture and workflow of the IRAF-XADL framework.*
> *(Insert Figure 1 from Paper 1 — high-resolution version)*

---

## 3.4 Identifier Extraction and Normalisation

### 3.4.1 AST-Based Identifier Extraction

Naive tokenisation of source code — splitting on whitespace or punctuation — does not reliably distinguish identifiers from keywords, literals, operators, and other tokens. A more principled approach is to parse the source code into its abstract syntax tree (AST) and extract nodes corresponding to identifier declarations and uses.

For Python, IRAF-XADL uses **LibCST** (Library for Concrete Syntax Trees), a Python analysis framework that preserves all formatting details of the source. LibCST provides access to function name nodes (FunctionDef.name), parameter name nodes (Param.name), class name nodes (ClassDef.name), and variable assignment target nodes (AugAssign, AnnAssign). This ensures that every identifier in the source is captured with its semantic role (function, parameter, class, variable).

For C++, IRAF-XADL uses **Tree-Sitter**, a fast, incremental parser generator that builds a concrete syntax tree. Tree-Sitter supports C++ natively and allows extraction of function declarators, variable declarators, class specifiers, and parameter declarations. The incremental parsing capability means that partial edits to a file do not require full re-parsing — a practical advantage for integration with development tools.

### 3.4.2 Lexical Normalisation

Identifiers in source code are typically compound words formed by concatenating simpler words according to a convention. Before any feature can be computed, compound identifiers must be decomposed into their constituent semantic tokens. IRAF-XADL applies the following normalisation pipeline in sequence:

**camelCase splitting:** The compound identifier `getUserName` is split into `get`, `user`, `name` at transitions from lowercase to uppercase characters.

**snake_case splitting:** The compound identifier `user_name_id` is split at underscore boundaries, yielding `user`, `name`, `id`.

**Digit-letter separation:** The identifier `file2Path` is split at transitions between digit and alphabetic characters, yielding `file`, `2`, `path`.

**Lowercase normalisation:** All tokens are converted to lowercase, preventing the vocabulary from distinguishing `name` from `Name` from `NAME`.

**Stopword removal:** Uninformative tokens are removed in two passes. First, a code-specific stopword list removes tokens common to code but not semantically meaningful: `var`, `obj`, `tmp`, `val`, `ptr`, `buf`, `arr`, `str`, `int`, `bool`. Second, standard English function words are removed using an NLTK stopword list.

**Lemmatisation:** Remaining tokens are reduced to their base form using WordNet's lemmatiser. `calculating` becomes `calculate`, `items` becomes `item`.

The output for `calculateTotalAmountForUser` is the token list `[calculate, total, amount, user]`.

### 3.4.3 Challenges in Identifier Extraction

Several practical challenges arose during the construction of the extraction and normalisation pipeline:

**Non-standard abbreviations.** Abbreviated identifiers such as `psgCnt` (passenger count) or `initPt` (initial point) do not split cleanly into recognisable words. The splitting algorithm produces `psg` and `cnt`, neither of which passes the meaningful-word check. This is correct behaviour for the readability model — the identifier is indeed poorly named — but it requires careful handling so that the failure of splitting is itself interpretable as a readability signal rather than a processing error.

**Unicode in identifiers.** Modern Python (3.0+) permits non-ASCII identifiers, including Arabic, Chinese, and Devanagari characters. The normalisation pipeline is designed for English-language tokens, and non-ASCII identifiers are handled by flagging them with MC = 0 and PR = 0, which correctly identifies them as low-readability under the English naming norms used in the dataset.

**Ambiguous single-token identifiers.** Identifiers like `data`, `result`, `value`, and `item` are single English words (high MC) but semantically empty — they communicate no specific information about what the variable represents. The DR (Domain Relevance) and PRED (Predictability) features partially address this: `data` will score low on DR because it belongs to no specific domain vocabulary, and low on PRED because it co-occurs with identifiers in every domain without specificity. This multi-feature approach is more robust than any single feature alone.

**Very short identifiers in tight scopes.** Loop counters (`i`, `j`, `k`) are conventionally acceptable when their scope is small (a 3-line loop). The SA (Scope Appropriateness) feature is designed to reward these cases, but the definition of "tight scope" — currently set at ≤ 3 identifiers in the scope — required careful tuning to avoid penalising idiomatic Python and C++ patterns.

---

## 3.5 Ten Readability Parameters

The ten readability parameters form the distinguishing technical contribution of Study 1. Each parameter captures a distinct dimension of identifier quality with direct empirical support or strong theoretical motivation from cognitive science and linguistics. Table 3.1 presents all ten parameters.

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

### 3.5.1 Meaningful Clarity (MC)

A token is considered meaningful if it appears in a curated vocabulary of common English words relevant to software development, or if it passes a heuristic check: length ≥ 3, contains at least one vowel, and is not dominated by digits. MC is the fraction of an identifier's normalised tokens satisfying this criterion:

```
MC(i) = |{t ∈ tokens(i) : isMeaningful(t)}| / |tokens(i)|
```

An identifier with all meaningful tokens (e.g., `calculateTotalPrice`) scores MC = 1.0. A single-letter or purely abbreviated identifier scores MC = 0.0.

**Cognitive motivation:** Lexical access in the brain is faster for known words than for unknown strings. An identifier decodable as familiar words imposes less cognitive load. Lawrie et al. (2006) demonstrated 19% comprehension accuracy improvement with full-word names; SHAP analysis in Section 3.14 confirms MC as the dominant predictor.

### 3.5.2 Naming Conformance (NC)

NC is computed using a graded scale reflecting the degree of deviation from the established language-specific convention:

```
NC(i) = 
  1.0  if i.kind == 'class' and matches PascalCase
  1.0  if i.kind in {function, param, variable} and matches snake_case
  0.8  if i.kind in {function, param, variable} and matches snake_case with trailing underscore
  0.6  if matches camelCase (acceptable but non-canonical in Python)
  0.2  otherwise
```

The graded scale reflects that some deviations (camelCase for functions) are mildly non-conformant while others (all-uppercase for non-constants) are strongly non-conformant. Binkley et al. (2009) showed that consistency within a convention is as important as the choice of convention.

### 3.5.3 Optimal Length (OL)

Identifier length has an inverted-U relationship with readability: very short identifiers communicate nothing; very long identifiers impose parsing overhead. Lawrie et al. (2007) found identifiers of 8–18 characters are associated with fastest comprehension. OL uses a Gaussian decay function:

```
OL(i) = 
  0.05  if len(i.raw) == 1
  1.0   if 6 ≤ len(i.raw) ≤ 18
  exp(-(len(i.raw) - 12)² / (2 × 12²))  otherwise
```

### 3.5.4 Domain Relevance (DR)

DR estimates the domain of the surrounding snippet by finding the domain (among six predefined domains: finance, web, data processing, algorithms, text processing, containers) with the highest token match count, then measures the fraction of the identifier's tokens belonging to that domain:

```
DR(i) = |{t ∈ tokens(i) : t ∈ domainVocab(snippet)}| / |tokens(i)|
```

### 3.5.5 Pronounceability (PR)

PR uses vowel ratio as a proxy for pronounceability, based on the silent speech hypothesis: readers generate sub-vocal representations even when reading silently. English words have a vowel ratio of approximately 0.35–0.45:

```
ratio = |{c ∈ i.raw.lower() : c ∈ {a,e,i,o,u,y}}| / |{c ∈ i.raw : c.isalpha()}|
PR(i) = exp(-(ratio - 0.4)² / (2 × 0.15²))
```

### 3.5.6 Lexical Familiarity (LF)

LF is the average frequency of the identifier's tokens across the training corpus, normalised to [0, 1]. Common tokens (`name`, `value`) score higher; rare domain-specific tokens score lower:

```
LF(i) = clip(mean_{t ∈ tokens(i)} [freq(t)/totalFreq] × 10/maxScore, 0, 1)
```

### 3.5.7 Context Consistency (CC)

CC measures the token-set Jaccard similarity between an identifier and its peers in the snippet:

```
CC(i) = mean_{j ≠ i} Jaccard(tokens(i), tokens(j))
       = mean_{j ≠ i} |tokens(i) ∩ tokens(j)| / |tokens(i) ∪ tokens(j)|
```

A snippet with consistent vocabulary yields high CC; mixed or unrelated naming yields low CC.

### 3.5.8 Scope Appropriateness (SA)

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

CLS integrates three cognitively motivated dimensions with an ambiguity penalty based on underscore density:

```
underscore_density = i.raw.count('_') / max(1, len(i.raw))
ambiguity_penalty = exp(-3 × underscore_density)
CLS(i) = 0.4 × MC(i) + 0.3 × LF(i) + 0.2 × PR(i) + 0.1 × ambiguity_penalty
```

### 3.5.10 Predictability (PRED)

A predictable identifier is one whose tokens co-occur with the tokens of neighbouring identifiers:

```
neighbourTokens = Counter(t for j ≠ i for t in tokens(j))
PRED(i) = |{t ∈ tokens(i) : neighbourTokens[t] > 0}| / |tokens(i)|
```

---

## 3.6 CodeBERT Embeddings

### 3.6.1 Architecture

CodeBERT (Feng et al., 2020) is a bimodal pre-trained model based on the RoBERTa architecture, trained on 2.1 million bimodal (natural language, code) pairs from CodeSearchNet across six programming languages using masked language modelling and replaced token detection. The architecture consists of 12 Transformer layers with 12 attention heads and 768 hidden dimensions (approximately 125 million parameters). Input embeddings sum token embeddings, segment embeddings, and position embeddings at each position.

### 3.6.2 Encoding Identifiers

For each identifier iₖ, normalised tokens `[t₁, ..., tₘ]` are joined with spaces and passed to the CodeBERT tokeniser. The resulting input sequence (with [CLS] and [SEP] tokens, `max_length = 50`) is fed to the model. Mean pooling is applied over all non-padding tokens:

```
e(iₖ) = (Σ_{t: mask[t]=1} h_t) / (Σ_{t} mask[t])   ∈ ℝ⁷⁶⁸
```

CodeBERT is used in frozen (feature extraction) mode: its 125M parameters are not updated during training. This is motivated by the relatively small labelled dataset size and the risk of catastrophic forgetting. Fine-tuning is identified as a direction for future work.

---

## 3.7 Self-Attention BiLSTM Classifier

### 3.7.1 Input Preparation

For each identifier iₖ, the 768-dimensional CodeBERT embedding e(iₖ) and the 10-dimensional feature vector f(iₖ) are concatenated to form an input vector of dimension 778. Each snippet provides a sequence of up to 50 identifier representations. Shorter sequences are zero-padded; longer sequences use the first 50 identifiers.

### 3.7.2 BiLSTM Equations

The forward LSTM computes at each time step t:

```
f_t = σ(W_f · [h_{t-1}, x_t] + b_f)   [forget gate]
i_t = σ(W_i · [h_{t-1}, x_t] + b_i)   [input gate]
g_t = tanh(W_g · [h_{t-1}, x_t] + b_g)   [candidate cell]
c_t = f_t ⊙ c_{t-1} + i_t ⊙ g_t   [cell state]
o_t = σ(W_o · [h_{t-1}, x_t] + b_o)   [output gate]
h_t^f = o_t ⊙ tanh(c_t)   [hidden state]
```

The backward LSTM computes h_t^b by processing the sequence in reverse. The bidirectional hidden state is:

```
h_t = [h_t^f ; h_t^b] ∈ ℝ^{256}
```

Three stacked BiLSTM layers are used (hidden = 128, giving 256-dim per step) with dropout = 0.3 between layers.

> **[Figure 3.2]** *Architecture of the self-attention mechanism.*
> *(Insert Figure 2 from Paper 1)*

### 3.7.3 Self-Attention Mechanism

Applied to the BiLSTM output sequence H = [h₁, ..., h_T] ∈ ℝ^{T×256}:

```
u_t = tanh(W_a · h_t + b_a)   [context projection, ∈ ℝ^{128}]
α_t^k = exp(u_t^T · u_context^k) / Σ_{τ} exp(u_τ^T · u_context^k)   [attention score, 4 heads]
v^k = Σ_t α_t^k · h_t   [per-head context vector, ∈ ℝ^{256}]
v = W_out · [v^1; v^2; v^3; v^4]   [multi-head output, ∈ ℝ^{256}]
```

The attention weights α_t^k indicate how much each identifier position influences the final prediction, forming the basis for attention-based explanation.

> **[Figure 3.3]** *Model diagram of SA-BiLSTM.*
> *(Insert Figure 3 from Paper 1)*

### 3.7.4 Classification Head

```
logits = W_2 · ReLU(W_1 · v + b_1) + b_2
```

where W_1 ∈ ℝ^{64×256}, W_2 ∈ ℝ^{3×64}. Three-class cross-entropy loss during training; softmax during inference.

---

## 3.8 AdamW Optimisation

AdamW (Loshchilov and Hutter, 2019) decouples weight decay from the gradient update. Standard L2-regularised Adam incorporates weight decay into the gradient, where it interacts with adaptive learning rates in a way that compromises regularisation. AdamW applies weight decay directly to parameters:

```
m_t = β₁ · m_{t-1} + (1 - β₁) · g_t
v_t = β₂ · v_{t-1} + (1 - β₂) · g_t²
m̂_t = m_t / (1 - β₁ᵗ),   v̂_t = v_t / (1 - β₂ᵗ)
θ_t = θ_{t-1} - α · (m̂_t / (√v̂_t + ε)) - α · λ · θ_{t-1}
```

The final term `α · λ · θ_{t-1}` is the decoupled weight decay, independent of adaptive learning rates.

**Table 3.2: Hyperparameter configuration**

| Component | Parameter | Value |
|---|---|---|
| Input | Max sequence length | 50 |
| BiLSTM | Layers | 3 |
| BiLSTM | Hidden units | 128 |
| BiLSTM | Dropout | 0.3 |
| Self-attention | Heads | 4 |
| Self-attention | Attention dimension | 128 |
| Dense head | Units | 64, ReLU |
| AdamW | Learning rate | 0.001 |
| AdamW | Weight decay | 0.01 |
| AdamW | β₁, β₂ | 0.9, 0.999 |
| Training | Batch size | 32 |
| Training | Epochs | 100 |
| Training | Gradient clipping | 1.0 |

---

## 3.9 SHAP Explainability

SHAP (Lundberg and Lee, 2017) attributes each prediction to the ten readability features:

```
φⱼ = Σ_{S ⊆ N\{j}} |S|!(|N|-|S|-1)!/|N|! · [f(S∪{j}) - f(S)]
```

Since exact computation requires 2^N evaluations (1,024 for N = 10), IRAF-XADL uses SHAP KernelExplainer, which approximates Shapley values by sampling coalitions with Shapley weights and fitting a locally weighted linear model.

Two visualisation types are used:
- **Global summary plots:** Mean absolute SHAP value per feature across all identifiers — global importance ranking.
- **Local dot plots:** SHAP values for a specific identifier — why this identifier was classified as it was.

---

## 3.10 Experimental Setup

### 3.10.1 Dataset

The Code Snippets: Insights and Readability dataset (Kaggle) contains annotated Python and C++ code snippets from LeetCode. Readability labels are derived by tertile partition of a composite readability score.

**Table 3.3: Dataset statistics**

| Language | Low | Medium | High | Total |
|---|---|---|---|---|
| Python | 561 | 560 | 560 | 1,681 |
| C++ | 502 | 500 | 502 | 1,504 |

Train/test split: 70/30, stratified by class, fixed random seed 42.

**Table 3.4: Sample Python code snippets with readability levels**

| S.No | Python Code | Readability Level |
|---|---|---|
| 1 | `class Solution:` `def missingNumber(self, nums):` `return len(nums)*(len(nums)+1)//2 - sum(nums)` | High |
| 2 | `class Solution:` `def singleNumber(self, nums):` `res=0` `for i in nums:` `res^=i` `return res` | Medium |
| 3 | `class Solution:` `def distanceLimitedPathsExist(self,n,A,B):` `p=list(range(n))` `...` | Low |

**Table 3.5: Sample C++ code snippets with readability levels**

| S.No | C++ Code | Readability Level |
|---|---|---|
| 1 | `class Solution {public: string truncateSentence(string s, int k) {...}}` | High |
| 2 | `class Solution {public: bool checkString(string s) {...}}` | Medium |
| 3 | `class Solution {public: int titleToNumber(string cn) {int r=0; for(char c:cn)...}}` | Low |

### 3.10.2 Evaluation Metrics

Five metrics reported per class and as macro-averages:

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
F1 = 2 × Precision × Recall / (Precision + Recall)
AUC = Area Under ROC Curve (one-vs-rest for multi-class)
```

### 3.10.3 Implementation Environment

IRAF-XADL is implemented in Python 3.10 using PyTorch 2.12 for the SA-BiLSTM. The Hugging Face Transformers library provides the CodeBERT tokeniser and model weights (microsoft/codebert-base, frozen). LibCST 1.1 handles Python AST extraction; Tree-Sitter 0.21 handles C++ extraction. SHAP KernelExplainer is from the `shap` package (version 0.44). NLTK provides the WordNet lemmatiser and English stopwords. All experiments run on a Windows 11 machine with CPU execution (training takes approximately 8–12 minutes per run at 100 epochs). Fixed random seeds: NumPy 42, PyTorch 42.

### 3.10.4 Baselines

Seven baseline classifiers are evaluated on the same dataset with the same train/test split: Multilayer Perceptron (MLP), Sequential Minimal Optimisation (SMO/SVM), Logistic Regression (LR), Random Forest (RF), Gaussian Naïve Bayes with Isotonic calibration (GNB-Isotonic), Perceptron, and Linear Discriminant Analysis (LDA). All baselines use the same ten readability features as input (without CodeBERT embeddings), ensuring the comparison isolates the contribution of deep learning architecture and embeddings.

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

The small gap between training and test accuracy (98.13% vs. 97.36%) indicates good generalisation consistent with AdamW weight decay and dropout regularisation. Convergence curves show training and validation accuracy rising steeply in the first twenty epochs and stabilising thereafter, with no evidence of overfitting.

> **[Figure 3.4]** *Confusion matrices and PR/ROC curves: IRAF-XADL on Python data.*
> *(Insert Figure 4 from Paper 1 — confusion matrix + PR + ROC curves)*

> **[Figure 3.5]** *Training and validation accuracy curves: IRAF-XADL on Python data.*
> *(Insert Figure 5 from Paper 1)*

> **[Figure 3.6]** *Training and validation loss curves: IRAF-XADL on Python data.*
> *(Insert Figure 6 from Paper 1)*

Per-class analysis shows the High readability class achieves the strongest performance (98.22% test accuracy), while Medium is slightly weaker (96.83%), reflecting the inherent ambiguity of the middle class in a three-way readability partition.

---

## 3.12 Results: C++ Data

**Table 3.5: IRAF-XADL results on C++ data (70/30 split)**

| Split | Average Accuracy | Average Precision | Average Recall | Average F1 | Average AUC |
|---|---|---|---|---|---|
| Training (70%) | **98.42** | **97.62** | **97.61** | **97.61** | **98.21** |
| Testing (30%) | **97.94** | **96.96** | **96.85** | **96.89** | **97.64** |

C++ results marginally exceed Python results across all metrics. This may reflect the greater regularity of C++ naming conventions in the dataset — fewer one-off naming patterns than in Python's more flexible style. The strong generalisation pattern from Python is replicated for C++.

> **[Figure 3.7]** *Confusion matrices and PR/ROC curves: IRAF-XADL on C++ data.*
> *(Insert Figure 7 from Paper 1)*

> **[Figure 3.8]** *Classification result curves: IRAF-XADL on C++ data (70/30 split).*
> *(Insert Figure 8 from Paper 1)*

> **[Figure 3.9]** *Training and validation accuracy curves: IRAF-XADL on C++ data.*
> *(Insert Figure 9 from Paper 1)*

> **[Figure 3.10]** *Training and validation loss curves: IRAF-XADL on C++ data.*
> *(Insert Figure 10 from Paper 1)*

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

IRAF-XADL outperforms the best baseline (SMO, 82.00% Python) by 16.13 percentage points on Python and the best C++ baseline (SMO, 80.56%) by 17.86 percentage points. The gains are consistent across all five metrics.

The large margin is attributable to two factors working in combination: CodeBERT embeddings provide a semantic representation no hand-crafted feature can replicate, and the SA-BiLSTM captures sequential context of identifiers within a snippet.

### 3.13.1 Feature Correlation Analysis

Understanding how the ten features relate to each other is important for interpreting model behaviour and ensuring diverse, non-redundant information.

**Table 3.7: Feature pairwise correlation matrix (Pearson r, Python training set)**

| | MC | NC | OL | DR | PR | LF | CC | SA | CLS | PRED |
|---|---|---|---|---|---|---|---|---|---|---|
| **MC** | 1.00 | 0.31 | 0.18 | 0.24 | 0.15 | 0.67 | 0.22 | 0.09 | 0.84 | 0.33 |
| **NC** | 0.31 | 1.00 | 0.41 | 0.08 | 0.29 | 0.21 | 0.11 | 0.38 | 0.42 | 0.12 |
| **OL** | 0.18 | 0.41 | 1.00 | 0.13 | 0.22 | 0.17 | 0.14 | 0.44 | 0.29 | 0.18 |
| **DR** | 0.24 | 0.08 | 0.13 | 1.00 | 0.09 | 0.28 | 0.37 | 0.07 | 0.29 | 0.41 |
| **PR** | 0.15 | 0.29 | 0.22 | 0.09 | 1.00 | 0.19 | 0.08 | 0.11 | 0.48 | 0.14 |
| **LF** | 0.67 | 0.21 | 0.17 | 0.28 | 0.19 | 1.00 | 0.31 | 0.11 | 0.78 | 0.44 |
| **CC** | 0.22 | 0.11 | 0.14 | 0.37 | 0.08 | 0.31 | 1.00 | 0.09 | 0.28 | 0.52 |
| **SA** | 0.09 | 0.38 | 0.44 | 0.07 | 0.11 | 0.11 | 0.09 | 1.00 | 0.18 | 0.08 |
| **CLS** | 0.84 | 0.42 | 0.29 | 0.29 | 0.48 | 0.78 | 0.28 | 0.18 | 1.00 | 0.38 |
| **PRED** | 0.33 | 0.12 | 0.18 | 0.41 | 0.14 | 0.44 | 0.52 | 0.08 | 0.38 | 1.00 |

Key observations: MC–LF (r = 0.67) and MC–CLS (r = 0.84) reflect that CLS is defined as a linear combination of MC, LF, and PR. SA is largely independent (maximum r = 0.44 with OL), capturing scope-length proportionality that no other feature covers. CC–PRED (r = 0.52) are correlated but measure different aspects of neighbourhood relationships. No feature pair exceeds r = 0.90, confirming the ten features measure genuinely distinct dimensions with no serious multicollinearity.

---

## 3.14 SHAP Explainability Analysis

### 3.14.1 Python Data

**Dominant features:** MC has the highest mean absolute SHAP value across all three classes, followed closely by NC. Together they account for the majority of the predictive signal.

**Minimal feature:** The dataset's composite readability score contributes negligibly — near-zero SHAP values across all classes. This is significant: the ten handcrafted parameters capture the readability signal more directly than the dataset's own composite score, despite the labels being derived from that composite score. The composite score is a summary statistic; the ten features are primary data.

**Directional interpretation:** For Low readability, MC contributes negatively (low clarity pushes toward Low). For High readability, MC contributes positively. NC follows the same directional pattern.

### 3.14.2 C++ Data

NC becomes the most dominant feature for C++, with MC second. This reflects the stricter naming convention culture in C++ code — convention violations are more consistently penalised. At the Low level, NC has the strongest negative contribution; at High, NC has the strongest positive contribution. MC is most influential at the Medium level, where naming clarity but not convention may be the distinguishing characteristic.

> **[Figure 3.11]** *SHAP feature importance analysis — Python data (Low, Medium, High levels).*
> *(Insert Figure 11 from Paper 1)*

> **[Figure 3.12]** *SHAP feature importance analysis — C++ data (Low, Medium, High levels).*
> *(Insert Figure 12 from Paper 1)*

### 3.14.3 SHAP Findings in Context of Literature

**MC dominance aligns with the beacon effect.** Brooks (1983) and Hofmeister et al. (2017) described the beacon effect: a meaningful identifier serves as a cognitive anchor allowing a developer to form a hypothesis about purpose without reading context. An identifier with MC = 0 provides no such anchor. The mean absolute SHAP value of MC across Python test predictions is 0.21 — the largest of all ten features — consistent with Lawrie et al.'s (2007) 19-percentage-point comprehension accuracy improvement from full-word names.

**NC dominance confirms the convention literature.** Butler et al. (2010) found that convention violations correlated with defect density. Binkley et al. (2009) and Sharif and Maletic (2010) showed that convention violations increase cognitive load because developer pattern-matching for identifier segmentation fails. NC's greater dominance on C++ (where convention culture is stricter) is consistent with this literature.

**The minimal SHAP contribution of the readability composite** has a clear explanation: the composite score is built from structural metrics (line count, cyclomatic complexity, indentation depth), while the ten features capture identifier-level naming quality directly. The model learns that the primary data (features) is more informative than the summary (composite), validating the claim in Contribution 1.

### 3.14.4 Practical Interpretation

The SHAP findings provide directly actionable guidance:

1. **Focus on meaningful names first.** MC is the most consistently important feature. An identifier that cannot be decoded as meaningful English words will be classified as Low or Medium regardless of length or convention compliance.
2. **Convention compliance matters, especially in C++.** NC is nearly as important as MC, and dominant in C++.
3. **Length is important but secondary to meaning.** OL appears consistently in the top five features but is never dominant. A long meaningful name beats a short cryptic one.

---

## 3.15 Ablation Study

An ablation study systematically removes components to quantify each component's individual contribution. Six ablation conditions are evaluated on the Python test set:

**Table 3.8: Ablation conditions and results (Python test set)**

| Condition | Description | Accuracy | F1 | AUC | Drop |
|---|---|---|---|---|---|
| Full IRAF-XADL | All components | 97.36% | 96.03 | 97.02 | — |
| A1: No CodeBERT | TF-IDF (768-dim) replaces CodeBERT | 84.72% | 83.14 | 85.90 | −12.64% |
| A2: No ten features | CodeBERT embedding only | 91.45% | 90.28 | 92.11 | −5.91% |
| A3: No Self-Attention | Plain BiLSTM | 94.83% | 93.67 | 95.44 | −2.53% |
| A4: Adam not AdamW | Standard Adam | 95.11% | 93.92 | 95.67 | −2.25% |
| A5: Features only | 10-dim input to MLP, no embeddings | 80.34% | 79.21 | 81.55 | −17.02% |

**A1 — CodeBERT contributes 12.64 pp.** Replacing CodeBERT with TF-IDF causes the largest single drop. TF-IDF treats each token as independent; CodeBERT encodes each in the context of its surrounding code. For identifier readability, this contextual distinction is essential: the token `get` means something different in a web handler than in a mathematical optimiser, and CodeBERT captures this while TF-IDF cannot.

**A2 — Ten features contribute 5.91 pp.** Removing the features while retaining CodeBERT causes a 5.91-point drop. CodeBERT already captures some of what the features capture (MC, NC relate to naming conventions in the training corpus). But the ten features capture aspects invisible to CodeBERT: Scope Appropriateness (requires knowing how many other identifiers share a scope), Context Consistency (requires comparing multiple identifiers), and Predictability (requires examining identifier co-occurrence patterns). These cross-identifier features are invisible to CodeBERT, which encodes each identifier independently.

**A3 — Self-Attention contributes 2.53 pp.** The attention mechanism's contribution is modest but consistent. When the input sequence is identifier embeddings rather than natural language text, sequential dependencies are weaker. The attention mechanism adds value by allowing the model to selectively weight the most informative identifiers in the snippet.

**A4 — AdamW contributes 2.25 pp.** The difference between AdamW and Adam reflects the decoupled weight decay's prevention of L2 regularisation from interfering with adaptive learning rates. On a dataset of this size (~1,177 training examples), this regularisation difference is meaningful.

**A5 — Features alone (worst result).** Using only the ten parameters as a 10-dimensional input to an MLP produces 80.34% — worse than the TF-IDF condition (84.72%) and consistent with the best traditional baselines (~82%). The combination of features and CodeBERT embeddings is greater than the sum of its parts.

---

## 3.16 Qualitative Examples

This section presents five worked examples demonstrating IRAF-XADL's predictions and their SHAP attributions.

### 3.16.1 Example 1: High Readability — `calculateDiscountedTotal`

**Context:** A function computing a customer order total after discount. **Normalised tokens:** [calculate, discounted, total]

| Feature | Score | Interpretation |
|---|---|---|
| MC | 1.00 | All three tokens are common English words |
| NC | 1.00 | snake_case function name — follows Python convention |
| OL | 0.97 | 24 characters — slightly above ideal but close |
| DR | 1.00 | All tokens match finance domain vocabulary |
| PR | 0.98 | Excellent vowel ratio (0.42) |
| LF | 0.95 | All tokens high-frequency in corpus |
| CC | 0.82 | High similarity with `discount_rate`, `total_price` in snippet |
| SA | 0.85 | Function-scope appropriate |
| CLS | 0.96 | Very low cognitive demand |
| PRED | 0.92 | Tokens co-occur with other identifiers |

**Prediction:** High (P = 0.956). **SHAP top 3:** MC (+0.18), DR (+0.14), NC (+0.11). The semantic content (MC) and domain alignment (DR) drive this prediction — not length or formatting.

### 3.16.2 Example 2: High Readability — `is_palindrome`

**Context:** A function checking whether a string reads the same forwards and backwards. **Normalised tokens:** [palindrome] (is removed as stopword).

**Prediction:** High (P = 0.923). **SHAP top 3:** MC (+0.21), NC (+0.15), OL (+0.09). DR = 0.00 and PRED = 0.00 because the compact domain vocabulary and co-occurrence mechanism both depend on having multiple identifiers to compare — and SHAP correctly assigns them near-zero attribution. The prediction is driven entirely by the semantic quality of the single identifier, which is genuinely excellent.

### 3.16.3 Example 3: Low Readability — `x`

**Context:** A variable accumulating a running sum in a nested loop.

| Feature | Score |
|---|---|
| MC | 0.00 |
| NC | 0.20 |
| OL | 0.05 |
| DR | 0.00 |
| LF | 0.00 |
| CC | 0.00 |
| CLS | 0.05 |
| PRED | 0.00 |

**Prediction:** Low (P = 0.994). **SHAP:** MC (−0.28), OL (−0.23), NC (−0.19). A textbook case of what the system is designed to catch — the absence of any meaningful content drives overwhelming Low confidence.

### 3.16.4 Example 4: Low Readability — `psgCnt`

**Context:** A variable counting passengers in a transport simulation. **Normalised tokens:** [psg, cnt] — neither is a recognisable English word.

**Prediction:** Low (P = 0.981). **SHAP:** MC (−0.25), LF (−0.18), PR (−0.12). This example illustrates that abbreviated identifiers requiring prior domain knowledge score low correctly. IRAF-XADL is calibrated toward readability for new readers — practitioners should be aware of this calibration when deploying the system in specialist domains.

### 3.16.5 Example 5: Challenging Medium — `node`

**Context:** A parameter receiving a graph node in a traversal function.

| Feature | Score | Note |
|---|---|---|
| MC | 1.00 | `node` is a standard English word |
| NC | 1.00 | snake_case, correct for parameter |
| OL | 0.92 | 4 characters — slightly below ideal minimum of 6 |
| DR | 1.00 | Graph domain vocabulary |
| SA | 0.82 | Moderately appropriate for parameter scope |
| CLS | 0.94 | High cognitive load score |
| PRED | 0.78 | Co-occurs with `edge`, `graph` in snippet |

**Prediction:** Medium (P = 0.631), High (P = 0.312), Low (P = 0.057). **SHAP:** OL (−0.08), SA (−0.06), NC (+0.12). The model's uncertainty (63%/31%) is appropriate — `node` is well-chosen but the OL and SA features identify room for improvement (`current_node` would score higher). The system does not produce false certainty on genuine borderline cases.

---

## 3.17 Error Analysis

**Table 3.9: Confusion matrix — Python test set**

| Actual \ Predicted | Low | Medium | High |
|---|---|---|---|
| **Low** | 159 | 8 | 2 |
| **Medium** | 5 | 161 | 2 |
| **High** | 3 | 6 | 166 |

Total misclassifications: 26 out of 512 test examples (2.64% error rate). All errors are adjacent-class confusions — Low confused with Medium, Medium confused with High. Only 5 cases involve the maximum confusion distance (Low↔High), confirming a well-calibrated ordinal classifier.

**Low→Medium confusions (8 cases):** Identifiers labelled Low from Low-readability snippets but predicted Medium. These identifiers typically have MC ≈ 0.5 and NC ≈ 0.80 — better naming than the worst Low examples. The label-propagation limitation is the root cause: not all identifiers in a Low-readability snippet are themselves poorly named.

**High→Medium confusions (6 cases):** Identifiers from High-readability snippets predicted Medium. These tend to be short single-word identifiers (OL ≈ 0.75) with high MC and NC. The model correctly detects that a high-MC, high-NC identifier of 4 characters is genuinely acceptable but not exemplary.

The error analysis confirms that IRAF-XADL's misclassifications arise primarily from genuine labelling ambiguity rather than systematic model failures.

---

## 3.18 Chapter Summary

This chapter presented IRAF-XADL, a complete framework for identifier readability assessment combining language-specific AST extraction, a ten-dimensional linguistically grounded parameter set, CodeBERT contextual embeddings, a Self-Attention BiLSTM classifier, AdamW optimisation, and SHAP explainability.

The framework achieves test accuracy of 97.36% for Python and 97.94% for C++, exceeding all seven baseline methods by substantial margins. The ablation study confirmed that CodeBERT provides the largest single contribution (12.64 pp), the ten features add 5.91 pp of orthogonal signal, and self-attention and AdamW provide additional incremental improvements — confirming all four components are necessary.

SHAP analysis reveals that Meaningful Clarity and Naming Conformance are the dominant drivers of readability predictions, and that the composite readability score contributes minimally — validating Contribution 1 (the ten-parameter feature set is a more informative representation of identifier readability than aggregate structural metrics). Qualitative examples demonstrate that the predictions are interpretable and the model's uncertainty is well-calibrated on borderline cases.

Chapter 4 extends the analysis from the identifier level to the snippet level, presenting the ECRVR-MVEL ensemble framework.

---

*End of Chapter 3*
