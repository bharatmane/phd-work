# CHAPTER 4: ECRVR-MVEL — EXPLAINABLE CODE READABILITY CLASSIFICATION USING VECTOR REPRESENTATIONS AND MAJORITY VOTING-BASED ENSEMBLE LEARNING

---

## 4.1 Introduction and Motivation

Chapter 3 established that identifier naming quality can be assessed with high accuracy when identifiers are processed individually with a rich feature set and contextual embeddings. However, individual identifiers do not exist in isolation. They appear within functions, methods, and classes — code snippets that have their own structural properties, cyclomatic complexity, loop depth, and line length. A function that uses well-named identifiers but has deeply nested logic spanning six hundred lines is not a readable function. Conversely, a compact function with one or two identifiers — even if generic — may be instantly readable in context.

The second level of the program comprehension hierarchy is the code snippet. Snippet-level readability prediction is a classification problem: given a code snippet, predict whether it is High, Medium, or Low readability. This is the problem addressed in this chapter.

Three architectural observations motivate the design of ECRVR-MVEL (Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning).

First, different neural architectures are sensitive to different properties of code. Graph-based models capture structural relationships — which variables depend on which functions, how control flow passes between blocks. Hierarchical probabilistic models capture feature co-occurrence patterns. Temporal models capture sequential patterns in the token stream. No single architecture is uniformly best at all of these.

Second, ensemble methods that combine architecturally diverse classifiers consistently outperform any single classifier, because the errors of different architectures tend to be uncorrelated. When one classifier fails because it misses a structural pattern, another may compensate because it captures a temporal pattern instead.

Third, explainability at the snippet level requires a different tool than at the identifier level. SHAP is well-suited to explaining the contribution of the ten handcrafted features in Study 1. For snippet-level classification, where the primary representation is a CodeBERT embedding of a full snippet, LIME is more appropriate: it perturbs the input at the token level and observes how the ensemble's prediction changes, producing token-level importance scores that are directly interpretable.

---

## 4.2 Problem Formulation

Given a code snippet S written in language L ∈ {Python, C++}, the objective is to:

1. Preprocess S (tokenise, remove comments, normalise whitespace, detect language).
2. Encode S using CodeBERT to produce a vector representation e(S) ∈ ℝ⁷⁶⁸.
3. Classify e(S) as High, Medium, or Low readability using a weighted majority voting ensemble of three classifiers: GCN, DBN, and Bi-TCN.
4. Optimise the ensemble using the Nadam algorithm.
5. For each prediction, generate a LIME explanation identifying which tokens in S most influenced the classification.

Formally, the ensemble prediction is:

```
WMVE(S) = arg max_c Σ_{k ∈ {GCN, DBN, BiTCN}} w_k · P(y = c | S, M_k)
```

where w_k is the learned weight for classifier k and P(y = c | S, M_k) is the predicted probability of class c from model k.

---

## 4.3 Framework Architecture

ECRVR-MVEL consists of five stages:

1. **Text Preprocessing** — Tokenisation, comment removal, whitespace normalisation, language detection, sequence encoding
2. **CodeBERT Vector Representation** — 768-dimensional embedding of the full snippet
3. **Weighted Majority Voting Ensemble** — GCN + DBN + Bi-TCN combined with learned weights
4. **Nadam Optimisation** — Parameter update for the ensemble
5. **LIME Explainability** — Token-level importance scores for each prediction

```
                     ECRVR-MVEL FRAMEWORK PIPELINE
 ┌──────────────────────────────────────────────────────────┐
 │  INPUT: Raw Source Code Snippet S (Python or C++)        │
 └─────────────────────┬────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   STAGE 1: PREPROCESSING    │
        │   Tokenisation              │
        │   Comment removal           │
        │   Whitespace normalisation  │
        │   Language detection        │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │   STAGE 2: CodeBERT         │
        │   EMBEDDING                 │
        │   [CLS] token → e(S) ∈ ℝ⁷⁶⁸│
        │   Sliding window if >512 tok│
        └──────┬──────────────────────┘
               │ e(S) fed to all 3 classifiers
    ┌──────────┼──────────┬─────────────┐
    ▼          ▼          ▼             │
 ┌──────┐  ┌──────┐  ┌──────┐          │
 │ GCN  │  │ DBN  │  │Bi-TCN│  STAGE 3 │
 │Graph │  │Hier. │  │Seq.  │  ENSEMBLE │
 │struct│  │prob. │  │temp. │          │
 │92.87%│  │94.46%│  │95.38%│          │
 └──┬───┘  └──┬───┘  └──┬───┘          │
    │  w_GCN  │  w_DBN  │  w_BiTCN     │
    └─────────┴──────────┴─────────────┘
                       │
                       ▼  STAGE 4: NADAM OPTIMISATION
        ┌──────────────────────────────┐
        │  WEIGHTED MAJORITY VOTING    │
        │  P(c|S) = Σ wₖ·Pₖ(c|S)      │
        │  → {Low, Medium, High}       │
        │  WMVE: 98.15% (Py)           │
        └──────────────┬───────────────┘
                       │  STAGE 5: LIME EXPLAINABILITY
                       ▼
 ┌──────────────────────────────────────────────────────────┐
 │  OUTPUT: Readability Class + LIME Token Importance Scores │
 └──────────────────────────────────────────────────────────┘
```

> **[Figure 4.1]** *Overall process and architecture of the ECRVR-MVEL approach.*
> *(Insert Figure 1 from Paper 2 — high-resolution version)*

---

## 4.4 Text Preprocessing

Source code preprocessing for ECRVR-MVEL operates at the snippet level rather than the identifier level, using different techniques from Study 1 to preserve the structural and syntactic properties of the full snippet.

### 4.4.1 Tokenisation

Raw source code is tokenised using language-specific rules that treat programming constructs as atomic units. The tokeniser distinguishes keywords (control flow, type, class-related), identifiers (variable, function, class, parameter names), literals (string, integer, floating-point, boolean), operators (arithmetic, relational, logical, bitwise), and delimiters (parentheses, brackets, braces, semicolons). Language-specific tokenisation rules are applied to ensure structural information is not lost.

### 4.4.2 Comment Removal and Whitespace Normalisation

Comments are removed before embedding: they describe intent rather than express computation, and the model is trained to assess code structure and naming, not documentation quality. Whitespace is normalised: excessive blank lines, trailing whitespace, and inconsistent indentation are standardised. In Python, where indentation is syntactically significant, normalisation carefully preserves logical structure.

### 4.4.3 Programming Language Detection

Language detection uses three mechanisms in order: file extension analysis, reserved keyword pattern matching (Python keywords such as `def`, `elif`, `lambda` do not overlap with C++ keywords such as `#include`, `namespace`, `template`), and syntactic pattern analysis (Python's colon-terminated function definitions vs. C++'s curly-brace delimited bodies). Language detection gates the selection of tokenisation rules and encoding vocabularies.

### 4.4.4 Sequence Encoding

After tokenisation, tokens are mapped to integer indices using a vocabulary built from the training corpus. Sequences are padded or truncated to 512 tokens (CodeBERT's maximum) using zero-padding for shorter sequences. Language-aware segment embeddings distinguish Python tokens from C++ tokens.

---

## 4.5 CodeBERT Vector Representations

### 4.5.1 [CLS] Token Encoding

The snippet token sequence (with [CLS] and [SEP] added) is fed to CodeBERT with `max_length = 512`. The [CLS] token embedding — a 768-dimensional vector at position 0 from the final Transformer layer — serves as the aggregate representation of the entire snippet. During pre-training, the [CLS] token receives gradient updates from the full self-attention mechanism, allowing it to aggregate information from every token. This makes [CLS] more appropriate than mean pooling for holistic snippet representation: mean pooling treats all token positions equally, whereas [CLS] can weight different parts differently based on learned relevance.

```
e(S) = BERT([CLS], t₁, t₂, ..., t_n, [SEP])[0]   ∈ ℝ⁷⁶⁸
```

### 4.5.2 Sliding Window for Long Snippets

For snippets exceeding 512 tokens, a sliding window approach uses overlapping windows of 512 tokens with stride 256 (50% overlap). Each window W_i produces a [CLS] embedding e(W_i), and the final embedding is their average:

```
e(S) = (1/K) Σ_{i=1}^{K} e(W_i)
```

The 50% overlap ensures token pairs near window boundaries appear together in at least one window, capturing cross-boundary context. In the experimental dataset, approximately 3% of Python snippets and fewer than 1% of C++ snippets require the sliding window.

### 4.5.3 CodeBERT in Frozen Mode

As in Study 1, CodeBERT's 125 million parameters are not updated during ensemble training. Frozen mode is appropriate given the dataset size (1,177 Python and 1,053 C++ training snippets): fine-tuning would risk catastrophic forgetting. Frozen CodeBERT provides rich, general-purpose semantic embeddings that the ensemble classifiers learn to exploit for the specific readability classification task.

---

## 4.6 Graph Convolutional Network (GCN)

### 4.6.1 Motivation

A code snippet is not just a sequence of tokens — it is a structured program with explicit dependencies between variables, function calls, and control flow paths. These structural relationships are not captured by sequence models or token embeddings alone. A GCN can represent and learn from these structures.

### 4.6.2 Graph Construction

For each snippet, a dependency graph G = (V, E) is constructed:

- **Nodes V:** Each unique identifier (variable, function, class) and structural nodes representing control flow constructs (if-blocks, loops, function definitions).
- **Edges E:** Directed edges representing data dependencies (variable assignment and use), control flow transitions, and function call relationships.

Node features are initialised with the CodeBERT embedding of the corresponding identifier.

### 4.6.3 Spectral Graph Convolution

Given adjacency matrix A ∈ ℝ^{n×n} and degree matrix D where D_{ii} = Σ_j A_{ij}, the normalised adjacency matrix is:

```
Â = D^{-1/2} (A + I) D^{-1/2}
```

The l-th GCN layer computes:

```
H^{(l+1)} = ReLU(Â · H^{(l)} · W^{(l)})
```

After k convolution layers, node embeddings are aggregated using global mean pooling:

```
h_GCN = (1/n) Σᵢ H_i^{(k)}
```

> **[Figure 4.2]** *Structure of the GCN technique used in ECRVR-MVEL.*
> *(Insert Figure 2 from Paper 2)*

### 4.6.4 Message Passing and Depth

Three convolution layers are used. At each layer, each node aggregates from its neighbours:

```
h_i^{(l+1)} = ReLU(W^{(l)} · (1/|N(i)| Σ_{j ∈ N(i) ∪ {i}} h_j^{(l)})
```

Three layers give each function-level node access to information from all direct and transitive dependencies.

### 4.6.5 Edge Weights and Cosine Similarity

Beyond binary adjacency, edges are weighted by cosine similarity between initial CodeBERT embeddings:

```
A_{ij} = cosine(e_i, e_j) = e_i · e_j / (‖e_i‖ ‖e_j‖)
```

This encodes semantic proximity: two identifiers with similar names (`totalPrice` and `totalTax`) receive high edge weight, while semantically unrelated identifiers receive low weight even if adjacent in the dependency graph. The semantic weighting guides the GCN to attend more to connections between similarly named entities — directly encoding the consistency principle from NC and CC in Study 1.

### 4.6.6 Classification Head

```
y_GCN = W_class · h_GCN + b_class ∈ ℝ³
```

Softmax is applied for inference; cross-entropy loss is applied directly to logits during training.

---

## 4.7 Deep Belief Network (DBN)

### 4.7.1 Architecture

A Deep Belief Network is a generative probabilistic model composed of stacked Restricted Boltzmann Machines (RBMs). Each RBM is an undirected bipartite graph with visible units v and hidden units h:

```
p(v, h) = (1/Z) exp(aᵀv + bᵀh + vᵀWh)
```

### 4.7.2 Energy Function and Contrastive Divergence

The energy function of a single RBM is:

```
E(v, h) = −aᵀv − bᵀh − vᵀWh
```

The conditional distributions factorise cleanly, making Gibbs sampling tractable:

```
p(h_j = 1 | v) = σ(b_j + Σ_i v_i W_{ij})
p(v_i = 1 | h) = σ(a_i + Σ_j h_j W_{ij})
```

Contrastive Divergence with k = 1 steps approximates the intractable maximum likelihood gradient:

```
ΔW ≈ ⟨v h^T⟩_data − ⟨v h^T⟩_k
```

### 4.7.3 Layer-Wise Pretraining and Fine-Tuning

Greedy layer-wise pretraining proceeds as follows. The first RBM (visible: 768 dimensions; hidden: 512) is trained on CodeBERT embeddings using CD-1. The hidden activations become the input to the second RBM (512 → 256), then the third (256 → 128). After unsupervised pretraining, a classification layer (128 → 3, softmax) is appended and the entire network is fine-tuned discriminatively using backpropagation with cross-entropy loss and the Nadam optimiser.

The value of this two-stage approach is that pretraining can use unlabelled code snippets to learn richer representations before the supervised task is introduced. In the experimental setup, only the labelled dataset is used, but the architecture supports semi-supervised extensions.

### 4.7.4 Input and Output

The DBN takes as input the 768-dimensional CodeBERT embedding. The architecture uses three hidden layers (512 → 256 → 128) followed by a softmax output layer with three units. The DBN's probabilistic representations are complementary to the GCN's structural representations, providing diversity in the ensemble.

---

## 4.8 Bidirectional Temporal Convolutional Network (Bi-TCN)

### 4.8.1 Architecture

Temporal Convolutional Networks (TCNs), introduced by Bai et al. (2018), apply dilated causal convolutions to sequence modelling. The key innovation is dilation — exponentially increasing the receptive field — which allows TCNs to capture long-range dependencies without the sequential bottleneck of LSTMs.

ECRVR-MVEL extends TCNs bidirectionally: a forward TCN processes the token sequence left-to-right, and a backward TCN processes it right-to-left. Their outputs are concatenated at each position.

### 4.8.2 Dilated Causal Convolution

For a 1D convolution with dilation factor d and kernel size k, the convolution at position t is:

```
y_t = Σ_{i=0}^{k-1} w_i · x_{t - d·i}
```

With d = 1, 2, 4, 8, ... at successive layers, the receptive field of the l-th layer grows as 2^l(k-1) + 1. A four-layer Bi-TCN with k = 3 has a receptive field of 31 tokens, sufficient for most code functions.

### 4.8.3 Residual Connections

Each Bi-TCN block includes a residual connection:

```
output = activation(Bi-TCN-block(input)) + input
```

When input and output dimensions differ, a 1×1 convolution adapts the input before addition.

### 4.8.4 Feature Fusion Layer

The forward output F_t ∈ ℝ^{d_f} and backward output B_t ∈ ℝ^{d_f} are combined:

```
M_t = LayerNorm(Linear([F_t ; B_t]))   ∈ ℝ^{d_f}
```

Layer normalisation stabilises the fused representation and prevents the forward and backward streams from developing incompatible scales during training.

### 4.8.5 Input and Output

The Bi-TCN takes the CodeBERT token embedding matrix (sequence_length × 768) as input. Global average pooling over the sequence dimension after fusion produces a fixed-size vector:

```
h_BiTCN = (1/T) Σ_{t=1}^{T} M_t   ∈ ℝ^{256}
```

### 4.8.6 Why Bidirectional TCN for Code

Code readability is a property of the whole snippet, not a left-to-right sequential property. A function name at the top is interpreted in the context of the return statement at the bottom. The backward TCN captures right-to-left dependencies explicitly. Compared to BiLSTM, the Bi-TCN offers full parallelisation across time steps, exact receptive field control through dilation, and robustness to vanishing gradients through residual connections — making it more suitable for snippet-level classification where snippets span many more tokens than individual identifiers.

---

## 4.9 Weighted Majority Voting Ensemble (WMVE)

### 4.9.1 Rationale

The three classifiers (GCN, DBN, Bi-TCN) make structurally different errors. The GCN is sensitive to structural properties but may miss sequential patterns. The DBN captures feature co-occurrence but may not model structural relationships well. The Bi-TCN captures sequential patterns in both directions but lacks explicit structural modelling. When combined, their errors tend to be uncorrelated: an example that confuses the GCN may be correctly classified by the Bi-TCN, and vice versa.

### 4.9.2 Weight Assignment

Weights are learned during training using validation performance. The initialisation uses softmax normalisation of validation accuracies:

```
w_k^(0) = exp(acc_k / τ) / Σ_{j} exp(acc_j / τ)
```

where τ = 0.1 sharpens the distribution toward the best-performing classifier. With validation accuracies GCN: 91.95%, DBN: 94.33%, Bi-TCN: 95.41%, initial weights are approximately w_GCN = 0.24, w_DBN = 0.32, w_BiTCN = 0.44. These weights are fine-tuned jointly with classifier parameters during final training. Learned rather than fixed weights are used because classifier quality is dataset-dependent — the optimal C++ weights differ from the Python weights.

### 4.9.3 Calibration

Temperature scaling is applied after training:

```
P_calibrated(y = c | S) = softmax(logits(S) / T_cal)
```

where T_cal is learned on the validation set by minimising negative log-likelihood. Calibration ensures stated confidence is an accurate reflection of empirical frequency — a requirement for the LIME confidence threshold used in deployment.

### 4.9.4 Diversity and Error Correlation

For a set of classifiers with equal expected error ε and pairwise error correlation ρ:

```
E[error_ensemble] = ε [1/K + (1 - 1/K)ρ]
```

When ρ = 1 (perfectly correlated), the ensemble achieves no gain. When ρ = 0, error reduces to ε/K. The pairwise diversity scores (9.3% to 11.2% disagreement; see Section 4.18) translate to correlations well below 1, explaining the observed 2.77–4.57 percentage-point improvement over the best individual classifier.

### 4.9.5 Combination Rule

```
P(y = c | S) = w_GCN · P_GCN(y=c|S) + w_DBN · P_DBN(y=c|S) + w_BiTCN · P_BiTCN(y=c|S)
ŷ = arg max_c P(y = c | S)
```

---

## 4.10 Nadam Optimisation

Nadam (Dozat, 2016) combines Nesterov momentum with Adam, providing a lookahead correction that improves convergence in directions of consistently high curvature.

### 4.10.1 Adam Baseline

```
m_t = β₁ m_{t-1} + (1 - β₁) g_t          [first moment]
v_t = β₂ v_{t-1} + (1 - β₂) g_t²          [second moment]
m̂_t = m_t / (1 - β₁ᵗ),   v̂_t = v_t / (1 - β₂ᵗ)   [bias correction]
θ_t = θ_{t-1} - α · m̂_t / (√v̂_t + ε)
```

### 4.10.2 Nesterov Modification

Nadam substitutes the current gradient g_t for the previous moment in the bias-corrected update:

```
θ_t = θ_{t-1} - α / (√v̂_t + ε) · (β₁ m̂_t + (1-β₁) g_t / (1-β₁ᵗ))
```

The term `(1-β₁) g_t / (1-β₁ᵗ)` is the Nesterov correction — it steps in the direction the momentum will reach rather than where it currently is, reducing oscillation in directions of consistently high curvature.

### 4.10.3 Hyperparameter Configuration

**Table 4.1: Nadam hyperparameter configuration**

| Parameter | Value | Rationale |
|---|---|---|
| Learning rate (α) | 0.001 | Standard for Adam-family optimisers |
| β₁ | 0.9 | Standard first moment decay |
| β₂ | 0.999 | Standard second moment decay |
| ε | 1×10⁻⁸ | Numerical stability |
| Weight decay | 0.01 | L2 regularisation |
| Batch size | 32 | Memory-efficient; consistent with Study 1 |

Nadam converges faster than Adam on problems with high curvature, which is common in deep learning for code classification where different code structures create narrow loss valleys in different directions of the parameter space.

---

## 4.11 LIME Explainability

LIME (Ribeiro et al., 2016) generates a local explanation for a single prediction by:

1. Sampling a neighbourhood of perturbed inputs around the instance being explained.
2. Querying the black-box ensemble on each perturbed input.
3. Weighting each perturbed input by proximity to the original: w(x, z) = exp(-d(x, z)² / σ²).
4. Fitting a linear surrogate model g to minimise: L(f, g, π_x) = Σ_z π_x(z) × (f(z) - g(z))² + Ω(g).
5. Returning the coefficients of g as feature importance scores.

For code snippet classification, each perturbation replaces or removes individual tokens. The LIME explanation identifies which tokens, when removed, most change the prediction — assigning positive importance to tokens supporting the predicted class and negative importance to tokens opposing it.

**Interpretation:** Tokens with high positive importance for High readability are typically well-named function and variable tokens. Tokens with high negative importance are typically cryptic abbreviations, deeply nested structural tokens, or tokens associated with complexity. Knowing that the function name `f` is reducing the High readability probability tells the developer exactly what to fix.

---

## 4.12 Experimental Setup

### 4.12.1 Dataset

The same Code Snippets: Insights and Readability dataset (Kaggle) is used as in Chapter 3, now at the snippet level. Labels (Low, Medium, High) are assigned by tertile, maintaining the 70/30 train/test split with the same random seed for comparability.

**Table 4.3: Sample Python code snippets with readability levels (from dataset)**

| Problem Title | Python Code | Readability Score | Level |
|---|---|---|---|
| palindrome number | `class Solution:` `def isPalindrome(self, x):` `return str(x)==str(x)[::-1]` | 5.35 | High |
| single number ii | `class Solution:` `def singleNumber(self, nums):` `res=0` `for i in nums:...` | 4.25 | Medium |
| distance limited paths | `class Solution:` `def distanceLimitedPathsExist(self,n,A,B):` `p=list(range(n))...` | 2.305 | Low |

**Table 4.4: Sample C++ code snippets with readability levels (from dataset)**

| C++ Code | Readability Score | Level |
|---|---|---|
| `class Solution { public: vector<int> twoSum(...) { ... } }` | 6.175 | High |
| `class Solution { public: int checkString(...) { ... } }` | 3.89 | Medium |
| `class Solution { public: int n,p; ... }` | 2.10 | Low |

**Table 4.2: Dataset statistics (snippet level)**

| Language | Low | Medium | High | Total |
|---|---|---|---|---|
| Python | 561 | 560 | 560 | 1,681 |
| C++ | 502 | 500 | 502 | 1,504 |

### 4.12.2 Baselines

Seven machine learning baselines are evaluated: Decision Tree (DT), Logistic Regression (LR), Random Forest (RF), Naïve Bayes (NB), Bayesian Network (BN), Support Vector Machine (SVM), and Neural Network (NN). All baselines are trained on the same CodeBERT embeddings as ECRVR-MVEL, ensuring the comparison isolates the architectural contribution rather than the representation.

### 4.12.3 Evaluation Metrics

Five metrics reported per class and as macro-averages:

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
Precision_c = TP_c / (TP_c + FP_c)
Recall_c = TP_c / (TP_c + FN_c)
F1_c = 2 × Precision_c × Recall_c / (Precision_c + Recall_c)
AUC = Area Under ROC Curve (one-vs-rest)
```

Macro-averaged values weight each class equally, appropriate for the balanced dataset used here.

### 4.12.4 Implementation Environment

ECRVR-MVEL is implemented in Python 3.10 using PyTorch 2.0 for the GCN, DBN, and Bi-TCN components. The Hugging Face Transformers library provides CodeBERT (microsoft/codebert-base, frozen). GCN graph construction uses the NetworkX library. The Nadam optimiser is provided by PyTorch's `torch.optim.NAdam` module. LIME explanations are generated using the `lime` Python package. All experiments run on a single GPU (NVIDIA, 8 GB VRAM). Fixed random seed 42.

---

## 4.13 Results: Python Data

### 4.13.1 Individual Classifier Performance (70% Training)

**Table 4.3: Individual and ensemble results — Python, 70% training**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 91.95 | 88.20 | 87.88 | 87.91 | 90.92 |
| DBN | 94.33 | 91.78 | 91.50 | 91.54 | 93.63 |
| Bi-TCN | 95.41 | 93.33 | 93.10 | 93.14 | 94.83 |
| **WMVE** | **97.11** | **95.68** | **95.64** | **95.65** | **96.73** |

The ensemble (WMVE) outperforms the best individual classifier (Bi-TCN, 95.41%) by 1.70 percentage points in accuracy, with the same pattern holding across all five metrics.

> **[Figure 4.4]** *Confusion matrices and ROC curves for GCN, DBN, Bi-TCN and Ensemble — Python data.*
> *(Insert Figure 4 from Paper 2)*

> **[Figure 4.5]** *Classification results on Python data with 70% training split.*
> *(Insert Figure 5 from Paper 2)*

### 4.13.2 Testing Performance (30% Test)

**Table 4.4: Individual and ensemble results — Python, 30% testing**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 92.87 | 89.77 | 89.37 | 89.34 | 92.01 |
| DBN | 94.46 | 92.08 | 91.66 | 91.76 | 93.74 |
| Bi-TCN | 95.38 | 93.49 | 93.09 | 93.16 | 94.80 |
| **WMVE** | **98.15** | **97.23** | **97.24** | **97.21** | **97.94** |

On the test set, the ensemble advantage grows substantially: WMVE achieves 98.15% versus Bi-TCN's 95.38% — a gap of 2.77 percentage points.

> **[Figure 4.6]** *Classification results on Python data with 30% testing split.*
> *(Insert Figure 6 from Paper 2)*

> **[Figure 4.7]** *Training and validation accuracy curves — ensemble model, Python data.*
> *(Insert Figure 7 from Paper 2)*

> **[Figure 4.8]** *Training and validation loss curves — ensemble model, Python data.*
> *(Insert Figure 8 from Paper 2)* The larger test-set gap compared to training suggests that the ensemble generalises better than any individual classifier, consistent with ensemble learning theory.

### 4.13.3 Per-Class Breakdown — Python Testing (30%)

**Table 4.5: Per-class breakdown — Python, 30% testing**

| Method | Class | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| GCN | Medium | 92.48 | 91.62 | 87.70 | 89.62 | 91.49 |
| GCN | High | 91.88 | 82.61 | 94.41 | 88.12 | 92.55 |
| GCN | Low | 94.26 | 95.07 | 85.99 | 90.30 | 91.99 |
| DBN | Medium | 94.26 | 92.47 | 91.98 | 92.23 | 93.79 |
| DBN | High | 92.48 | 85.14 | 92.55 | 88.69 | 92.49 |
| DBN | Low | 96.63 | 98.61 | 90.45 | 94.35 | 94.94 |
| Bi-TCN | Medium | 95.05 | 94.02 | 92.51 | 93.26 | 94.53 |
| Bi-TCN | High | 93.66 | 86.44 | 95.03 | 90.53 | 94.03 |
| Bi-TCN | Low | 97.43 | 100.00 | 91.72 | 95.68 | 95.86 |
| **WMVE** | **Medium** | **98.42** | **98.91** | **96.79** | **97.84** | **98.08** |
| **WMVE** | **High** | **97.62** | **94.08** | **98.76** | **96.36** | **97.93** |
| **WMVE** | **Low** | **98.42** | **98.69** | **96.18** | **97.42** | **97.80** |

**The High class is the most challenging for individual classifiers.** GCN achieves only 82.61% precision on High; High readability snippets share surface features with Medium ones, but only High snippets consistently use well-named, contextually appropriate identifiers. The GCN's graph-based representation is less sensitive to identifier quality than to structural complexity, causing some High snippets to be misclassified as Medium. The ensemble recovers this: WMVE achieves 94.08% precision on High, gaining over 11 percentage points from the GCN baseline.

**The Low class is the easiest for all classifiers.** Low readability snippets have obvious structural signals — nested loops, complex expressions, single-letter identifiers — that all three architectures capture reliably. WMVE adds 5.97 percentage points of recall, reducing the false-negative rate from 8.28% to 3.82%.

**Medium is the most ambiguous class**, defined residually as snippets that are neither clearly readable nor clearly unreadable. WMVE achieves 98.91% precision for Medium — the highest precision of any class — indicating that when the ensemble commits to a Medium prediction it is almost always correct.

### 4.13.4 Convergence Behaviour

Training and validation accuracy curves show rapid learning in the first 20 epochs, followed by stable convergence. The small, consistent gap between training and validation accuracy confirms good generalisation with no evidence of overfitting. Nadam's Nesterov lookahead allows efficient navigation of the sharp initial loss landscape, explaining the steep accuracy improvement in epochs 1–20. Validation loss curves show smooth monotonic decrease with no spikes or reversals, confirming that weight decay and dropout are sufficient regularisation for the 1,177-example Python training set.

---

## 4.14 Results: C++ Data

**Table 4.6: Individual and ensemble results — C++, 70% training**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 91.06 | 87.73 | 86.60 | 86.52 | 89.96 |
| DBN | 93.73 | 90.73 | 90.55 | 90.56 | 92.93 |
| Bi-TCN | 94.30 | 91.53 | 91.41 | 91.43 | 93.57 |
| **WMVE** | **98.04** | **97.07** | **97.05** | **97.04** | **97.79** |

**Table 4.7: Individual and ensemble results — C++, 30% testing**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 92.77 | 89.89 | 89.23 | 89.21 | 91.88 |
| DBN | 93.07 | 89.81 | 89.83 | 89.62 | 92.33 |
| Bi-TCN | 93.81 | 90.92 | 90.89 | 90.74 | 93.13 |
| **WMVE** | **98.38** | **97.61** | **97.60** | **97.59** | **98.19** |

> **[Figure 4.9]** *Confusion matrices and ROC curves for GCN, DBN, Bi-TCN and Ensemble — C++ data.*
> *(Insert Figure 9 from Paper 2)*

The pattern from Python is replicated for C++, and the ensemble advantage is even larger: WMVE (98.38%) exceeds Bi-TCN (93.81%) by 4.57 percentage points. The larger advantage on C++ reflects the GCN's superior structural discrimination on C++ code, which has more regular dependency patterns due to explicit typing, curly-brace blocks, and stronger naming convention norms. These properties make C++ dependency graphs more predictable, increasing the GCN's discriminative power and — because the GCN brings more orthogonal information relative to Bi-TCN for C++ — amplifying the ensemble gain.

> **[Figure 4.10]** *Classification results on C++ data with 70% training split.*
> *(Insert Figure 10 from Paper 2)*

> **[Figure 4.11]** *Classification results on C++ data with 30% testing split.*
> *(Insert Figure 11 from Paper 2)*

> **[Figure 4.12]** *Training and validation accuracy curves — ensemble model, C++ data.*
> *(Insert Figure 12 from Paper 2)*

> **[Figure 4.13]** *Training and validation loss curves — ensemble model, C++ data.*
> *(Insert Figure 13 from Paper 2)*

**Per-class C++ highlights:** The Low class achieves 99.12% accuracy and 99.30% recall — the highest single-class performance in the entire chapter. C++ Low readability snippets are characterised by dense pointer arithmetic, complex template instantiations, and deeply nested control structures that the GCN captures with high precision. The Medium class shows the largest individual–ensemble gap on C++: GCN achieves only 79.47% recall for Medium (one in five C++ Medium snippets misclassified), while WMVE achieves 96.03% recall. Medium C++ snippets require evidence from all three architectural perspectives to classify reliably, and the ensemble's integrated view is most valuable precisely in these ambiguous cases.

---

## 4.15 Comparative Analysis

**Table 4.8: ECRVR-MVEL vs. baselines — Python**

| Method | Accuracy | Error Rate | Precision | Recall | F1 |
|---|---|---|---|---|---|
| Decision Tree | 60.40 | 39.60 | 77.98 | 78.88 | 83.39 |
| Logistic Regression | 65.10 | 34.90 | 83.59 | 71.08 | 86.93 |
| Random Forest | 69.20 | 30.80 | 77.25 | 74.93 | 90.43 |
| Naïve Bayes | 88.58 | 11.42 | 89.35 | 90.70 | 86.85 |
| Bayesian Network | 87.02 | 12.98 | 85.17 | 83.13 | 76.42 |
| SVM | 89.62 | 10.38 | 88.43 | 76.42 | 76.12 |
| Neural Network | 90.11 | 9.89 | 83.01 | 80.60 | 89.70 |
| **ECRVR-MVEL** | **98.15** | **1.85** | **97.23** | **97.24** | **97.21** |

**Table 4.9: ECRVR-MVEL vs. baselines — C++**

| Method | Accuracy | Error Rate | Precision | Recall | F1 |
|---|---|---|---|---|---|
| Decision Tree | 92.84 | 7.16 | 90.61 | 80.56 | 90.54 |
| Logistic Regression | 69.23 | 30.77 | 69.26 | 83.17 | 91.07 |
| Random Forest | 78.04 | 21.96 | 73.55 | 72.22 | 90.58 |
| Naïve Bayes | 94.58 | 5.42 | 73.54 | 69.54 | 78.37 |
| Bayesian Network | 73.20 | 26.80 | 86.09 | 92.89 | 88.43 |
| SVM | 76.00 | 24.00 | 80.98 | 79.90 | 74.97 |
| Neural Network | 88.58 | 11.42 | 85.35 | 87.77 | 85.78 |
| **ECRVR-MVEL** | **98.38** | **1.62** | **97.61** | **97.60** | **97.59** |

ECRVR-MVEL exceeds the best Python baseline (Neural Network, 90.11%) by 8.04 percentage points and the best C++ baseline (Naïve Bayes, 94.58%) by 3.80 percentage points. The Neural Network baseline (90.11% Python) establishes the single-classifier deep learning ceiling: it uses a fully connected network on the CodeBERT embedding with no structural (GCN), hierarchical probabilistic (DBN), or sequential (Bi-TCN) modelling. ECRVR-MVEL's 8.04-point advantage quantifies exactly the gain from these three architectural additions and their combination.

ECRVR-MVEL's 1.85% error rate on Python means approximately 1 in 54 test snippets is incorrectly classified, versus 1 in 10 for the Neural Network. In a deployment context (a CI/CD readability gate processing hundreds of functions per commit), this five-fold reduction in error rate determines whether the tool is trusted or ignored.

---

## 4.16 LIME Explainability Analysis

> **[Figure 4.14]** *LIME explanations for Python code readability — Low, Medium, High classes.*
> *(Insert Figure 14 from Paper 2)*

> **[Figure 4.15]** *LIME explanations for C++ code readability — Low, Medium, High classes.*
> *(Insert Figure 15 from Paper 2)*

> **[Figure 4.3]** *General architecture of the XAI/LIME technique.*
> *(Insert Figure 3 from Paper 2)*

### 4.16.1 Python Data

**Low readability:** The most positively influential tokens for Low are loop-related tokens (`for`, `while`, deeply nested variable accesses), cryptic variable names (`i`, `j`, `x`), and long arithmetic expressions. The readability composite score also appears as a positive driver but with lower absolute importance than structural tokens.

**High readability:** The most positively influential tokens for High are well-named function identifiers (`isPalindrome`, `missingNumber`, `singleNumber`), short single-operation function bodies, and standard library calls communicating purpose clearly (`sum`, `sorted`, `reversed`).

**Medium:** Medium predictions are driven by intermediate tokens — moderate-length function names, some complexity indicators combined with some clarity indicators. LIME weights are less extreme than for Low and High, reflecting the inherent ambiguity of the middle class.

### 4.16.2 C++ Data

**Low readability:** Template tokens, complex pointer arithmetic (`*`, `**`, `&`), and deeply nested braces are strongly associated with Low readability. Single-letter identifiers when combined with complex expressions drive Low predictions.

**High readability:** C++ functions using STL algorithms with descriptive names (`truncateSentence`, `checkString`, `titleToNumber`) and compact bodies with one return statement receive High predictions with high confidence.

### 4.16.3 Feature-Level Interpretation

**Python findings:** For Low and Medium Python snippets, LIME identifies `MC > 0.24` as a threshold below which snippets are strongly pushed toward Low predictions. This corresponds to identifiers with fewer than 25% recognisable English-word tokens — precisely the domain of single-letter variables and invented abbreviations. The readability composite score also appears as a driver but with lower absolute importance than MC, consistent with the SHAP finding in Chapter 3.

For High Python snippets, MC and PRED (Predictability) become positive drivers. High MC indicates all or nearly all identifier tokens are recognisable words; high PRED indicates consistent naming vocabulary throughout the snippet.

**C++ findings:** PRED is the dominant feature for both Low and High C++ classes, with readability score secondary. Low C++ code mixes domain-specific mathematical abbreviations with general-purpose control flow variables, producing low PRED. For Medium C++ predictions, PRED and readability score are positive drivers while CLS (Cognitive Load Score) exerts a slight negative effect, reflecting that Medium snippets are cognitively borderline. For High C++ predictions, high readability score and high PRED are strongly positive, while SA (Scope Appropriateness) shows a slight negative contribution — C++ High readability snippets tend to be compact algorithms where short loop variables are idiomatically acceptable but SA may flag them as short for their scope.

### 4.16.4 Actionable Guidance

The per-token importance scores provide directly actionable developer guidance:

1. **Identifier tokens with large negative LIME importance** identify specific names reducing readability. A developer who sees that `u`, `v`, `p` are the top negative drivers for a Low prediction knows exactly which variables to rename.
2. **Structural complexity tokens with large negative importance** (nested braces, `while` inside `for`) signal that the problem is structural rather than naming-based. Renaming variables will not help; refactoring into smaller functions is indicated.
3. **The LIME confidence threshold** — requiring P(Low) > 0.9 before flagging — is supported by the 1.85% error rate. At this threshold, approximately 1 in 54 Low-flagged snippets is a false positive, providing a practical quality gate without creating alert fatigue.

### 4.16.5 Convergence with SHAP — Cross-Study Observation

The LIME findings from Study 2 converge with the SHAP findings from Study 1 in the most important respect: in both studies, identifier naming quality — captured by MC and NC in SHAP, and by MC, PRED, and NC feature thresholds in LIME — emerges as the primary driver of readability predictions. This convergence holds across two independent explainability methods, two different classifiers, two levels of analysis, and two programming languages. Its significance for the thesis is discussed in Chapter 6, where it forms the basis of Contribution 5 — the multi-level, explainability-first program comprehension framework.

---

## 4.17 Ablation Study

Four major components of ECRVR-MVEL are ablated to quantify individual contributions.

**Table 4.10: Ablation conditions for ECRVR-MVEL**

| Condition | Description |
|---|---|
| Full ECRVR-MVEL | CodeBERT + GCN + DBN + Bi-TCN + Weighted Majority Vote |
| B1: TF-IDF instead of CodeBERT | TF-IDF 768-dim embeddings replace CodeBERT |
| B2: GCN alone | Only the GCN classifier |
| B3: DBN alone | Only the DBN classifier |
| B4: Bi-TCN alone | Only the Bi-TCN classifier |
| B5: Equal-weight voting | Three classifiers with equal weights (1/3 each) |
| B6: Adam instead of Nadam | Standard Adam optimiser |

**Table 4.11: Ablation results on Python test set (30%)**

| Condition | Accuracy | Precision | Recall | F1 | AUC | Drop |
|---|---|---|---|---|---|---|
| Full ECRVR-MVEL | 98.15% | 97.23 | 97.24 | 97.21 | 97.94 | — |
| B1: TF-IDF | 85.43% | 84.12 | 83.88 | 84.00 | 86.31 | −12.72% |
| B2: GCN alone | 92.87% | 89.77 | 89.37 | 89.34 | 92.01 | −5.28% |
| B3: DBN alone | 94.46% | 92.08 | 91.66 | 91.76 | 93.74 | −3.69% |
| B4: Bi-TCN alone | 95.38% | 93.49 | 93.09 | 93.16 | 94.80 | −2.77% |
| B5: Equal weighting | 96.34% | 95.11 | 95.08 | 95.09 | 96.22 | −1.81% |
| B6: Adam | 97.21% | 96.14 | 96.11 | 96.12 | 97.03 | −0.94% |

**CodeBERT (B1 drop = 12.72 pp):** The largest single ablation confirms that contextual embeddings are the most valuable component. TF-IDF treats each token as independent, losing the relational context that CodeBERT captures. For snippet-level classification, relational context is even more important than for identifier-level: a snippet's readability depends on how its elements relate to each other, not just what they individually say.

**GCN (B2 drop = 5.28 pp):** The GCN contributes the most of the three individual classifiers, consistent with the hypothesis that structural properties — captured by the dependency graph — are strong predictors of snippet-level readability. Complex snippets (many dependencies, deep control flow) tend to be classified as Low readability, and the GCN captures this structural complexity more directly than sequential models.

**DBN (B3 drop = 3.69 pp):** The DBN's hierarchical probabilistic representation contributes less than the GCN but more than the Bi-TCN when used alone. Its advantage is capturing co-occurrence patterns across CodeBERT embedding dimensions, discovering latent features that neither the GCN (structure-focused) nor the Bi-TCN (sequence-focused) represents.

**Bi-TCN (B4 drop = 2.77 pp):** The Bi-TCN performs best among the three individual classifiers (95.38%) yet contributes the smallest marginal gain to the ensemble. This apparent paradox has a clean explanation: the Bi-TCN shares more learned features with the GCN and DBN than those two share with each other. The GCN and DBN bring more orthogonal information to the ensemble even though each achieves lower individual accuracy.

**Equal-weight voting (B5 drop = 1.81 pp):** Replacing learned weights with equal weights (1/3 each) causes a 1.81-point drop, confirming that weight learning adds meaningful value. Learned weights up-weight the Bi-TCN and down-weight the GCN, producing a better-calibrated combination.

**Nadam vs. Adam (B6 drop = 0.94 pp):** The Nesterov modification provides a consistent improvement, most beneficial in the first 30 epochs where the loss landscape has high curvature near the initial parameter configuration.

---

## 4.18 Ensemble Diversity Analysis

Diversity is measured by the pairwise disagreement rate between classifier pairs on the test set:

```
diversity(M_i, M_j) = 1 - (1/N) Σ_{n=1}^{N} 1[pred_i(x_n) == pred_j(x_n)]
```

**Table 4.12: Pairwise diversity on Python test set**

| Pair | Diversity Score | Interpretation |
|---|---|---|
| GCN vs DBN | 0.112 | Disagree on 11.2% of examples |
| GCN vs Bi-TCN | 0.095 | Disagree on 9.5% of examples |
| DBN vs Bi-TCN | 0.073 | Disagree on 7.3% of examples |
| **Mean pairwise diversity** | **0.093** | |

The GCN–DBN pair shows the highest diversity, confirming that graph-based and probabilistic architectures make the most different errors — exactly why their combination provides the largest contribution to ensemble improvement over individual classifiers. The Bi-TCN's lower diversity with both GCN and DBN is consistent with the ablation finding that it contributes the smallest marginal gain: it shares more of its learned features with the other two classifiers.

---

## 4.19 LIME Stability Analysis

LIME's known limitation is sampling instability — stochastic neighbourhood generation may produce different importance scores on successive runs. Stability was assessed by running LIME 10 times on each of 50 randomly selected test examples and computing average rank correlation (Spearman ρ) between successive runs for the top-5 most important tokens.

**Table 4.13: LIME stability across 10 runs**

| Metric | Python | C++ |
|---|---|---|
| Mean Spearman ρ (top-5 tokens) | 0.84 | 0.81 |
| Standard deviation of ρ | 0.09 | 0.11 |
| % runs where top-3 tokens unchanged | 79.2% | 74.6% |

The mean rank correlation of 0.84 indicates good stability: top-5 influential tokens are consistently identified across runs even if exact scores fluctuate. The top token (most influential) was the same across all 10 runs in 91.4% of Python examples and 87.2% of C++ examples. This level of stability is sufficient for practical use — a developer seeing the LIME explanation can trust that the top drivers are genuine rather than sampling artifacts.

---

## 4.20 Qualitative Examples

### 4.20.1 High Readability: Two-Line Python Solution

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        return str(x) == str(x)[::-1]
```

**Composite readability score:** 5.35 — High. **ECRVR-MVEL prediction:** High (P = 0.983).

**LIME top drivers:** `isPalindrome` (+0.31), `str` (+0.12), `return` (+0.08), `class Solution` (+0.06).

The LIME analysis correctly identifies `isPalindrome` as the dominant positive driver. When `isPalindrome` is removed in a LIME perturbation, the prediction shifts substantially toward Medium, confirming that identifier naming is the primary readability signal at this abstraction level — even in a two-line function.

### 4.20.2 Low Readability: Complex Multi-Loop Solution

```python
class Solution:
    def distanceLimitedPathsExist(self, n, A, B):
        p = list(range(n))
        def find(x):
            while p[x] != x:
                p[x] = p[p[x]]
                x = p[x]
            return x
        def union(x, y):
            p[find(x)] = find(y)
        A.sort(key=lambda x: x[2])
        B = sorted(enumerate(B), key=lambda x: x[1][2])
        res = [False] * len(B)
        i = 0
        for j, (idx, (u, v, w)) in enumerate(B):
            while i < len(A) and A[i][2] < w:
                union(A[i][0], A[i][1])
                i += 1
            res[idx] = find(u) == find(v)
        return res
```

**Readability score:** 2.305 — Low. **ECRVR-MVEL prediction:** Low (P = 0.997).

**LIME top drivers:** Single-letter parameters `u`, `v`, `w` (−0.28), nested loop structure (−0.19), lambda with `x` (−0.14), `find` with single-letter argument (−0.12).

This snippet implements a Union-Find algorithm, algorithmically correct but genuinely low readability. LIME correctly identifies the single-letter variables as the primary readability problem — not the algorithm's complexity, but the identifier choices. Single letters `p`, `u`, `v`, `w`, `i`, `j` provide no semantic information; the nested `find` definitions create complex scope; and the sort key lambda reuses `x` in a context where `x` already means something different in the enclosing function.

### 4.20.3 Ensemble Disagreement Cases

**Case 1: GCN predicts Medium, DBN and Bi-TCN predict High → Ensemble correctly predicts High (P = 0.763).** The snippet contains a clean recursive function with descriptive names but uses a graph-theoretic algorithm (DFS). The GCN detects recursive function calls as complexity signals, pulling toward Medium. DBN and Bi-TCN recognise the clean naming and short length as High signals. The ensemble's down-weighting of the GCN allows the majority signal to prevail — correctly.

**Case 2: Bi-TCN predicts High, GCN and DBN predict Low → Ensemble correctly predicts Low (P = 0.681).** The snippet uses standard Python library calls (`heapq.heappush`, `sorted`) creating a recognisable sequential pattern, causing the Bi-TCN to predict High. But variable names are entirely single-letter (`d`, `u`, `v`, `pq`) and the dependency graph is dense. The GCN and DBN correctly identify these as Low signals. The ensemble produces the correct Low prediction because two of three classifiers agree and the identifier-naming evidence outweighs the sequential familiarity signal.

These cases illustrate the complementary strengths of the three architectures and the practical value of ensemble voting over any individual classifier.

---

## 4.21 Chapter Summary

This chapter presented ECRVR-MVEL, a five-stage framework for snippet-level code readability classification operating at the second level of the multi-level program comprehension hierarchy introduced in Chapter 1.

The technical architecture combines four major contributions. First, CodeBERT vector representations encode the full semantic and structural content of a code snippet into a 768-dimensional vector. Second, three structurally diverse classifiers — a GCN processing code dependency structure, a DBN capturing hierarchical probabilistic co-occurrence patterns, and a Bi-TCN modelling token sequences in both directions — learn complementary views of the readability signal. Third, a Weighted Majority Voting Ensemble combines classifiers with learned weights, exploiting low error correlation to achieve higher accuracy than any single model. Fourth, LIME explainability translates ensemble predictions into token-level importance scores identifying which specific identifiers and structural tokens drive each readability verdict.

Experimental results confirm the ensemble's effectiveness. ECRVR-MVEL achieves 98.15% test accuracy for Python and 98.38% for C++ — exceeding the best published baseline (Neural Network: 90.11% Python; Naïve Bayes: 94.58% C++) by 8.04 and 3.80 percentage points respectively, and exceeding the best individual classifier (Bi-TCN) by 2.77 and 4.57 percentage points. The ablation study confirmed that CodeBERT provides the largest single contribution (12.72 pp), the GCN contributes the most of the three classifiers (5.28 pp marginal contribution), and weighted combination outperforms equal weighting by 1.81 pp. LIME stability analysis confirmed that explanations are reliable enough for practical deployment (mean rank correlation 0.84).

The LIME analysis reveals that Meaningful Clarity, Predictability, and Naming Conformance are the primary drivers of readability predictions at the snippet level — features designed for identifier assessment in Chapter 3 that independently resurface as snippet-level signals in a completely different model using a completely different explainability method. This cross-study convergence is the thesis's most significant empirical finding and is analysed in depth in Chapter 6.

Chapter 5 extends the analysis beyond code to the developer who writes it, presenting EESQA-DELMOA — a system for classifying developer experience level from observable activity features.

---

*End of Chapter 4*
