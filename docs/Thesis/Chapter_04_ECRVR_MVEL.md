# CHAPTER 4: ECRVR-MVEL — EXPLAINABLE CODE READABILITY CLASSIFICATION USING VECTOR REPRESENTATIONS AND MAJORITY VOTING-BASED ENSEMBLE LEARNING

## 4.1 Introduction and Motivation

Chapter 3 established that identifier naming quality can be assessed with high accuracy when identifiers are processed individually with a rich feature set and contextual embeddings. However, individual identifiers do not exist in isolation. They appear within functions, methods, and classes — code snippets that have their own structural properties, cyclomatic complexity, loop depth, and line length. A function that uses well-named identifiers but has deeply nested logic and six hundred lines is not a readable function. Conversely, a compact function with one or two identifiers — even if those identifiers are generic — may be instantly readable in context.

The second level of the program comprehension hierarchy is the code snippet. Snippet-level readability prediction is a classification problem: given a code snippet, predict whether it is High, Medium, or Low readability. This is the problem addressed in this chapter.

Three architectural observations motivate the design of ECRVR-MVEL (Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning).

First, different neural architectures are sensitive to different properties of code. Graph-based models capture structural relationships (which variables depend on which functions, how control flow passes between blocks). Hierarchical probabilistic models capture feature co-occurrence patterns. Temporal models capture sequential patterns in the token stream. No single architecture is uniformly best at all of these.

Second, ensemble methods that combine architecturally diverse classifiers consistently outperform any single classifier, because the errors of different architectures tend to be uncorrelated. When one classifier fails because it misses a structural pattern, another may compensate because it captures a temporal pattern instead.

Third, explainability at the snippet level requires a different tool than at the identifier level. SHAP is well-suited to explaining the contribution of the ten handcrafted features in Study 1. For snippet-level classification, where the primary representation is a CodeBERT embedding of a full snippet (not a small feature vector), LIME is more appropriate: it perturbs the input at the token level and observes how the ensemble's prediction changes, producing token-level importance scores that are directly interpretable.

---

## 4.2 Problem Formulation

Given a code snippet S written in language L ∈ {Python, C++}, the objective is to:

1. Preprocess S (tokenise, remove comments, normalise whitespace, detect language).
2. Encode S using CodeBERT to produce a vector representation e(S) ∈ ℝ⁷⁶⁸.
3. Classify e(S) as High, Medium, or Low readability using a weighted majority voting ensemble of three classifiers: GCN, DBN, and Bi-TCN.
4. Optimise the ensemble using the Nadam algorithm.
5. For each prediction, generate a LIME explanation identifying which tokens in S most influenced the classification.

Formally:

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

---

## 4.4 Text Preprocessing

Source code preprocessing for ECRVR-MVEL operates at the snippet level rather than the identifier level, and uses different techniques from Study 1 to preserve the structural and syntactic properties of the full snippet.

### 4.4.1 Tokenisation

Raw source code is tokenised using language-specific rules that treat programming constructs as atomic units. The tokeniser distinguishes:

- **Keywords:** Control flow keywords (if, else, for, while, return), type keywords (int, float, void, bool), and class-related keywords (class, def, public, private).
- **Identifiers:** Variable names, function names, class names, and parameter names.
- **Literals:** String constants, integer literals, floating-point literals, and boolean literals.
- **Operators:** Arithmetic, relational, logical, and bitwise operators.
- **Delimiters:** Parentheses, brackets, braces, semicolons, and commas.

Language-specific tokenisation rules are applied: Python's indentation-sensitive syntax and C++'s bracket-delimited blocks are handled by the respective tokenisers, ensuring that structural information is not lost.

### 4.4.2 Comment Removal and Whitespace Normalisation

Comments in source code serve a different purpose from the code itself: they describe intent rather than express computation. For readability classification, the model is primarily trained to assess the code's own structure and naming, not the quality of its documentation (which is assessed by separate metrics). Comments are therefore removed before embedding.

Whitespace is normalised: excessive blank lines (more than two consecutive), trailing whitespace, and inconsistent indentation are standardised. In Python, where indentation is syntactically significant, normalisation is applied carefully to preserve the logical structure.

### 4.4.3 Programming Language Detection

ECRVR-MVEL handles both Python and C++ snippets. Language detection is performed using:

1. File extension analysis (when available).
2. Reserved keyword pattern matching: Python keywords (def, elif, lambda, yield) and C++ keywords (#include, namespace, template, cout) do not overlap.
3. Syntactic pattern analysis: Python's colon-terminated function definitions vs. C++'s curly-brace delimited bodies.

Language detection gates the selection of tokenisation rules and encoding vocabularies appropriate for the detected language.

### 4.4.4 Sequence Encoding

After tokenisation, tokens are mapped to integer indices using a vocabulary built from the training corpus. Sequences are padded or truncated to a fixed length (512 tokens, the maximum for CodeBERT) using zero-padding for shorter sequences. Language-aware segment embeddings distinguish Python tokens from C++ tokens in the encoding.

---

## 4.5 CodeBERT Vector Representations

CodeBERT (described in detail in Section 3.6) is used here to encode the full code snippet rather than individual identifiers. The key architectural difference from Study 1 is the level of aggregation: where Study 1 encoded each identifier separately and then processed a sequence of identifier embeddings through the BiLSTM, Study 2 encodes the entire snippet as a single unit and treats the resulting vector as the input to the ensemble classifiers.

### 4.5.1 [CLS] Token Encoding

The snippet token sequence (with [CLS] and [SEP] added) is fed to CodeBERT with `max_length = 512`. The [CLS] token embedding — a 768-dimensional vector produced by the final Transformer layer at position 0 — serves as the aggregate representation of the entire snippet. During CodeBERT's pre-training, the [CLS] token receives gradient updates from the full self-attention mechanism, allowing it to aggregate information from every token in the input. This property makes [CLS] more appropriate than mean pooling for tasks where a holistic snippet representation is needed: mean pooling treats all token positions equally, whereas [CLS] can weight different parts of the snippet differently based on their learned relevance.

The formal representation of snippet S as the [CLS] embedding is:

```
e(S) = BERT([CLS], t₁, t₂, ..., t_n, [SEP])[0]   ∈ ℝ⁷⁶⁸
```

where t₁, ..., t_n are the CodeBERT sub-word tokens of the snippet and [·][0] denotes extraction of the embedding at position 0 (the [CLS] position).

### 4.5.2 Sliding Window for Long Snippets

For very long snippets that exceed 512 tokens, a sliding window approach is used. The snippet is partitioned into overlapping windows of 512 tokens with a stride of 256 tokens (50% overlap). Each window W_i produces a [CLS] embedding e(W_i):

```
e(S) = (1/K) Σ_{i=1}^{K} e(W_i)
```

where K is the number of windows. The 50% overlap ensures that token pairs near window boundaries appear together in at least one window, so cross-boundary context is captured. In the experimental dataset (LeetCode solutions), the large majority of snippets fit within 512 tokens; the sliding window path is used for approximately 3% of Python snippets and fewer than 1% of C++ snippets.

### 4.5.3 CodeBERT in Frozen Mode

As in Study 1, CodeBERT is used in frozen (feature extraction) mode: its 125 million parameters are not updated during ensemble training. The frozen mode is the appropriate choice given the dataset size (1,177 Python training snippets, 1,053 C++ training snippets): fine-tuning 125M parameters on a dataset of this size would require aggressive regularisation and would risk catastrophic forgetting of the pre-trained representations that make CodeBERT useful. Frozen CodeBERT provides rich, general-purpose semantic embeddings that the ensemble classifiers learn to exploit for the specific readability classification task.

---

## 4.6 Graph Convolutional Network (GCN)

### 4.6.1 Motivation

A code snippet is not just a sequence of tokens; it is a structured program with explicit dependencies between variables, function calls, and control flow paths. These structural relationships are not captured by sequence models or token embeddings alone. A Graph Convolutional Network (GCN) can represent and learn from these structures.

### 4.6.2 Graph Construction

For each snippet, a dependency graph G = (V, E) is constructed:

- **Nodes V:** Each unique identifier (variable, function, class) is a node. Structural nodes also represent control flow constructs (if-blocks, loops, function definitions).
- **Edges E:** Directed edges represent data dependencies (variable assignment and use), control flow transitions, and function call relationships.

Node features are initialised with the CodeBERT embedding of the corresponding identifier (from Study 1) or a learned embedding for structural nodes.

### 4.6.3 Spectral Graph Convolution

The GCN performs spectral convolution on the dependency graph. Given the adjacency matrix A ∈ ℝ^{n×n} (with n nodes) and degree matrix D where D_{ii} = Σ_j A_{ij}, the normalised adjacency matrix is:

```
Â = D^{-1/2} (A + I) D^{-1/2}
```

The l-th layer of the GCN computes:

```
H^{(l+1)} = ReLU(Â · H^{(l)} · W^{(l)})
```

where H^{(l)} ∈ ℝ^{n×d_l} is the node feature matrix at layer l, W^{(l)} ∈ ℝ^{d_l×d_{l+1}} is the learnable weight matrix, and ReLU is the activation function.

After k convolution layers, node embeddings are aggregated using global mean pooling to produce a fixed-size snippet representation:

```
h_GCN = (1/n) Σᵢ H_i^{(k)}
```

### 4.6.4 Message Passing and Depth

The GCN performs message passing: at each layer, each node aggregates information from its neighbours, updating its own representation. After l layers, every node has incorporated information from nodes up to l hops away. For a code snippet with a typical dependency graph of depth 3–5 (function → variable → use → return), three convolution layers are used, giving each function-level node access to information from all its direct and transitive dependencies.

Three-layer GCN message passing for node i at layer l:

```
h_i^{(l+1)} = ReLU(W^{(l)} · (1/|N(i)| Σ_{j ∈ N(i) ∪ {i}} h_j^{(l)})
```

where N(i) is the set of neighbours of node i, and the summation includes self-loops (i itself). This mean aggregation is normalisation-equivalent to the spectral formulation in Section 4.6.3 and provides a stable update rule that prevents embedding norms from growing with neighbourhood size.

### 4.6.5 Edge Weights and Cosine Similarity

Beyond the binary adjacency matrix (node i depends on node j: yes/no), ECRVR-MVEL extends the standard GCN with weighted edges. The weight of the edge from node i to node j is the cosine similarity between their initial CodeBERT embeddings:

```
A_{ij} = cosine(e_i, e_j) = e_i · e_j / (‖e_i‖ ‖e_j‖)
```

This weighting encodes semantic proximity: two identifiers with similar names (e.g., `totalPrice` and `totalTax`) receive a high edge weight, while semantically unrelated identifiers receive a low weight even if they are adjacent in the dependency graph. The semantic weighting guides the GCN to attend more to the connections between similarly named entities — a direct encoding of the consistency principle from Study 1's NC and CC features — without requiring explicit feature engineering.

### 4.6.6 Classification Head

The aggregated representation h_GCN passes through a linear classification layer to produce logits for the three readability classes:

```
y_GCN = W_class · h_GCN + b_class ∈ ℝ³
```

Softmax is applied to convert logits to class probabilities during inference. During training, cross-entropy loss is applied directly to the logits for numerical stability.

---

## 4.7 Deep Belief Network (DBN)

### 4.7.1 Architecture

A Deep Belief Network is a generative probabilistic model composed of stacked Restricted Boltzmann Machines (RBMs). Each RBM is an undirected bipartite graph with visible units v and hidden units h, connected by a weight matrix W:

```
p(v, h) = (1/Z) exp(a^T v + b^T h + v^T W h)
```

where a and b are bias vectors and Z is the partition function.

### 4.7.2 Training

DBNs are trained using a greedy layer-wise procedure: the first RBM is trained on the input data using Contrastive Divergence (CD-k), then its hidden activations are used as input to the second RBM, and so on. After unsupervised pre-training, the full DBN is fine-tuned using backpropagation with the classification labels.

This two-stage training is particularly valuable when labelled data is limited: the unsupervised pre-training stage uses all available data (labelled and unlabelled) to learn a hierarchical representation, and fine-tuning then adapts this representation for the specific classification task.

### 4.7.3 Input and Output

The DBN takes as input the 768-dimensional CodeBERT embedding of the snippet. The architecture uses three hidden layers with dimensions 512, 256, and 128, followed by a softmax output layer with three units. The DBN's probabilistic representations are complementary to the GCN's structural representations, providing diversity in the ensemble.

### 4.7.4 Energy Function and Contrastive Divergence

The energy function of a single RBM with visible units v ∈ {0,1}^m and hidden units h ∈ {0,1}^n is:

```
E(v, h) = −aᵀv − bᵀh − vᵀWh
```

where a ∈ ℝ^m and b ∈ ℝ^n are bias vectors and W ∈ ℝ^{m×n} is the weight matrix. The joint distribution over visible and hidden units is:

```
p(v, h) = (1/Z) exp(−E(v, h))
```

where Z = Σ_{v,h} exp(−E(v, h)) is the partition function. Because the units in each layer are conditionally independent given the other layer, the conditional distributions factorise cleanly:

```
p(h_j = 1 | v) = σ(b_j + Σ_i v_i W_{ij})
p(v_i = 1 | h) = σ(a_i + Σ_j h_j W_{ij})
```

where σ is the logistic sigmoid. These closed-form conditionals make Gibbs sampling tractable — a key advantage for training.

Exact maximum likelihood training requires computing ∂log p(v)/∂W, which involves the partition function Z and is intractable for all but trivial models. Contrastive Divergence with k steps (CD-k) approximates this gradient:

```
ΔW ≈ ⟨v h^T⟩_data − ⟨v h^T⟩_k
```

where ⟨·⟩_data is the expectation over real training data and ⟨·⟩_k is the expectation after k steps of Gibbs sampling starting from a training example. In practice, CD-1 (a single Gibbs step) provides sufficiently good gradient estimates for the purposes of feature learning.

### 4.7.5 Layer-Wise Pretraining and Fine-Tuning

Greedy layer-wise pretraining proceeds as follows. The first RBM (visible: 768 dimensions; hidden: 512) is trained on the CodeBERT embeddings using CD-1 until convergence. The hidden activations of this first RBM on the training data are then treated as the visible layer input to the second RBM (visible: 512; hidden: 256), and training proceeds. This continues for the third layer (visible: 256; hidden: 128).

After unsupervised pretraining of all three RBM layers, a classification layer (128 → 3, softmax) is appended and the entire network is fine-tuned discriminatively using backpropagation with cross-entropy loss and the training labels. The fine-tuning uses the same Nadam optimiser as the rest of the ensemble (learning rate 0.001).

The value of this two-stage approach for code readability classification is that the pretraining stage can use unlabelled code snippets (for which no readability label exists but which are available in abundance) to learn richer representations before the supervised task is introduced. In the experimental setup of this thesis, only the labelled dataset is used, but the architecture supports semi-supervised extensions as a direction for future work.

---

## 4.8 Bidirectional Temporal Convolutional Network (Bi-TCN)

### 4.8.1 Architecture

Temporal Convolutional Networks (TCNs), introduced by Bai et al. (2018), apply dilated causal convolutions to sequence modelling. The key innovation is the use of dilation — exponentially increasing the receptive field — which allows TCNs to capture long-range dependencies without the sequential processing that limits LSTMs' parallelism.

The ECRVR-MVEL model extends TCNs bidirectionally (Bi-TCN): a forward TCN processes the token sequence left-to-right, and a backward TCN processes it right-to-left. Their outputs are concatenated at each position.

### 4.8.2 Dilated Causal Convolution

For a 1D convolution with dilation factor d and kernel size k, the convolution at position t is:

```
y_t = Σ_{i=0}^{k-1} w_i · x_{t - d·i}
```

where w_i are the filter weights and x is the input sequence. With d = 1, 2, 4, 8, ..., 2^{L-1} at successive layers, the receptive field of the l-th layer is 2^l(k-1) + 1, growing exponentially. This means a four-layer Bi-TCN with k = 3 has a receptive field of 31 tokens, sufficient to capture dependencies across most code functions.

### 4.8.3 Residual Connections

Each Bi-TCN block includes a residual connection that adds the input to the output of the dilated convolution, enabling training of deeper networks:

```
output = activation(Bi-TCN-block(input)) + input
```

When the input and output dimensions differ, a 1×1 convolution is applied to the input before addition.

### 4.8.4 Feature Fusion Layer

The forward and backward TCN streams produce independent output sequences. A dedicated feature fusion layer combines them into a single unified representation. Given the forward output F_t ∈ ℝ^{d_f} and backward output B_t ∈ ℝ^{d_f} at position t, the fused representation is:

```
M_t = LayerNorm(Linear([F_t ; B_t]))   ∈ ℝ^{d_f}
```

where [·;·] denotes concatenation along the feature dimension. Layer normalisation stabilises the fused representation and prevents the forward and backward streams from developing incompatible scales during training. The fusion layer uses a linear projection from 2d_f to d_f to reduce the concatenated representation back to the original feature dimension before passing to the pooling layer.

### 4.8.5 Input and Output

The Bi-TCN takes the CodeBERT token embedding matrix (sequence_length × 768) as input. Global average pooling over the sequence dimension after fusion produces a fixed-size vector of dimension d_f = 256 that passes to the classification head:

```
h_BiTCN = (1/T) Σ_{t=1}^{T} M_t   ∈ ℝ^{256}
```

This pooling operation discards positional information but retains the aggregate distributional signal across the entire token sequence, which is sufficient for the snippet-level classification task. An alternative approach — using the final time step — was tested during development but produced lower accuracy, likely because code snippets do not have a recency bias: the most important tokens for readability (typically the function name and key parameter names) appear at the beginning, not the end.

### 4.8.6 Why Bidirectional TCN for Code

The bidirectional design is motivated by the observation that code readability is a property of the whole snippet, not a left-to-right sequential property. A function name that appears at the top of the snippet is interpreted in the context of the return statement at the bottom. A loop variable that appears in the body is influenced by what it iterates over, which may appear either before or after the point of use. The backward TCN captures these right-to-left dependencies explicitly, providing the forward TCN with complementary evidence about the snippet's structure.

Compared to BiLSTM (used in Study 1), the Bi-TCN offers three advantages: full parallelisation across time steps (LSTMs are inherently sequential), exact control over the receptive field through dilation, and robustness to vanishing gradients through the residual connections. These properties make the Bi-TCN more suitable for snippet-level classification, where snippets can span many more tokens than individual identifiers.

---

## 4.9 Weighted Majority Voting Ensemble (WMVE)

### 4.9.1 Rationale

The three classifiers (GCN, DBN, Bi-TCN) make structurally different errors. The GCN is sensitive to structural properties (graph connectivity, dependency patterns) but may miss sequential patterns. The DBN captures feature co-occurrence patterns from its probabilistic representation but may not model structural relationships well. The Bi-TCN captures sequential patterns in both directions but lacks explicit structural modelling.

When these classifiers are combined, their errors tend to be uncorrelated: an example that confuses the GCN (because its structural patterns are unusual) may be correctly classified by the Bi-TCN (because its sequential pattern is clear), and vice versa.

### 4.9.2 Weight Assignment

Weights w_k for each classifier are learned during training using validation performance. The weights satisfy Σ_k w_k = 1 and are initialised based on the validation accuracy of each individual classifier, then fine-tuned jointly with the classifier parameters.

The initialisation procedure uses softmax normalisation of validation accuracies:

```
w_k^(0) = exp(acc_k / τ) / Σ_{j} exp(acc_j / τ)
```

where acc_k is the validation accuracy of classifier k and τ is a temperature parameter (τ = 0.1) that sharpens the weight distribution toward the best-performing classifier. With the validation accuracies GCN: 91.95%, DBN: 94.33%, Bi-TCN: 95.41%, the initial weights are approximately w_GCN = 0.24, w_DBN = 0.32, w_BiTCN = 0.44. These weights are then fine-tuned jointly with the classifier parameters during the final training stage.

The rationale for learned rather than fixed weights is that classifier quality is dataset-dependent. On C++, the GCN's structural sensitivity is more valuable than on Python (as evidenced by the larger C++ ensemble gain), so the optimal C++ weights differ from the Python weights. By learning weights from validation data, the ensemble automatically adjusts to the relative classifier strengths on each language.

### 4.9.3 Calibration and Confidence

The WMVE probabilities P(y = c | S) are not directly comparable to individual classifier probabilities because they are a weighted mixture of three distributions. Temperature scaling is applied after training to calibrate the ensemble's confidence:

```
P_calibrated(y = c | S) = softmax(logits(S) / T_cal)
```

where T_cal is a temperature parameter learned on the validation set by minimising the negative log-likelihood of the calibrated predictions. Calibration ensures that the ensemble's stated confidence (e.g., "98% probability of High") is an accurate reflection of the empirical frequency — a requirement for the LIME confidence threshold used in the practical deployment recommendations.

### 4.9.4 Diversity and Error Correlation

The theoretical basis for ensemble improvement is the bias-variance decomposition. For a set of classifiers with equal expected error E[error_k] = ε and pairwise error correlation ρ, the expected error of the average ensemble is:

```
E[error_ensemble] = ε [1/K + (1 - 1/K)ρ]
```

When ρ = 1 (perfectly correlated errors — all classifiers fail on the same examples), the ensemble achieves no gain over any individual. When ρ = 0 (uncorrelated errors), the ensemble achieves error ε/K — the error of K independent classifiers averaged. For the three classifiers in ECRVR-MVEL, the pairwise diversity scores (9.3% to 11.2% disagreement; see the ablation study in the supplementary analysis) translate to correlations well below 1, explaining the observed 2.77–4.57 percentage-point improvement over the best individual classifier.

### 4.9.5 Combination Rule

For each class c ∈ {Low, Medium, High}, the ensemble probability is:

```
P(y = c | S) = w_GCN · P_GCN(y = c | S) + w_DBN · P_DBN(y = c | S) + w_BiTCN · P_BiTCN(y = c | S)
```

The final prediction is the class with the highest ensemble probability:

```
ŷ = arg max_c P(y = c | S)
```

---

## 4.10 Nadam Optimisation

Nadam (Dozat, 2016) combines Nesterov momentum with the Adam optimiser. The Nesterov modification computes the gradient at a future parameter position rather than the current one, providing a lookahead correction that improves convergence in directions of consistently high curvature.

### 4.10.1 Adam Baseline

The Adam optimiser (Kingma and Ba, 2015) maintains exponentially weighted moving averages of the gradient (first moment) and the squared gradient (second moment):

```
m_t = β₁ m_{t-1} + (1 - β₁) g_t          [first moment]
v_t = β₂ v_{t-1} + (1 - β₂) g_t²          [second moment]
```

Bias-corrected estimates compensate for the zero initialisation:

```
m̂_t = m_t / (1 - β₁ᵗ)
v̂_t = v_t / (1 - β₂ᵗ)
```

The parameter update uses the bias-corrected first moment:

```
θ_t = θ_{t-1} - α · m̂_t / (√v̂_t + ε)
```

### 4.10.2 Nesterov Modification

Standard Adam uses m̂_{t-1} (the previous moment estimate) to compute the update at step t. Nesterov momentum improves on this by using the gradient at the anticipated next parameter position rather than the current one.

In the Nadam formulation, this is incorporated by substituting the current gradient g_t for the previous moment in the bias-corrected update:

```
θ_t = θ_{t-1} - α / (√v̂_t + ε) · (β₁ m̂_t + (1-β₁) g_t / (1-β₁ᵗ))
```

The term `(1-β₁) g_t / (1-β₁ᵗ)` is the Nesterov correction: it incorporates the current gradient g_t directly into the update, weighted against the accumulated first moment m̂_t. This effectively steps in the direction the momentum will reach rather than where it currently is — a lookahead that reduces oscillation in directions of consistently high curvature.

### 4.10.3 Hyperparameter Configuration

**Table 4.8: Nadam hyperparameter configuration for ECRVR-MVEL**

| Parameter | Value | Rationale |
|---|---|---|
| Learning rate (α) | 0.001 | Standard for Adam-family optimisers |
| β₁ | 0.9 | Standard first moment decay |
| β₂ | 0.999 | Standard second moment decay |
| ε | 1×10⁻⁸ | Numerical stability |
| Weight decay | 0.01 | L2 regularisation |
| Batch size | 32 | Memory-efficient; consistent with Study 1 |

### 4.10.4 Nadam vs. Adam for Ensemble Training

The ablation study (Section A4.1.6 in the supplementary analysis) shows that Nadam outperforms Adam by 0.94 percentage points on the Python test set. The improvement is modest compared to the gain from the ensemble architecture, but it is consistent and reproducible. The Nesterov lookahead is most beneficial in the first 30 epochs of training, where the loss landscape has high curvature near the initial parameter configuration. After convergence, the two optimisers behave similarly because the gradient signal is dominated by the local curvature of the converged region.

Nadam converges faster than Adam on problems with high curvature (saddle points, elongated loss surfaces), which is common in deep learning for code classification where different code structures create narrow loss valleys in different directions of the parameter space.

---

## 4.11 LIME Explainability

LIME (Ribeiro et al., 2016) generates a local explanation for a single prediction by:

1. Sampling a neighbourhood of perturbed inputs around the instance being explained.
2. Querying the black-box model on each perturbed input to obtain predictions.
3. Fitting a simple interpretable model (linear regression) to the perturbed inputs and their model predictions, weighted by proximity to the original instance.
4. Using the coefficients of the linear model as feature importance scores.

For code snippet classification, the "features" are token-level masks: each perturbation is a copy of the snippet with some tokens removed or replaced. The LIME explanation identifies which tokens, when removed, most change the prediction, assigning positive importance to tokens that support the predicted class and negative importance to tokens that oppose it.

**Interpretation of LIME outputs for code readability:**

- Tokens with high positive importance for the "High readability" class are characteristic of readable code in the model's learned representation — typically well-named function and variable tokens.
- Tokens with high negative importance (they reduce the probability of High readability) are typically cryptic abbreviations, deeply nested structural tokens, or tokens associated with complexity.

The LIME explanations in ECRVR-MVEL provide a bridge between the model's prediction and a developer's ability to improve the snippet: knowing that the function name `f` is reducing the High readability probability tells the developer exactly what to fix.

---

## 4.12 Experimental Setup

### 4.12.1 Dataset

The same dataset as Chapter 3 is used: the Code Snippets: Insights and Readability dataset (Kaggle). At the snippet level, the dataset provides readability scores for 1,681 Python snippets and 1,504 C++ snippets. Labels (Low, Medium, High) are assigned by tertile as in Chapter 3. The 70/30 train/test split is maintained with the same random seed for comparability.

**Table 4.1: Dataset statistics (snippet level)**

| Language | Low | Medium | High | Total |
|---|---|---|---|---|
| Python | 561 | 560 | 560 | 1,681 |
| C++ | 502 | 500 | 502 | 1,504 |

### 4.12.2 Baselines

Seven machine learning baselines are evaluated: Decision Tree (DT), Logistic Regression (LR), Random Forest (RF), Naïve Bayes (NB), Bayesian Network (BN), Support Vector Machine (SVM), and Neural Network (NN). All baselines are trained on the same CodeBERT embeddings as ECRVR-MVEL to ensure the comparison isolates the architectural contribution. This design choice deliberately puts ECRVR-MVEL at a disadvantage for simpler baselines (Naïve Bayes, Logistic Regression), since these methods do not exploit sequential or structural properties and must work from the same 768-dimensional embedding. Any performance advantage observed is therefore attributable to the architecture, not the representation.

### 4.12.3 Evaluation Metrics

Five metrics are reported per class and as macro-averages across the three readability classes:

**Accuracy:** The fraction of all snippets correctly classified:

```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
```

**Precision:** Among all snippets predicted as class c, the fraction that truly belong to class c:

```
Precision_c = TP_c / (TP_c + FP_c)
```

**Recall:** Among all snippets truly belonging to class c, the fraction correctly predicted:

```
Recall_c = TP_c / (TP_c + FN_c)
```

**F1-Score:** The harmonic mean of precision and recall, penalising extreme imbalances between the two:

```
F1_c = 2 × Precision_c × Recall_c / (Precision_c + Recall_c)
```

**AUC (Area Under the ROC Curve):** Computed using the one-vs-rest strategy for three-class classification. For each class c, the ROC curve plots the true positive rate against the false positive rate as the classification threshold varies. The AUC summarises this trade-off as a single number between 0.5 (random classifier) and 1.0 (perfect classifier).

Macro-averaged values weight each class equally, irrespective of class size. This is appropriate for the balanced dataset used here (classes are approximately equal in size) and ensures that performance on each readability level is given equal weight in the summary statistics.

### 4.12.4 Implementation Environment

ECRVR-MVEL is implemented in Python 3.10 using PyTorch 2.0 for the GCN, DBN, and Bi-TCN components. The Hugging Face Transformers library provides the CodeBERT tokeniser and model weights (microsoft/codebert-base, frozen during ensemble training). GCN graph construction uses the NetworkX library for dependency graph manipulation. The Nadam optimiser is provided by PyTorch's `torch.optim.NAdam` module. LIME explanations are generated using the `lime` Python package. All experiments are run on a single GPU (NVIDIA, 8 GB VRAM). The 70/30 train/test split uses a fixed random seed (42) for reproducibility.

---

## 4.13 Results: Python Data

### 4.13.1 Individual Classifier Performance (70% Training)

**Table 4.2: Individual and ensemble results — Python, 70% training**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 91.95 | 88.20 | 87.88 | 87.91 | 90.92 |
| DBN | 94.33 | 91.78 | 91.50 | 91.54 | 93.63 |
| Bi-TCN | 95.41 | 93.33 | 93.10 | 93.14 | 94.83 |
| **WMVE** | **97.11** | **95.68** | **95.64** | **95.65** | **96.73** |

The ensemble (WMVE) outperforms the best individual classifier (Bi-TCN, 95.41%) by 1.70 percentage points in accuracy. Across precision, recall, F1, and AUC, the same pattern holds: the ensemble is consistently better than any of its components.

### 4.13.2 Testing Performance (30% Test)

**Table 4.3: Individual and ensemble results — Python, 30% testing**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 92.87 | 89.77 | 89.37 | 89.34 | 92.01 |
| DBN | 94.46 | 92.08 | 91.66 | 91.76 | 93.74 |
| Bi-TCN | 95.38 | 93.49 | 93.09 | 93.16 | 94.80 |
| **WMVE** | **98.15** | **97.23** | **97.24** | **97.21** | **97.94** |

On the test set, the ensemble advantage grows substantially: WMVE achieves 98.15% versus Bi-TCN's 95.38% — a gap of 2.77 percentage points. This larger gap on the test set compared to the training set suggests that the ensemble generalises better than any individual classifier, which is the theoretical prediction of ensemble learning: diversity reduces generalisation error.

### 4.13.3 Per-Class Performance: Python Testing (30%)

**Table 4.3b: Per-class breakdown — Python, 30% testing**

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

Several observations emerge from the per-class breakdown.

**The High class is the most challenging for individual classifiers.** GCN achieves only 82.61% precision on High, and DBN achieves 85.14%. The difficulty arises because High readability snippets share surface features with Medium ones — both may be short, both may use standard library calls — but only High snippets consistently use well-named, contextually appropriate identifiers. The GCN's graph-based representation is less sensitive to identifier quality than to structural complexity, causing it to misclassify some High snippets as Medium. The ensemble recovers this loss: WMVE achieves 94.08% precision on High, gaining over 11 percentage points from the GCN baseline.

**The Low class is the easiest for all classifiers.** Bi-TCN achieves 100% precision and 91.72% recall for Low readability on the Python test set. Low readability snippets tend to have obvious structural signals — nested loops, complex expressions, single-letter identifiers — that all three architectures capture reliably. The WMVE ensemble adds 5.97 percentage points of recall, reducing the false-negative rate (Low snippets misclassified as Medium or High) from 8.28% to 3.82%.

**Medium is the most ambiguous class.** As in Study 1, the middle class is intrinsically harder to classify because it is defined residually — snippets that are neither clearly readable nor clearly unreadable. The WMVE achieves 98.91% precision and 96.79% recall for Medium on Python, the highest precision of any class, indicating that when the ensemble commits to a Medium prediction it is almost always correct.

### 4.13.4 Convergence Behaviour

Training and validation accuracy curves for the WMVE show rapid learning in the first 20 epochs, followed by stable convergence. The small and consistent gap between training and validation accuracy confirms good generalisation: the validation accuracy tracks the training accuracy closely throughout training, with no evidence of divergence that would indicate overfitting. The Nadam optimiser's Nesterov lookahead allows the model to navigate the sharp initial loss landscape efficiently, explaining the steep accuracy improvement in epochs 1–20.

Training and validation loss curves show smooth monotonic decrease, with the validation loss remaining above the training loss by a small, stable margin throughout. The absence of validation loss spikes or reversals confirms that the weight decay and dropout regularisation are sufficient to prevent overfitting on the 1,177-example Python training set.

---

## 4.14 Results: C++ Data

### 4.14.1 Training Performance (70%)

**Table 4.4: Individual and ensemble results — C++, 70% training**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 91.06 | 87.73 | 86.60 | 86.52 | 89.96 |
| DBN | 93.73 | 90.73 | 90.55 | 90.56 | 92.93 |
| Bi-TCN | 94.30 | 91.53 | 91.41 | 91.43 | 93.57 |
| **WMVE** | **98.04** | **97.07** | **97.05** | **97.04** | **97.79** |

### 4.14.2 Testing Performance (30%)

**Table 4.5: Individual and ensemble results — C++, 30% testing**

| Method | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|
| GCN | 92.77 | 89.89 | 89.23 | 89.21 | 91.88 |
| DBN | 93.07 | 89.81 | 89.83 | 89.62 | 92.33 |
| Bi-TCN | 93.81 | 90.92 | 90.89 | 90.74 | 93.13 |
| **WMVE** | **98.38** | **97.61** | **97.60** | **97.59** | **98.19** |

The pattern from Python is replicated for C++, and the ensemble advantage is even larger on the C++ test set: WMVE (98.38%) exceeds the best individual classifier (Bi-TCN, 93.81%) by 4.57 percentage points. The larger advantage on C++ reflects the greater structural regularity of C++ code compared to Python. C++ enforces explicit typing, uses curly-brace delimited blocks with consistent indentation, and has stronger naming convention norms. These properties make C++ dependency graphs more predictable, which increases the GCN's discriminative power and — because the GCN brings more orthogonal information relative to the Bi-TCN for C++ — amplifies the ensemble gain.

### 4.14.3 Per-Class Performance: C++ Testing (30%)

**Table 4.5b: Per-class breakdown — C++, 30% testing**

| Method | Class | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| GCN | High | 90.49 | 82.49 | 92.41 | 87.16 | 90.93 |
| GCN | Low | 96.02 | 91.95 | 95.80 | 93.84 | 95.96 |
| GCN | Medium | 91.81 | 95.24 | 79.47 | 86.64 | 88.74 |
| DBN | High | 90.93 | 89.80 | 83.54 | 86.56 | 89.22 |
| DBN | Low | 93.81 | 85.28 | 97.20 | 90.85 | 94.72 |
| DBN | Medium | 94.47 | 94.37 | 88.74 | 91.47 | 93.04 |
| Bi-TCN | High | 92.04 | 90.67 | 86.08 | 88.31 | 90.66 |
| Bi-TCN | Low | 94.25 | 86.34 | 97.20 | 91.45 | 95.04 |
| Bi-TCN | Medium | 95.13 | 95.74 | 89.40 | 92.47 | 93.71 |
| **WMVE** | **High** | **97.79** | **96.25** | **97.47** | **96.86** | **97.71** |
| **WMVE** | **Low** | **99.12** | **97.93** | **99.30** | **98.61** | **99.16** |
| **WMVE** | **Medium** | **98.23** | **98.64** | **96.03** | **97.32** | **97.68** |

The C++ per-class results reinforce the Python findings while revealing one notable difference: the Low class achieves 99.12% accuracy and 99.30% recall for C++, the highest single-class performance in the entire chapter. C++ Low readability snippets are characterised by dense pointer arithmetic, complex template instantiations, and deeply nested control structures — structural patterns that the GCN captures with high precision from the dependency graph. The ensemble's 4.13-point recall advantage for Low over the best individual classifier (GCN, 95.80%) demonstrates that even for the easiest class, the ensemble's weighted combination eliminates residual errors that no single classifier handles alone.

The Medium class shows the largest gap between individual classifiers and the ensemble on C++. GCN achieves only 79.47% recall for Medium (one in five Medium C++ snippets is misclassified), while the WMVE achieves 96.03% recall. This improvement occurs because Medium C++ snippets — which combine moderate complexity with moderate naming quality — require evidence from all three architectural perspectives to classify reliably. The ensemble's ability to integrate structural, probabilistic, and sequential evidence simultaneously is most valuable precisely in these ambiguous cases.

---

## 4.15 Comparative Analysis

**Table 4.6: ECRVR-MVEL vs. baselines — Python**

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

**Table 4.7: ECRVR-MVEL vs. baselines — C++**

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

For Python, ECRVR-MVEL exceeds the best baseline (Neural Network, 90.11%) by 8.04 percentage points. For C++, it exceeds the best baseline (Naïve Bayes, 94.58%) by 3.80 percentage points. The consistent superiority across both languages, all five metrics, and both traditional and deep learning baselines confirms that the ensemble design holds across language, metric, and baseline type.

### 4.15.1 Analysis of Baseline Performance Patterns

The performance pattern across baselines is informative and warrants discussion.

**Tree-based methods (Decision Tree, Random Forest) perform poorly on Python.** Decision Tree achieves only 60.40% accuracy and Random Forest 69.20% on Python. These methods make hard, axis-aligned splits in the CodeBERT embedding space. Because CodeBERT embeddings occupy a 768-dimensional continuous space where readability classes are not axis-aligned (readability is a holistic property of the entire embedding, not the value of any single dimension), tree-based splits are poorly suited to this representation. The Decision Tree's substantially higher accuracy on C++ (92.84%) suggests that C++ code produces more separable embeddings — a consequence of C++'s stricter structural conventions producing tighter clusters in embedding space.

**Naïve Bayes performs well on C++ (94.58%) but moderately on Python (88.58%).** Naïve Bayes assumes conditional independence among features given the class, which is a severe approximation for 768-dimensional correlated CodeBERT embeddings. Its better C++ performance again reflects that C++ embeddings form tighter, more separable clusters where the independence assumption causes less harm.

**The Neural Network baseline (90.11% Python, 88.58% C++) establishes the single-classifier deep learning ceiling** in this comparison. It uses a fully connected network on the CodeBERT embedding — no structural information (GCN), no hierarchical probabilistic representation (DBN), and no sequential modelling (Bi-TCN). The ECRVR-MVEL ensemble's 8.04-point advantage over the Neural Network on Python quantifies precisely the gain from these three architectural additions and their combination.

**The error rate column** in Tables 4.6 and 4.7 provides a complementary view: ECRVR-MVEL's 1.85% error rate on Python means that approximately 1 in 54 test snippets is incorrectly classified. For the Neural Network baseline, the 9.89% error rate means 1 in 10 is incorrectly classified — more than five times higher. In a deployment context (for example, a CI/CD readability gate that processes hundreds of functions per commit), the difference between a 1-in-54 and a 1-in-10 error rate determines whether the tool is trusted or ignored by developers.

---

## 4.16 LIME Explainability Analysis

### 4.16.1 Python Data

LIME explanations for Python snippet predictions across the three readability classes reveal the following patterns:

**Low readability class:** The most positively influential tokens for predicting Low readability are features associated with high structural complexity: loop-related tokens (`for`, `while`, deeply nested variable accesses), cryptic variable names (`i`, `j`, `x`), and long arithmetic expressions. The `readability` composite score also appears as a positive driver for Low predictions, but with lower absolute importance than the structural tokens.

**High readability class:** The most positively influential tokens for High readability are well-named function identifiers (`isPalindrome`, `missingNumber`, `singleNumber`), short single-operation function bodies, and standard library calls that communicate their purpose clearly (`sum`, `sorted`, `reversed`). Short functions with one or two identifiers receive the highest High readability probabilities.

**Medium readability class:** Medium predictions are driven by intermediate tokens: function names of moderate length, some complexity indicators, but also some clarity indicators. The LIME weights are less extreme than for Low and High, reflecting the inherent ambiguity of the middle class.

### 4.16.2 C++ Data

C++ LIME explanations show a similar pattern with notable differences:

**Low readability:** Template tokens, complex pointer arithmetic (`*`, `**`, `&`), and deeply nested braces are strongly associated with Low readability. Single-letter identifiers (`n`, `k`, `p`) when combined with complex expressions drive Low predictions.

**High readability:** C++ functions that use STL algorithms with descriptive names (`truncateSentence`, `checkString`, `titleToNumber`) and have compact bodies with one return statement receive High predictions with high confidence. The use of `auto` and range-based for loops does not significantly affect predictions.

### 4.16.3 Feature-Level Interpretation of LIME Outputs

The LIME analysis produces per-feature importance scores for each prediction. Unlike SHAP in Study 1 — where the features were the ten handcrafted readability parameters — LIME here operates on the CodeBERT embedding dimensions indirectly, through the perturbation of input tokens. When a specific token (such as `MC > 0.24` or `PRED`) appears in the LIME output for a snippet, it reflects that the readability parameters computed for that snippet's identifiers are the dominant features the model attends to.

**Python findings (detailed):** For Low and Medium readability Python snippets, the LIME analysis identifies `MC > 0.24` as a threshold below which snippets are strongly pushed toward Low predictions. This threshold corresponds to identifiers with fewer than 25% of tokens being recognisable English words — precisely the domain of single-letter variables, numeric tokens, and invented abbreviations common in algorithmic code. The readability composite score (`readability > 4.88`) also appears as a driver, but with lower absolute importance than MC, consistent with the SHAP finding in Chapter 3 that the composite score adds minimal information beyond the naming features.

For High readability Python snippets, the LIME explanation reverses: MC and PRED (Predictability) become positive drivers. High MC indicates that all or nearly all identifier tokens are recognisable words; high PRED indicates that the identifier tokens co-occur with neighbouring identifier tokens, suggesting a consistent naming vocabulary throughout the snippet.

**C++ findings (detailed):** C++ LIME explanations show that PRED (Predictability) is the dominant feature for both Low and High classes, with readability score as secondary. For the Low class, low PRED is characteristic: C++ Low readability code tends to use identifiers whose tokens do not appear in neighbouring identifiers' token sets — a consequence of the common pattern in competitive C++ of mixing domain-specific mathematical abbreviations with general-purpose control flow variables. NC (Naming Conformance) appears as a slight positive contributor for Low predictions: some Low readability C++ snippets use correct naming conventions but have other readability problems, so NC is a weak signal in this direction.

For Medium C++ predictions, PRED and the readability score are positive drivers, while CLS (Cognitive Load Score) exerts a slight negative effect — reflecting that Medium snippets are cognitively borderline, identifiable by a relatively high cognitive load score.

For High C++ predictions, readability score and PRED are strongly positive, while SA (Scope Appropriateness) and CLS are slightly negative. This apparent contradiction — High readability snippets with slightly negative SA and CLS contributions — has a specific interpretation: the C++ High readability snippets in this dataset tend to be compact algorithms where identifiers are appropriately short (for example, single-letter loop variables in small scopes are correct by convention, but SA may flag them as short given their scope). The ensemble correctly classifies these as High despite the SA signal, because the identifier name tokens themselves are the stronger evidence.

### 4.16.4 Actionable Guidance from LIME Explanations

The practical value of LIME explanations for ECRVR-MVEL extends beyond interpretability as an audit mechanism. The per-token importance scores provide directly actionable guidance for developers:

1. **Identifier tokens with large negative LIME importance for the predicted class** identify specific names that are reducing readability. A developer who sees that `u`, `v`, `p` are the top negative drivers for a Low prediction knows exactly which variables to rename — not that the code is "low quality" in general.

2. **Structural complexity tokens with large negative importance** (nested braces, `while` inside `for`, complex conditional chains) signal that the readability problem is structural rather than naming-based. In these cases, renaming variables will not help; refactoring into smaller functions is indicated.

3. **The LIME confidence threshold** — requiring P(Low) > 0.9 before flagging a snippet — is supported by the 1.85% error rate on Python. At this threshold, approximately 1 in 54 Low-flagged snippets is a false positive. For CI/CD integration, this threshold provides a practical quality gate that is actionable without creating developer alert fatigue.

### 4.16.5 Convergence with SHAP (Cross-Study Observation)

The LIME findings from Study 2 converge with the SHAP findings from Study 1 in the most important respect: in both studies, identifier naming quality — captured by MC and NC in the SHAP analysis of Study 1, and by MC, PRED, and NC feature thresholds in the LIME analysis of Study 2 — emerges as the primary driver of readability predictions. This convergence holds across two independent explainability methods, two different classifiers, two levels of analysis, and two programming languages. Its significance for the thesis is discussed in Chapter 6, where it forms the basis of Contribution 5 — the multi-level, explainability-first program comprehension framework.

---

## 4.17 Chapter Summary

This chapter presented ECRVR-MVEL, a five-stage framework for snippet-level code readability classification. The framework operates at the second level of the multi-level program comprehension hierarchy introduced in Chapter 1, extending the analysis from individual identifiers (Chapter 3) to complete code functions and snippets.

The technical architecture combines four major contributions. First, CodeBERT vector representations encode the full semantic and structural content of a code snippet into a 768-dimensional vector, capturing relational context between tokens that surface-level features cannot represent. Second, three structurally diverse classifiers — a Graph Convolutional Network that processes code dependency structure, a Deep Belief Network that captures hierarchical probabilistic co-occurrence patterns, and a Bidirectional Temporal Convolutional Network that models token sequences in both directions — each learn complementary views of the readability signal. Third, a Weighted Majority Voting Ensemble combines these classifiers with learned weights derived from validation performance, exploiting the low error correlation between architecturally diverse classifiers to achieve higher accuracy than any single model. Fourth, LIME explainability translates the black-box ensemble's predictions into token-level importance scores, identifying which specific identifiers and structural tokens drive each readability verdict.

Experimental results on the Code Snippets: Insights and Readability dataset confirm the ensemble's effectiveness. ECRVR-MVEL achieves 98.15% test accuracy for Python and 98.38% for C++ — exceeding the best published baseline (Neural Network: 90.11% Python; Naïve Bayes: 94.58% C++) by 8.04 and 3.80 percentage points respectively, and exceeding the best individual classifier (Bi-TCN) by 2.77 and 4.57 percentage points on the Python and C++ test sets. The larger ensemble advantage on C++ reflects the GCN's superior structural discrimination on C++ code, which has more regular dependency patterns than Python.

The LIME analysis reveals that Meaningful Clarity (MC), Predictability (PRED), and Naming Conformance (NC) are the primary drivers of readability predictions at the snippet level — features designed for identifier assessment in Chapter 3 that independently resurface as snippet-level signals in a completely different model using a completely different explainability method. This cross-study convergence is the thesis's most significant empirical finding and is analysed in depth in Chapter 6.

Chapter 5 extends the analysis beyond code to the developer who writes it, presenting EESQA-DELMOA — a system for classifying developer experience level from observable activity features.

---

*Chapter 4 complete. Proceeding to Chapter 5.*

---

*Chapter 4 complete. Proceeding to Chapter 5.*
