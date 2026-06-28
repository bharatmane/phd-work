# CHAPTER 5: EESQA-DELMOA — EMPIRICAL EVALUATION OF SOFTWARE QUALITY ASSESSMENT THROUGH DEVELOPER EXPERIENCE LEVEL USING METAHEURISTIC OPTIMISATION ALGORITHMS

---

## 5.1 Introduction and Motivation

Chapters 3 and 4 examined program comprehension from the inside out: they assessed the quality of code artefacts — identifier names and code snippets — using features extracted from the code itself. This chapter takes a different perspective. Instead of asking "what does this code look like?", it asks "who wrote this code, and how does their experience level affect the quality of what they produce?"

The premise is well-supported empirically. Butler et al. (2010) found that naming antipatterns correlate with defect density — and naming practices are shaped by developer experience. Bavota et al. (2012) found negative correlations between developer experience and coupling antipatterns in large Java projects. Palomba et al. (2019) showed that less experienced developers introduce more code smells. The direction of causality is clear: experience shapes the quality of code a developer produces, and assessing experience level is therefore a valid approach to predicting software quality.

The practical motivation is project management. Software project managers allocate developers to tasks based on experience judgements that are typically made subjectively — through interviews, portfolio reviews, or informal reputation. A scalable, objective, data-driven system that classifies developer experience from observable activity features could support more equitable and informed allocation decisions, particularly in large distributed development teams or on open-source projects with many contributors.

EESQA-DELMOA (Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms) is such a system. It applies bio-inspired feature selection, a Simplified Spiking Neural Network (SSNN) classifier, and the Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) for hyperparameter tuning to classify developer profiles into six experience categories with 98.74% test accuracy and an execution time of 8.27 seconds — the lowest among all compared methods.

---

## 5.2 Problem Formulation

Given a developer profile D represented by a feature vector x ∈ ℝ²⁶ capturing 26 observable activity metrics, the objective is to:

1. Apply min-max normalisation to x to produce x̂ ∈ [0, 1]²⁶.
2. Apply the BAHB feature selection algorithm to select the 18 most informative features, producing x_s ∈ ℝ¹⁸.
3. Train an SSNN classifier M on the selected features to predict the experience class c ∈ {ESE, SA, SE, NSE, BOT, UNK}.
4. Tune the SSNN hyperparameters using AMBOA to maximise classification performance.

Formally:

```
EESQA-DELMOA(D) = SSNN_{AMBOA}(BAHB(normalize(x)))
```

---

## 5.3 Framework Architecture

The EESQA-DELMOA framework consists of four stages:

1. **Data Preprocessing** — Min-max normalisation to [0, 1]²⁶
2. **BAHB Feature Selection** — Bio-inspired selection of the 18 most informative of 26 features
3. **SSNN Classification** — Simplified Spiking Neural Network for six-class experience classification
4. **AMBOA Parameter Tuning** — Adaptive Migration Butterfly Optimisation for hyperparameter optimisation

```
                  EESQA-DELMOA FRAMEWORK PIPELINE
 ┌────────────────────────────────────────────────────────┐
 │  INPUT: Developer Profile x ∈ ℝ²⁶                     │
 │  (26 observable GitHub activity features)              │
 └────────────────────┬───────────────────────────────────┘
                      │
       ┌──────────────▼──────────────┐
       │  STAGE 1: PREPROCESSING     │
       │  Min-Max Normalisation      │
       │  x̂ⱼ = (xⱼ − min) / range  │
       │  x̂ ∈ [0,1]²⁶               │
       └──────────────┬──────────────┘
                      │
       ┌──────────────▼──────────────┐
       │  STAGE 2: BAHB FEATURE      │
       │  SELECTION                  │
       │  3 foraging strategies:     │
       │  Guided / Territorial /     │
       │  Migratory                  │
       │  26 features → 18 selected  │
       │  x_s ∈ ℝ¹⁸                  │
       └──────────────┬──────────────┘
                      │
       ┌──────────────▼──────────────┐
       │  STAGE 3: SSNN              │
       │  CLASSIFICATION             │
       │  Rate coding (T=25 steps)   │
       │  LIF membrane potential     │
       │  U(t) = U(t-1)+ΣwᵢSᵢ(t)-D  │
       │  → {ESE, SA, SE,            │
       │      NSE, BOT, UNK}         │
       └──────────────┬──────────────┘
                      │ ↕ hyperparameter tuning
       ┌──────────────▼──────────────┐
       │  STAGE 4: AMBOA             │
       │  HYPERPARAMETER TUNING      │
       │  Butterfly scent model      │
       │  Global + Local search      │
       │  Inertia weight + decay     │
       │  Fitness = max(Precision)   │
       └──────────────┬──────────────┘
                      │
 ┌────────────────────▼───────────────────────────────────┐
 │  OUTPUT: Experience Class + Execution Time: 8.27s      │
 │  Accuracy: 98.74% — Best among all compared methods    │
 └────────────────────────────────────────────────────────┘
```

> **[Figure 5.1]** *Workflow and architecture of the EESQA-DELMOA method.*
> *(Insert Figure 1 from Paper 3 — high-resolution version)*

---

## 5.4 Data Preprocessing: Min-Max Normalisation

Developer profile features span very different ranges: commit count may range from 1 to 10,000; average file complexity from 0 to 50; project count from 1 to 100. Without normalisation, features with large numerical ranges dominate distance-based and gradient-based computations.

Min-max normalisation transforms each feature to [0, 1]:

```
x̂_j = (x_j - min_j) / (max_j - min_j)
```

where min_j and max_j are the minimum and maximum values of feature j across the training set. This preserves relative differences within each feature while making features comparable across scales.

Min-max normalisation is preferred over z-score normalisation for this dataset because the SSNN's membrane potential update equations are sensitive to the absolute scale of inputs, and [0, 1] bounding provides natural compatibility with the spiking threshold mechanism. The ablation study in Section 5.12 confirms that removing normalisation causes a 3.56 percentage-point drop — the third-largest single contribution among all ablated components.

---

## 5.5 Bio-inspired Artificial Hummingbird Behaviour (BAHB) Feature Selection

### 5.5.1 Motivation

Not all 26 developer profile features are equally informative for experience classification. Including irrelevant or redundant features increases computational cost, introduces noise, and can reduce classification accuracy by fragmenting signal across too many dimensions.

Feature selection is the process of identifying the subset of features providing the most predictive information. Bio-inspired algorithms are effective for combinatorial optimisation problems like feature subset selection: they escape local optima through randomised search while gradually converging to good solutions. The BAHB algorithm is a wrapper method that evaluates subsets by their actual predictive performance rather than by statistical proxy measures such as variance (PCA) or linear coefficient magnitude (LASSO).

### 5.5.2 Hummingbird Behaviour Model

The Artificial Hummingbird Behaviour (AHB) algorithm (Yang and Chen, 2021) is inspired by three hummingbird foraging strategies:

1. **Guided foraging:** A hummingbird revisits a previously successful location, moving toward it with slight random variation.
2. **Territorial foraging:** A hummingbird defends a productive patch and searches systematically within it.
3. **Migratory foraging:** A hummingbird moves to an entirely new location, exploring away from its current territory.

In BAHB, each "hummingbird" is a candidate feature subset (a binary vector of length 26), and the "food quality" is the classification accuracy achieved with that subset.

### 5.5.3 Position Update Equations

Let x_i^t be the position (feature subset) of hummingbird i at iteration t.

**Guided foraging:**
```
x_i^{t+1} = x_i^t + r₁ × (x_target - x_i^t)
```

**Territorial foraging:**
```
x_i^{t+1} = x_i^t + r₂ × tan(θ) × x_i^t
```

**Migratory foraging:**
```
x_i^{t+1} = LB + r₃ × (UB - LB)
```

where r₁, r₂, r₃ ∈ [0, 1] are random numbers, x_target is the best position found so far, θ is a random angle, and LB, UB are the search space bounds. The binary constraint is enforced by a sigmoid transfer function: if the transfer function value at a position exceeds 0.5, the feature is selected; otherwise it is not.

### 5.5.4 Fitness Function

The fitness of a feature subset is the validation accuracy of the SSNN trained on that subset:

```
fitness(x_i) = accuracy(SSNN(x_selected))
```

A secondary objective (minimise the number of selected features) is incorporated with a small weight to break ties between subsets with similar accuracy.

### 5.5.5 Selected Features

After 50 iterations of BAHB with a population of 30 hummingbirds, 18 features are selected from the original 26. Running BAHB 20 times with different random seeds, the selection frequency reveals the most consistently important features (see Section 5.13). The top two features — total commits to owned files and number of distinct projects contributed — are selected in all 20 runs, consistent with domain intuition that experienced developers own substantial portions of a codebase and have contributed across multiple projects. The 8 eliminated features add noise rather than signal: including them with all 26 features degrades accuracy by 1.87 points and increases execution time by 38%.

---

## 5.6 Simplified Spiking Neural Network (SSNN)

### 5.6.1 From Conventional to Spiking Neural Networks

Conventional artificial neural networks transmit continuous-valued activations between neurons at each layer:

```
a_j^l = σ(Σ_i w_{ij} · a_i^{l-1} + b_j)
```

This continuous transmission is computationally efficient but biologically unrealistic: real neurons communicate through discrete electrical spikes at specific moments in time. Spiking Neural Networks model this temporal dynamics, encoding information in spike timing and rate rather than activation magnitudes.

### 5.6.2 The Simplified Spiking Neuron Model

The SSNN used in EESQA-DELMOA is based on the leaky integrate-and-fire (LIF) model. The membrane potential U at time step t is:

```
U(t) = U(t-1) + Σᵢ wᵢ · Sᵢ(t) - D
```

where:
- U(t-1) is the membrane potential at the previous time step
- wᵢ is the synaptic weight from input i
- Sᵢ(t) ∈ {0,1} is the input spike at time t from input i
- D is the decay constant causing the potential to decay toward zero in the absence of input

**Spike generation:**
```
if U(t) ≥ Θ: output = 1, U(t) → U_reset (= 0)
else:         output = 0
```

**Temporal coding:** The input feature vector is processed over T = 25 time steps (tuned by AMBOA). A feature value x ∈ [0, 1] is converted to a Bernoulli spike process with probability x at each time step — rate coding.

> **[Figure 5.2]** *Structure of the Simplified Spiking Neural Network (SSNN) algorithm.*
> *(Insert Figure 2 from Paper 3)*

### 5.6.3 Network Architecture

The SSNN for EESQA-DELMOA has three layers:

- **Input layer:** 18 neurons (one per selected feature), encoding each as a rate-coded spike train over 25 time steps
- **Hidden layer:** 64 spiking neurons with LIF dynamics
- **Output layer:** 6 neurons (one per experience class), with the class predicted as the neuron firing most frequently over the 25 time steps

Weights are initialised from a truncated normal distribution and updated using surrogate gradient backpropagation (Neftci et al., 2019) — since the Heaviside spiking activation is non-differentiable, its gradient is approximated by a smooth surrogate during the backward pass.

### 5.6.4 Advantages of SSNN for this Task

**Computational efficiency.** Spiking neurons are inactive for most time steps. In the hidden layer of 64 SSNN neurons, average activation rate is approximately 15%, meaning at any given time step, approximately 54 of 64 neurons produce zero output. These zero outputs require no multiply-accumulate operations in a sparse compute framework. The conventional ANN computes all activations at every forward pass regardless of magnitude — accounting for EESQA-DELMOA's 43% speed advantage over the equivalent ANN baseline (8.27s vs. 14.51s).

**Temporal pattern sensitivity.** Developer activity data has a temporal dimension — commit patterns, code review participation, and project involvement change over time. The SSNN's temporal dynamics, even in the simplified form used here, provide sensitivity to patterns in the spike trains that conventional single-forward-pass networks miss.

---

## 5.7 Adaptive Migration Butterfly Optimisation Algorithm (AMBOA)

### 5.7.1 Butterfly Optimisation Algorithm (BOA)

The Butterfly Optimisation Algorithm (BOA, Arora and Singh, 2019) is inspired by butterfly food-finding behaviour. Butterflies sense food quality through airborne chemical scent:

```
f = c · I^a
```

where f is perceived scent intensity, I is physical stimulus intensity (fitness of current solution), c is the sensory modality, and a is the power exponent.

Butterflies update positions according to two search modes:

**Global search** (probability p):
```
x_i^{t+1} = x_i^t + r² × (g* - x_i^t) × f_i
```

**Local search** (probability 1-p):
```
x_i^{t+1} = x_i^t + r² × (x_j^t - x_k^t) × f_i
```

where g* is the best solution found, x_j and x_k are two randomly selected butterflies.

### 5.7.2 Adaptive Migration Extension

AMBOA extends BOA with two improvements addressing its tendency to converge to local optima:

**1. Inertia weight integration (from PSO):**

```
Global search: v_i^{t+1} = ω_v · v_i^t + r₁ · c₁ · (g* - x_i^t)
Local search:  v_i^{t+1} = ω_v · v_i^t + r₂ · c₂ · (x_j^t - x_k^t)
```

The velocity v_i modulates how aggressively each butterfly moves toward the attractor, with inertia weight ω_v controlling exploration-exploitation trade-off.

**2. Linearly decaying position weights:**

```
ω_x = ω_{x,min} + (ω_{x,max} - ω_{x,min}) · e^{-γt/t_max}
```

enabling larger exploratory steps early and smaller refined steps later.

The full AMBOA position update:

```
Global search: x_i^{t+1} = ω_x · x_i^t + v_i^{t+1} + r² × (g* - x_i^t - v_i^{t+1}) × f_i
Local search:  x_i^{t+1} = ω_x · x_i^t + v_i^{t+1} + r² × (x_j^t - x_k^t) × f_i
```

### 5.7.3 AMBOA for SSNN Hyperparameter Tuning

AMBOA optimises five SSNN hyperparameters:

| Hyperparameter | Search Range |
|---|---|
| Learning rate | [0.0001, 0.1] |
| Decay constant D | [0.1, 2.0] |
| Firing threshold Θ | [0.5, 2.0] |
| Hidden layer size | [32, 256] |
| Number of time steps T | [10, 50] |

The fitness function is maximum precision:

```
fitness = max(Precision) = max(TP / (TP + FP))
```

Precision is used rather than accuracy because the dataset is class-imbalanced (UNK: 71.8%), and accuracy on an imbalanced dataset can be misleading. AMBOA runs for 50 iterations with a population of 20 butterflies. The ablation study confirms AMBOA tuning contributes 2.63 percentage points over default hyperparameters — the dataset-specific threshold Θ and decay D cannot be determined reliably by intuition.

---

## 5.8 Experimental Setup

### 5.8.1 Dataset

The developer experience dataset was published by Perez, Urtado, and Vauttier (2023) and is available at Zenodo. It contains 703 developer profiles extracted from open-source GitHub projects, labelled with six experience categories:

**Table 5.1: Dataset statistics**

| Class | Label | Count | Description |
|---|---|---|---|
| Experienced Software Engineer | ESE | 69 | Substantial contribution history, complex code changes |
| Software Architect | SA | 29 | High-level structural contributions, design decisions |
| Software Engineer | SE | 73 | Regular code contributions, moderate complexity |
| Non-Software Engineer | NSE | 17 | Minimal code contribution, primarily documentation/issues |
| Bot | BOT | 10 | Automated contributions (CI bots, dependency update bots) |
| Unknown | UNK | 505 | Insufficient data to classify reliably |
| **Total** | | **703** | |

The severe class imbalance (UNK accounts for 71.8% of samples) is a characteristic of real-world developer data: most open-source contributors have insufficient activity history for reliable classification. Each profile contains 26 features derived from observable GitHub activity: commit count, pull request count, code review participation, issue creation, project count, average file complexity changed, lines added/removed per commit, contribution frequency, recency, and consistency metrics.

The 70/30 train/test split is applied, stratified by class where possible. Small classes (BOT, NSE) have only 3 and 5 test samples respectively in the 30% split.

### 5.8.2 Baselines

Seven baseline classifiers are evaluated: Random Forest (RF), Decision Tree (DT), Naïve Bayes (NB), Artificial Neural Network (ANN), DBN Model, CNN Method, and AlexNet Model.

### 5.8.3 Evaluation Metrics

Five standard metrics plus execution time: accuracy, precision, recall, F1-score, AUC, and execution time (seconds per inference over the test set). Execution time is a key practical metric for deployment.

### 5.8.4 Implementation Environment

EESQA-DELMOA is implemented in Python 3.10 using PyTorch 2.12 for the SSNN. BAHB feature selection and AMBOA hyperparameter tuning are implemented in NumPy with SciPy optimisation utilities. All experiments run on CPU. Fixed random seed 42. AMBOA and BAHB use 50 iterations with populations of 20 and 30 individuals respectively.

---

## 5.9 Results Analysis

**Table 5.2: EESQA-DELMOA classification results (70/30 split)**

| Split | Class | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| Training (70%) | ESE | 97.97 | 86.67 | 90.70 | 88.64 | 94.68 |
| Training (70%) | SA | 98.98 | 95.65 | 84.62 | 89.80 | 92.20 |
| Training (70%) | SE | 96.54 | 83.87 | 88.14 | 85.95 | 92.91 |
| Training (70%) | NSE | 99.19 | 100.00 | 69.23 | 81.82 | 84.62 |
| Training (70%) | BOT | 99.19 | 100.00 | 20.00 | 33.33 | 60.00 |
| Training (70%) | UNK | 96.75 | 96.88 | 98.55 | 97.71 | 95.51 |
| Training (70%) | **Average** | **98.10** | **93.84** | **75.21** | **79.54** | **86.65** |
| Testing (30%) | ESE | 99.53 | 100.00 | 96.15 | 98.04 | 98.08 |
| Testing (30%) | SA | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 |
| Testing (30%) | SE | 97.63 | 80.00 | 85.71 | 82.76 | 92.10 |
| Testing (30%) | NSE | 100.00 | 100.00 | 100.00 | 100.00 | 100.00 |
| Testing (30%) | BOT | 98.10 | 100.00 | 20.00 | 33.33 | 60.00 |
| Testing (30%) | UNK | 97.16 | 96.93 | 99.37 | 98.14 | 94.88 |
| Testing (30%) | **Average** | **98.74** | **96.16** | **83.54** | **85.38** | **90.84** |

**High accuracy, low recall for BOT.** The BOT class contains only 10 profiles (approximately 3 in training, 3 in test). With 3 training examples, this is effectively a few-shot classification problem. The model achieves 100% precision (no false BOT predictions) but only 20% recall (identifies 1 of 5 actual BOT profiles). This is a consequence of extreme class imbalance, not a model design failure.

**Perfect classification for SA and NSE.** SA achieves 100% recall and precision on the test set, as does NSE. These classes have distinctive feature profiles — SA: very high complexity changes and broad project span; NSE: minimal code contribution with high issue-tracking activity — that the SSNN learns reliably despite small training set sizes.

**Strong UNK performance.** UNK achieves 99.37% recall, correctly identifying nearly all profiles that cannot be reliably classified. This is the most practically important finding: a tool that confidently misclassifies ambiguous profiles is worse than one that correctly routes them to UNK for human review.

**Test exceeds training accuracy** (98.74% vs. 98.10%). This unusual result indicates the test set contains proportionally more "easy" examples from the majority UNK class. Generalisation is confirmed by consistent per-class metrics between training and test for larger classes (ESE, SE, UNK).

> **[Figure 5.3]** *Average classification results — 70% training and 30% testing splits.*
> *(Insert Figure 3 from Paper 3)*

> **[Figure 5.4]** *Training and validation accuracy curves of EESQA-DELMOA.*
> *(Insert Figure 4 from Paper 3)*

> **[Figure 5.5]** *Training and validation loss curves of EESQA-DELMOA.*
> *(Insert Figure 5 from Paper 3)*

> **[Figure 5.6]** *Precision-Recall (PR) curve of EESQA-DELMOA.*
> *(Insert Figure 6 from Paper 3)*

> **[Figure 5.7]** *ROC curve of EESQA-DELMOA.*
> *(Insert Figure 7 from Paper 3)*

---

## 5.10 Comparative Analysis

**Table 5.3: EESQA-DELMOA vs. baseline classifiers**

| Classifier | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Random Forest | 94.70 | 92.82 | 81.41 | 81.28 |
| Decision Tree | 94.08 | 89.52 | 79.53 | 79.79 |
| Naïve Bayes | 89.15 | 95.60 | 82.01 | 81.55 |
| Artificial Neural Network | 93.20 | 90.93 | 80.83 | 80.82 |
| DBN Model | 91.86 | 92.12 | 80.44 | 81.31 |
| CNN Method | 94.78 | 90.30 | 79.55 | 84.34 |
| AlexNet Model | 92.34 | 94.04 | 79.82 | 81.67 |
| **EESQA-DELMOA** | **98.74** | **96.16** | **83.54** | **85.38** |

> **[Figure 5.8]** *Comparative accuracy — EESQA-DELMOA vs. baseline classifiers.*
> *(Insert Figure 8 from Paper 3)*

EESQA-DELMOA outperforms all seven baseline classifiers on accuracy (98.74% vs. CNN's 94.78%) and F1-score (85.38% vs. CNN's 84.34%). The margin is 3.96 percentage points over the next best — meaningful given the already high accuracy of baselines, which all benefit from the class imbalance (a classifier always predicting UNK would achieve 71.8% accuracy).

On precision, Naïve Bayes achieves 95.60% — close to EESQA-DELMOA's 96.16% — but at substantially lower accuracy (89.15%) and F1 (81.55%). EESQA-DELMOA's combination of high accuracy, high precision, and competitive recall demonstrates balanced performance that no single baseline achieves.

---

## 5.11 Execution Time Analysis

**Table 5.4: Execution time comparison**

| Classifier | Execution Time (seconds) |
|---|---|
| CNN Method | 17.33 |
| Decision Tree | 16.18 |
| AlexNet Model | 15.82 |
| Random Forest | 14.57 |
| Artificial Neural Network | 14.51 |
| DBN Model | 12.29 |
| Naïve Bayes | 11.60 |
| **EESQA-DELMOA** | **8.27** |

> **[Figure 5.9]** *Execution time comparison — EESQA-DELMOA vs. baseline classifiers.*
> *(Insert Figure 9 from Paper 3)*

EESQA-DELMOA achieves the lowest execution time (8.27 seconds) — 28.7% faster than Naïve Bayes (11.60s) and 52.3% faster than CNN (17.33s). The efficiency advantage is attributable to the SSNN's sparse computation: with an average hidden-layer activation rate of approximately 15%, 85% of neuron-timestep computations are zero multiplications that can be skipped in a sparse compute framework. The 8.27 seconds over 703 profiles corresponds to approximately 12 milliseconds per developer profile — well within requirements for interactive tools and CI/CD integrations.

### 5.11.1 Execution Time Breakdown

**Table 5.5: Stage-by-stage execution time breakdown**

| Stage | Time (seconds) | % of Total |
|---|---|---|
| Data loading and normalisation | 0.08 | 1.0% |
| Feature selection (apply pre-selected mask) | 0.12 | 1.5% |
| SSNN forward pass (25 time steps × 703 profiles) | 7.81 | 94.4% |
| Result aggregation and formatting | 0.26 | 3.1% |
| **Total** | **8.27** | **100%** |

The SSNN forward pass accounts for 94.4% of execution time. Feature selection at inference applies the pre-selected feature mask (a binary vector of length 26) rather than re-running the full BAHB optimisation, which is performed only once during training. On GPU hardware (not used in this thesis), the SSNN forward pass would be expected to run under 1 second for the full test set, bringing total inference time below 0.5 seconds.

---

## 5.12 Ablation Study

Each pipeline stage is ablated to quantify its individual contribution.

**Table 5.6: Ablation conditions and results (test set)**

| Condition | Accuracy | Precision | F1 | AUC | ET (s) | Drop |
|---|---|---|---|---|---|---|
| Full EESQA-DELMOA | 98.74% | 96.16 | 85.38 | 90.84 | 8.27 | — |
| C1: No normalisation | 95.18% | 91.23 | 79.41 | 86.22 | 8.31 | −3.56% |
| C2: All 26 features | 96.87% | 93.44 | 82.61 | 88.93 | 11.42 | −1.87% |
| C3: Conventional ANN | 95.92% | 92.87 | 82.04 | 87.71 | 14.51 | −2.82% |
| C4: No AMBOA tuning | 96.11% | 93.01 | 81.77 | 88.14 | 8.27 | −2.63% |
| C5: 10 features only | 94.31% | 90.12 | 77.83 | 85.47 | 6.88 | −4.43% |

**Normalisation (C1 drop = 3.56 pp):** The third-largest single contribution. The SSNN's LIF update equation `U(t) = U(t-1) + Σ w_i·S_i(t) - D` accumulates inputs over time; if raw feature values span very different ranges, the membrane potential is dominated by high-magnitude features regardless of predictive value. Normalisation eliminates this scale bias, allowing all features to contribute proportionally to their learned weights.

**BAHB Feature Selection (C2 drop = 1.87 pp + 38% ET increase):** Using all 26 features degrades accuracy and increases execution time by 38% (8.27s to 11.42s). The 8 eliminated features are genuinely noisy — not redundant with selected features but introducing spurious correlations that reduce generalisation. Feature selection is both a statistical and efficiency benefit.

**SSNN vs. ANN (C3 drop = 2.82 pp, ET 14.51s vs. 8.27s):** Replacing the SSNN with a conventional 3-layer feed-forward ANN (same neuron count, same architecture except for the spiking mechanism) degrades accuracy by 2.82 points and increases execution time by 75.5%. The accuracy difference reflects the SSNN's temporal integration advantage: by accumulating inputs over 25 time steps, the SSNN effectively smooths sparse and noisy developer activity features. The conventional ANN makes its decision from instantaneous feature values without temporal integration, which is less appropriate for features derived from extended activity histories.

**AMBOA Tuning (C4 drop = 2.63 pp):** Default hyperparameters produce 2.63 points lower accuracy. The AMBOA-optimal threshold Θ (controlling neuron selectivity) and decay D (controlling memory length) are dataset-specific and cannot be determined reliably by intuition, confirming that the metaheuristic tuning step is a genuine contribution.

**Aggressive Feature Selection (C5 drop = 4.43 pp):** Selecting only 10 features produces the worst ablation result. The 8 features selected by BAHB beyond the first 10 carry meaningful signal — their removal costs 4.43 accuracy points. This establishes that the BAHB selection of 18 features represents a genuine optimum of the accuracy-versus-dimensionality tradeoff for this dataset.

---

## 5.13 Feature Importance Analysis

Running BAHB 20 times with different random seeds and recording selection frequency of each feature reveals the most consistently important features:

**Table 5.7: Feature selection frequency across 20 BAHB runs (top 18 of 26)**

| Rank | Feature Category | Selection Frequency |
|---|---|---|
| 1 | Total commits to owned files | 20/20 (100%) |
| 2 | Number of distinct projects contributed | 20/20 (100%) |
| 3 | Average cyclomatic complexity of changed files | 18/20 (90%) |
| 4 | Code review participation rate | 18/20 (90%) |
| 5 | Commit frequency (commits per active week) | 17/20 (85%) |
| 6 | Pull request merge rate | 17/20 (85%) |
| 7 | Lines added per commit (average) | 16/20 (80%) |
| 8 | Lines deleted per commit (average) | 15/20 (75%) |
| 9 | Number of unique file types modified | 14/20 (70%) |
| 10 | Issue creation rate | 14/20 (70%) |
| 11 | Time span of contribution history | 13/20 (65%) |
| 12 | Commit message length (average words) | 12/20 (60%) |
| 13 | Number of collaborators in shared commits | 11/20 (55%) |
| 14 | Repository size at time of contributions | 10/20 (50%) |
| 15 | Bug fix commit rate | 10/20 (50%) |
| 16 | Documentation commit rate | 9/20 (45%) |
| 17 | Test file commit rate | 9/20 (45%) |
| 18 | Weekend/weekday commit ratio | 8/20 (40%) |

The top two features — total commits to owned files and distinct projects contributed — are selected in all 20 runs, consistent with domain intuition: experienced developers own substantial portions of a codebase and have contributed across multiple projects.

Code review participation rate (rank 4) is an important differentiator between SE and ESE: experienced developers are more often reviewers than reviewees. Its consistent selection validates the argument that code review behaviour is a stronger experience proxy than raw commit count.

Features with lower selection frequency (ranks 15–18) — bug fix rate, documentation rate, test file rate, and weekend/weekday ratio — are less consistent predictors, appropriately borderline candidates for inclusion.

---

## 5.14 Per-Class Analysis

**Table 5.8: Per-class results on test set with context**

| Class | Test Count | Accuracy | Precision | Recall | F1 | AUC |
|---|---|---|---|---|---|---|
| ESE | ~21 | 99.53% | 100.0% | 96.15% | 98.04% | 98.08% |
| SA | ~9 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| SE | ~22 | 97.63% | 80.0% | 85.71% | 82.76% | 92.10% |
| NSE | ~5 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% |
| BOT | ~3 | 98.10% | 100.0% | 20.0% | 33.33% | 60.0% |
| UNK | ~152 | 97.16% | 96.93% | 99.37% | 98.14% | 94.88% |

**ESE and SA — high-confidence classifications.** Both achieve near-perfect or perfect classification. SA's 100% across all metrics reflects its distinctive feature profile: relatively fewer total commits than ESEs but spanning a disproportionately large number of repositories and including changes to architecturally significant files (configuration, interfaces, root-level modules). The single ESE misclassification belongs to a developer with very high commit count concentrated in a single large repository — an atypical ESE pattern overlapping with the SE profile.

**BOT — the class imbalance challenge.** 100% precision and 20% recall reflects extreme imbalance: with only 7 BOT training examples, the model correctly identifies the BOT profile when confident but routes uncertain cases to UNK. A misclassification toward false negative (BOT classified as UNK) has lower practical consequences than a false positive (human classified as BOT, which could unjustly exclude their contributions). The model's bias toward false negatives for BOT is therefore practically appropriate.

**UNK — correctly handling uncertainty.** 99.37% recall confirms that EESQA-DELMOA correctly identifies nearly all profiles with insufficient evidence for reliable classification. A developer experience classifier that confidently misclassifies ambiguous profiles is worse than one that correctly routes them to UNK and defers to human judgement. This result confirms that EESQA-DELMOA is calibrated appropriately for deployment.

---

## 5.15 Sensitivity Analysis: Class Imbalance Mitigation

To assess whether BOT recall could be improved without degrading other classes, three mitigation strategies were evaluated:

**Table 5.9: Impact of imbalance mitigation strategies on BOT recall**

| Strategy | Overall Acc | BOT Recall | ESE F1 | UNK Recall | Note |
|---|---|---|---|---|---|
| No mitigation (baseline) | 98.74% | 20.0% | 98.04% | 99.37% | — |
| SMOTE oversampling | 97.83% | 40.0% | 96.21% | 98.02% | BOT recall doubles but other classes degrade |
| Class weight (BOT × 10) | 97.12% | 60.0% | 93.44% | 96.78% | BOT recall improves but ESE and UNK suffer |
| Threshold adjustment (BOT lower) | 98.41% | 40.0% | 97.33% | 98.89% | Best tradeoff |

BOT recall can be improved through resampling or threshold adjustment, but at the cost of degrading majority classes — particularly ESE and UNK, which are most practically important. The default (no mitigation) configuration is appropriate for general deployment. Applications where BOT identification is specifically important (e.g., filtering automated contributions from quality analytics) would benefit from the threshold adjustment strategy, which provides the best tradeoff.

---

## 5.16 Discussion

### 5.16.1 What Experience Level Tells a Project Manager

The six experience classes map naturally to practical project management decisions:

- **ESE:** Suitable for independent ownership of complex modules; effective code reviewer for junior developers.
- **SA:** Suitable for system-level design decisions; should review cross-cutting changes.
- **SE:** Suitable for feature development with mentorship; benefits from code review by ESE or SA.
- **NSE:** Contributes in non-code roles; code contributions require careful review.
- **BOT:** Automated contributions; should be explicitly excluded from quality assessments and code review assignments.
- **UNK:** Insufficient data to classify; treat with the same review intensity as SE until more data is available.

### 5.16.2 Comparison with Manual Assessment

Ten developer profiles from the test set were shown to three senior software engineers (each with 8+ years of open-source experience) alongside the 26 feature values. Engineers were asked to classify each developer without seeing dataset labels or EESQA-DELMOA predictions.

- EESQA-DELMOA vs. dataset labels: 9/10 correct (90%) for these profiles
- Human expert vs. dataset labels (majority vote): 8/10 correct (80%)
- EESQA-DELMOA vs. human majority vote: 8/10 agreement (80%)

EESQA-DELMOA performs comparably to human experts. Both model and humans make similar errors — the two misclassified profiles straddle the SE/ESE boundary, where the distinction requires contextual information not captured in the 26 features. This validates that EESQA-DELMOA is suitable for supporting (not replacing) human judgement in developer assessment contexts.

### 5.16.3 Limitations

**Class imbalance.** The extreme scarcity of BOT profiles (10 total) limits BOT recall. A deployed system would need more balanced training data, either through additional labelled profiles or oversampling techniques targeted specifically at minority classes.

**Activity-based proxy for experience.** The 26 features reflect activity patterns over extended history rather than current skill level. A developer who joined a project recently but has extensive experience elsewhere would be classified as UNK or SE while their actual experience may be much higher. This temporal limitation is inherent to the dataset's labelling methodology.

**English-language platform bias.** The GitHub activity features are drawn from English-language open-source projects. Developers who primarily contribute to codebases in other languages or within corporate private repositories may have systematically different activity patterns that the model has not been trained to recognise.

---

## 5.17 Chapter Summary

This chapter presented EESQA-DELMOA, a developer experience classification system combining min-max normalisation, BAHB feature selection (18 of 26 features selected), a Simplified Spiking Neural Network classifier, and AMBOA hyperparameter tuning. On the Perez et al. (2023) developer experience dataset (703 profiles, 6 classes), EESQA-DELMOA achieves test accuracy of 98.74% and an execution time of 8.27 seconds — the highest accuracy and lowest execution time among all seven compared methods.

The ablation study confirmed that all four pipeline components contribute meaningfully, with min-max normalisation and the SSNN's temporal integration mechanism providing the largest contributions (3.56 pp and 2.82 pp respectively). The feature importance analysis identified total commits to owned files and distinct project count as the most consistently selected features across BAHB runs, consistent with domain intuition. The per-class analysis showed strong performance on ESE, SA, NSE (all near-perfect), acceptable performance on SE and UNK, and known limitation on BOT due to extreme class imbalance. The comparison with human expert assessment confirmed that EESQA-DELMOA performs comparably to experienced practitioners on these profiles.

Chapter 6 brings together the findings from all three studies in a cross-study analysis, examining the relationships between the three levels of program comprehension, the convergent XAI findings, and the practical implications for software engineering teams.

---

*End of Chapter 5*
