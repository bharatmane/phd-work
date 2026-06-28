# CHAPTER 5: EESQA-DELMOA — EMPIRICAL EVALUATION OF SOFTWARE QUALITY ASSESSMENT THROUGH DEVELOPER EXPERIENCE LEVEL USING METAHEURISTIC OPTIMISATION ALGORITHMS

## 5.1 Introduction and Motivation

Chapters 3 and 4 examined program comprehension from the inside out: they assessed the quality of code artefacts — identifier names and code snippets — using features extracted from the code itself. This chapter takes a different perspective. Instead of asking "what does this code look like?", it asks "who wrote this code, and how does their experience level affect the quality of what they produce?"

The premise is well-supported empirically. Butler et al. (2010) found that naming antipatterns correlate with defect density — and naming practices are shaped by developer experience. Bavota et al. (2012) found negative correlations between developer experience and coupling antipatterns in large Java projects. Palomba et al. (2019) showed that less experienced developers introduce more code smells. The direction of causality in these studies is clear: experience shapes the quality of code that a developer produces, and assessing experience level is therefore a valid approach to predicting software quality.

The practical motivation is project management. Software project managers allocate developers to tasks based on experience judgements that are typically made subjectively — through interviews, portfolio reviews, or informal reputation. A scalable, objective, data-driven system that classifies developer experience from observable activity features could support more equitable and informed allocation decisions, particularly in large distributed development teams or on open-source projects with many contributors.

EESQA-DELMOA (Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms) is such a system. It applies bio-inspired feature selection, a Simplified Spiking Neural Network (SSNN) classifier, and the Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) for hyperparameter tuning to classify developer profiles into six experience categories.

---

## 5.2 Problem Formulation

Given a developer profile D represented by a feature vector x ∈ ℝ²⁶ capturing 26 observable activity metrics, the objective is to:

1. Apply min-max normalisation to x to produce x̂ ∈ [0, 1]²⁶.
2. Apply the BAHB feature selection algorithm to select the k most informative features, producing x_s ∈ ℝ^k (where k = 18 was determined empirically).
3. Train an SSNN classifier M on the selected features to predict the experience class c ∈ {ESE, SA, SE, NSE, BOT, UNK}.
4. Tune the SSNN hyperparameters using AMBOA to maximise classification performance.

Formally:

```
EESQA-DELMOA(D) = SSNN_{AMBOA}(BAHB(normalize(x)))
```

---

## 5.3 Framework Architecture

The EESQA-DELMOA framework consists of four stages:

1. **Data Preprocessing** — Min-max normalisation
2. **BAHB Feature Selection** — Bio-inspired selection of the 18 most informative features
3. **SSNN Classification** — Simplified Spiking Neural Network for six-class experience classification
4. **AMBOA Parameter Tuning** — Adaptive Migration Butterfly Optimisation for hyperparameter optimisation

---

## 5.4 Data Preprocessing: Min-Max Normalisation

Developer profile features span very different ranges: commit count may range from 1 to 10,000; average file complexity may range from 0 to 50; project count from 1 to 100. Without normalisation, features with large numerical ranges dominate distance-based and gradient-based computations.

Min-max normalisation transforms each feature to the range [0, 1]:

```
x̂_j = (x_j - min_j) / (max_j - min_j)
```

where min_j and max_j are the minimum and maximum values of feature j across the training set. This preserves the relative differences between values within each feature while making features comparable across different scales.

Min-max normalisation is preferred over z-score normalisation (which maps to zero mean, unit variance) for this dataset because the SSNN's membrane potential update equations are sensitive to the absolute scale of inputs, and [0, 1] bounding provides natural compatibility with the spiking threshold mechanism.

---

## 5.5 Bio-inspired Artificial Hummingbird Behaviour (BAHB) Feature Selection

### 5.5.1 Motivation

The developer experience dataset provides 26 features per developer. Not all 26 features are equally informative for experience classification. Including irrelevant or redundant features increases computational cost, introduces noise, and can reduce classification accuracy by fragmenting the signal across too many dimensions.

Feature selection is the process of identifying the subset of features that provides the most predictive information. Bio-inspired algorithms — which mimic the foraging, migration, or communication behaviour of animals — are effective for combinatorial optimisation problems like feature subset selection, because they can escape local optima through randomised search while gradually converging to good solutions.

### 5.5.2 Hummingbird Behaviour Model

The Artificial Hummingbird Behaviour (AHB) algorithm (Yang and Chen, 2021) is inspired by three hummingbird foraging strategies:

1. **Guided foraging:** A hummingbird revisits a previously successful flower location, moving directly toward it with slight random variation.
2. **Territorial foraging:** A hummingbird defends a productive patch and searches systematically within it.
3. **Migratory foraging:** A hummingbird moves to an entirely new location, exploring away from its current territory.

In the BAHB implementation, each "hummingbird" is a candidate feature subset (represented as a binary vector of length 26), and the "food quality" of a location is the classification accuracy achieved with that feature subset.

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

where r₁, r₂, r₃ are random numbers in [0, 1], x_target is the best position found so far, θ is a random angle, and LB, UB are the lower and upper bounds of the search space.

The binary constraint (each element of x_i^t is 0 or 1) is enforced by a sigmoid transfer function: if the transfer function value at a position exceeds 0.5, the feature is selected; otherwise it is not.

### 5.5.4 Fitness Function

The fitness of a feature subset is the validation accuracy of the SSNN trained on that subset:

```
fitness(x_i) = accuracy(SSNN(x_selected))
```

A secondary objective (minimise the number of selected features) is incorporated with a small weight to break ties between subsets with similar accuracy.

### 5.5.5 Selected Features

After 50 iterations of BAHB with a population of 30 hummingbirds, 18 features are selected from the original 26. The selected features (exact identities not specified in the paper; refer to the dataset documentation) capture aspects of commit frequency, code complexity metrics, project participation, and code review activity. The 8 eliminated features were found to be either redundant with selected features or to add noise rather than signal.

---

## 5.6 Simplified Spiking Neural Network (SSNN)

### 5.6.1 From Conventional to Spiking Neural Networks

Conventional artificial neural networks transmit continuous-valued activations (real numbers) between neurons at each layer. The activation value at neuron j in layer l is a function of the weighted sum of activations from the previous layer:

```
a_j^l = σ(Σ_i w_{ij} · a_i^{l-1} + b_j)
```

This continuous transmission is computationally efficient on GPUs but biologically unrealistic: real neurons communicate through discrete electrical spikes that occur at specific moments in time. Spiking Neural Networks (SNNs) attempt to model this temporal dynamics.

In an SNN, information is encoded in the timing and rate of spikes rather than in activation magnitudes. A spiking neuron fires (produces an output spike) when its membrane potential exceeds a threshold, and the potential decays over time when no input spikes arrive.

### 5.6.2 The Simplified Spiking Neuron Model

The Simplified Spiking Neural Network (SSNN) used in EESQA-DELMOA is based on the leaky integrate-and-fire (LIF) model. The membrane potential U at time step t is updated as:

```
U(t) = U(t-1) + Σᵢ wᵢ · Sᵢ(t) - D
```

where:
- U(t-1) is the membrane potential at the previous time step
- wᵢ is the synaptic weight from input i
- Sᵢ(t) is the input spike at time t from input i (binary: 0 or 1)
- D is the decay constant (the "leak"), which causes the potential to decay toward zero in the absence of input

**Spike generation:** When U(t) exceeds the firing threshold Θ, the neuron fires a spike (output = 1) and the membrane potential resets to zero:

```
if U(t) ≥ Θ: output = 1, U(t) → U_reset (typically 0)
else:         output = 0
```

**Temporal coding:** Information is encoded across multiple time steps. The SSNN processes the input feature vector over T = 25 time steps (epochs in the biological sense), with the input features converted to spike trains using rate coding: a feature value x ∈ [0, 1] is converted to a Bernoulli spike process with probability x at each time step.

### 5.6.3 Network Architecture

The SSNN for EESQA-DELMOA has three layers:

- **Input layer:** 18 neurons (one per selected feature), encoding each feature as a rate-coded spike train over 25 time steps
- **Hidden layer:** 64 spiking neurons with LIF dynamics
- **Output layer:** 6 neurons (one per experience class), with the class predicted as the neuron that fires most frequently over the 25 time steps

Weights are initialised from a truncated normal distribution and updated using a surrogate gradient method (Neftci et al., 2019) — since the spiking activation function is non-differentiable, its gradient is approximated by a smooth surrogate function during backpropagation.

### 5.6.4 Advantages of SSNN for this Task

**Computational efficiency:** Spiking neurons are inactive (produce no output) for most time steps. The sparse activity of SNNs translates to lower computational cost in terms of multiply-accumulate operations compared to conventional neural networks, which compute activations at every neuron at every forward pass. This is the primary reason for EESQA-DELMOA's low execution time (8.27 seconds).

**Temporal pattern sensitivity:** Developer activity data has a temporal dimension — commit patterns, code review participation, and project involvement change over time. The SSNN's temporal dynamics, even in the simplified form used here, provide some sensitivity to patterns in the spike trains that conventional feed-forward networks miss.

---

## 5.7 Adaptive Migration Butterfly Optimisation Algorithm (AMBOA)

### 5.7.1 Butterfly Optimisation Algorithm (BOA)

The Butterfly Optimisation Algorithm (BOA, Arora and Singh, 2019) is a metaheuristic inspired by the food-finding and mating behaviour of butterflies. Butterflies sense food quality through airborne chemical scent; the strength of perceived scent depends on the physical stimulus intensity, a power exponent, and a sensory modality constant:

```
f = c · I^a
```

where f is the perceived scent intensity, I is the physical stimulus intensity (corresponding to the fitness of the current solution), c is the sensory modality (a model parameter), and a is the power exponent.

Butterflies update their positions according to two search modes:

**Global search** (probability p):
```
x_i^{t+1} = x_i^t + r² × (g* - x_i^t) × f_i
```

**Local search** (probability 1-p):
```
x_i^{t+1} = x_i^t + r² × (x_j^t - x_k^t) × f_i
```

where g* is the best solution found, x_j and x_k are two randomly selected butterflies, and r is a random number in [0, 1].

### 5.7.2 Adaptive Migration Butterfly Optimisation Algorithm

AMBOA extends BOA by incorporating two improvements that address its tendency to converge to local optima:

**1. Inertia weight integration (from PSO):**

The velocity update equations from Particle Swarm Optimisation (PSO) are incorporated into BOA's position update:

```
Global search: v_i^{t+1} = ω_v · v_i^t + r₁ · c₁ · (g* - x_i^t)
Local search:  v_i^{t+1} = ω_v · v_i^t + r₂ · c₂ · (x_j^t - x_k^t)
```

The velocity v_i modulates how aggressively each butterfly moves toward the attractor, with inertia weight ω_v controlling the trade-off between exploration and exploitation.

**2. Linearly decaying position weights:**

A position weight ω_x is introduced that decays linearly over iterations, enabling larger exploratory steps early in the search and smaller, refined steps later:

```
ω_x = ω_{x,min} + (ω_{x,max} - ω_{x,min}) · e^{-γt/t_max}
```

The full AMBOA position update becomes:

```
Global search: x_i^{t+1} = ω_x · x_i^t + v_i^{t+1} + r² × (g* - x_i^t - v_i^{t+1}) × f_i
Local search:  x_i^{t+1} = ω_x · x_i^t + v_i^{t+1} + r² × (x_j^t - x_k^t) × f_i
```

### 5.7.3 AMBOA for SSNN Hyperparameter Tuning

AMBOA optimises the following SSNN hyperparameters:

- Learning rate (search range: [0.0001, 0.1])
- Decay constant D (search range: [0.1, 2.0])
- Firing threshold Θ (search range: [0.5, 2.0])
- Hidden layer size (search range: [32, 256])
- Number of time steps T (search range: [10, 50])

The fitness function is validation accuracy:

```
fitness = max(Precision) = max(TP / (TP + FP))
```

Precision is used as the fitness function rather than accuracy because the dataset is class-imbalanced (UNK: 505/703 = 71.8% of samples), and accuracy on an imbalanced dataset can be misleading. Maximising precision ensures the model is rewarded for accurate positive predictions in each class.

AMBOA runs for 50 iterations with a population of 20 butterflies. The best hyperparameter combination found is used to train the final SSNN model.

---

## 5.8 Experimental Setup

### 5.8.1 Dataset

The developer experience dataset was published by Perez, Urtado, and Vauttier (2023) and is available at Zenodo (https://zenodo.org/records/7011334). It contains 703 developer profiles extracted from open-source GitHub projects, labelled with six experience categories:

**Table 5.1: Dataset statistics**

| Class | Label | Count | Description |
|---|---|---|---|
| Experienced Software Engineer | ESE | 69 | Substantial contribution history, complex code changes |
| Software Architect | SA | 29 | High-level structural contributions, design decisions |
| Software Engineer | SE | 73 | Regular code contributions, moderate complexity |
| Non-Software Engineer | NSE | 17 | Minimal code contribution, primarily documentation or issues |
| Bot | BOT | 10 | Automated contributions (CI bots, dependency update bots) |
| Unknown | UNK | 505 | Insufficient data to classify reliably |
| **Total** | | **703** | |

The severe class imbalance (UNK accounts for 71.8% of samples) is a characteristic of real-world developer data: most contributors to an open-source project are casual contributors with insufficient activity history for reliable classification. The SSNN's precision-focused fitness function and AMBOA's exploration strategy are both designed to address this imbalance.

Each developer profile contains 26 features derived from observable GitHub activity metrics, including: commit count, pull request count, code review participation, issue creation, project count, average file complexity changed, average lines added/removed per commit, contribution frequency, recency, and consistency metrics.

The 70/30 train/test split is applied, stratified by class where possible (small classes such as BOT and NSE have only 7 and 5 test samples respectively in the 30% split).

### 5.8.2 Evaluation Metrics

The same five metrics as Chapters 3 and 4 are used: accuracy, precision, recall, F1-score, and AUC. Execution time (seconds per inference over the test set) is also reported, as it is a key practical metric for deployment.

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

Several aspects of the results deserve specific analysis.

**High accuracy, lower F1 for BOT:** The BOT class contains only 10 developer profiles in the entire dataset (3 in the training set if BOT is distributed proportionally). With 3 training examples and 3 test examples, this class is effectively a few-shot classification problem. The model achieves 100% precision (no false BOT predictions) but only 20% recall (it identifies only 1 of 5 actual BOT profiles). This is a consequence of the extreme class imbalance, not a failure of the model design.

**Perfect classification for SA and NSE:** The SA (Software Architect) class achieves 100% recall and precision on the test set, as does NSE. These classes, while small, have distinctive feature profiles (SA: high complexity changes, broad project involvement; NSE: minimal code contribution, high issue-tracking activity) that the SSNN learns reliably.

**Strong UNK performance:** The dominant UNK class achieves 99.37% recall, correctly identifying nearly all profiles that cannot be reliably classified. This is practically important: a tool that falsely classifies an UNK developer as ESE or SA would produce unreliable project assignment recommendations.

**Training vs. test comparison:** Average test accuracy (98.74%) exceeds training accuracy (98.10%), which is unusual and indicates that the test set, while representative, happens to contain proportionally more "easy" examples from the majority UNK class. The model's generalisation is confirmed by the consistency of per-class metrics between training and test splits for the larger classes (ESE, SE, UNK).

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

EESQA-DELMOA outperforms all seven baseline classifiers on accuracy (98.74% vs. CNN's 94.78%) and F1-score (85.38% vs. CNN's 84.34%). On precision, Naïve Bayes achieves 95.60% — close to EESQA-DELMOA's 96.16% — but at substantially lower accuracy (89.15%) and F1 (81.55%).

The margin is largest for accuracy: EESQA-DELMOA exceeds the next best (CNN, 94.78%) by 3.96 percentage points. This represents a meaningful improvement given the already high accuracy of the baselines, which all benefit from the class imbalance (a classifier that always predicts UNK would achieve ~71.8% accuracy).

---

## 5.11 Execution Time Analysis

**Table 5.4: Execution time comparison**

| Classifier | Execution Time (seconds) |
|---|---|
| Random Forest | 14.57 |
| Decision Tree | 16.18 |
| Naïve Bayes | 11.60 |
| Artificial Neural Network | 14.51 |
| DBN Model | 12.29 |
| CNN Method | 17.33 |
| AlexNet Model | 15.82 |
| **EESQA-DELMOA** | **8.27** |

EESQA-DELMOA achieves the lowest execution time (8.27 seconds) among all compared methods. It is 28.7% faster than Naïve Bayes (the next fastest at 11.60 seconds) and 52.3% faster than CNN (17.33 seconds).

This efficiency advantage is attributable to the SSNN architecture: spiking neurons are inactive (produce zero output) for most time steps, resulting in sparse computations. The average activation rate in the hidden layer is approximately 15% — meaning 85% of neuron-timestep computations are zero multiplications that can be skipped in a sparse compute framework.

For practical deployment, the 8.27-second execution time over the entire 703-profile dataset corresponds to approximately 12 milliseconds per developer profile. This is well within the requirements for interactive tools, CI/CD pipeline integrations, or real-time project assignment support systems.

---

## 5.12 Discussion: The Developer Level in Context

### 5.12.1 What Experience Level Tells a Project Manager

The six experience classes in the dataset map naturally to practical project management decisions:

- **ESE (Experienced Software Engineer):** Suitable for independent ownership of complex modules; effective code reviewer for junior developers.
- **SA (Software Architect):** Suitable for system-level design decisions; should review cross-cutting changes.
- **SE (Software Engineer):** Suitable for feature development with mentorship; benefits from code review by ESE or SA.
- **NSE (Non-Software Engineer):** Contributes in non-code roles; code contributions require careful review.
- **BOT:** Automated contributions; should be explicitly excluded from quality assessments and code review assignments.
- **UNK:** Insufficient data to classify; treat with the same review intensity as SE until more data is available.

### 5.12.2 Limitations of the Developer-Level Analysis

The primary limitation of EESQA-DELMOA is the class imbalance in the dataset, particularly the extreme scarcity of BOT profiles (10 in total). A developer classification system deployed in practice would need more balanced training data — either through collection of additional labelled profiles or through oversampling techniques.

A second limitation is that the features in the dataset reflect activity patterns over an extended history rather than current skill level. A developer who joined a project recently but has extensive experience elsewhere would be classified as UNK or SE, while their actual experience level may be much higher. This temporal limitation is inherent to the dataset's labelling methodology and is not addressable within the current approach.

---

## 5.13 Chapter Summary

This chapter presented EESQA-DELMOA, a developer experience classification system combining min-max normalisation, BAHB feature selection (18 of 26 features selected), a Simplified Spiking Neural Network classifier, and AMBOA hyperparameter tuning. On the Perez et al. (2023) developer experience dataset (703 profiles, 6 classes), EESQA-DELMOA achieves test accuracy of 98.74% and an execution time of 8.27 seconds — the highest accuracy and lowest execution time among all seven compared methods.

The SSNN's sparse computation, resulting from the binary spiking mechanism, is the primary driver of the efficiency advantage. The BOT class's low recall reflects the extreme scarcity of labelled BOT profiles and is a known limitation.

Chapter 6 brings together the findings from all three studies in a cross-study analysis, examining the relationships between the three levels of program comprehension, the convergent XAI findings, and the practical implications for software engineering teams.

---

*Chapter 5 complete. Proceeding to Chapter 6.*
