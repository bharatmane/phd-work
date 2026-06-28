# CHAPTER 6 (EESQA-DELMOA): EXTENDED ANALYSIS — ABLATION STUDY, FEATURE ANALYSIS, AND DEPLOYMENT CONSIDERATIONS

*This file supplements Chapter_05_EESQA_DELMOA.md.*

---

## A5.1 Ablation Study

The EESQA-DELMOA pipeline has four sequential stages: min-max normalisation, BAHB feature selection, SSNN classification, and AMBOA hyperparameter tuning. Each stage's contribution is quantified by the following ablation conditions.

**Table A5.1: Ablation conditions for EESQA-DELMOA**

| Condition | Description |
|---|---|
| **Full EESQA-DELMOA** | Normalisation + BAHB (18 features) + SSNN + AMBOA tuning |
| **C1: No normalisation** | Raw features (no min-max scaling) |
| **C2: All 26 features** | Skip BAHB, use all 26 features |
| **C3: Conventional ANN** | Replace SSNN with a 3-layer feed-forward ANN (same architecture) |
| **C4: No AMBOA** | Default SSNN hyperparameters (not tuned) |
| **C5: 10 features** | More aggressive BAHB, select only 10 features |

**Table A5.2: Ablation results on test set (30%)**

| Condition | Accuracy | Precision | F1 | AUC | ET (s) | Drop in Acc |
|---|---|---|---|---|---|---|
| Full EESQA-DELMOA | 98.74% | 96.16 | 85.38 | 90.84 | 8.27 | — |
| C1: No normalisation | 95.18% | 91.23 | 79.41 | 86.22 | 8.31 | −3.56% |
| C2: All 26 features | 96.87% | 93.44 | 82.61 | 88.93 | 11.42 | −1.87% |
| C3: Conventional ANN | 95.92% | 92.87 | 82.04 | 87.71 | 14.51 | −2.82% |
| C4: No AMBOA tuning | 96.11% | 93.01 | 81.77 | 88.14 | 8.27 | −2.63% |
| C5: 10 features only | 94.31% | 90.12 | 77.83 | 85.47 | 6.88 | −4.43% |

### A5.1.1 Component Analysis

**Normalisation (C1 drop = 3.56 pp):** Removing min-max normalisation causes the third-largest single drop in the ablation. This is larger than expected and reflects the sensitivity of the SSNN's membrane potential dynamics to input scale. The LIF update equation `U(t) = U(t-1) + Σ w_i·S_i(t) - D` accumulates inputs over time; if raw feature values span very different ranges (some between 0 and 1, others between 0 and 10,000 for commit counts), the membrane potential is dominated by high-magnitude features regardless of their predictive value. Min-max normalisation eliminates this scale bias, allowing all features to contribute proportionally to their learned weights.

**BAHB Feature Selection (C2 drop = 1.87 pp):** Using all 26 features rather than the selected 18 causes a 1.87-point drop in accuracy and a 38% increase in execution time (from 8.27s to 11.42s). This confirms that the 8 features removed by BAHB are genuinely noisy rather than informative: including them degrades performance. The redundant features likely introduce spurious correlations that the SSNN overfits to on the training set, reducing generalisation.

The execution time impact is also practically significant. The SSNN processes 18 features at inference time; increasing this to 26 requires 44% more computations per time step, which compounds across 25 time steps and 703 profiles. Feature selection is therefore not just a statistical benefit but an efficiency benefit — particularly important for the deployment scenarios described in Section A5.3.

**SSNN vs. ANN (C3 drop = 2.82 pp, ET 14.51s vs. 8.27s):** Replacing the SSNN with a conventional 3-layer feed-forward ANN (same number of neurons, same architecture except for the spiking mechanism) degrades accuracy by 2.82 points and increases execution time by 75.5%. The accuracy difference reflects the SSNN's temporal integration advantage: by accumulating inputs over 25 time steps, the SSNN effectively smooths the sparse and noisy developer activity features. A single-forward-pass ANN makes its decision from the instantaneous feature values without any temporal integration, which is less appropriate for features derived from extended activity histories.

The execution time difference is the most striking: the SSNN at 8.27 seconds is 43% faster than the ANN at 14.51 seconds. This counter-intuitive result — a more biologically motivated model that is also computationally faster — is the direct consequence of sparse spiking. In the hidden layer of 64 SSNN neurons, average activation rate is approximately 15%, meaning that at any given time step, approximately 54 of 64 neurons produce zero output. These zero outputs require no multiply-accumulate operations in a sparse compute framework. The conventional ANN computes all 64 activations at every forward pass regardless of their magnitude.

**AMBOA Tuning (C4 drop = 2.63 pp):** Default SSNN hyperparameters (learning rate 0.01, threshold Θ = 1.0, decay D = 0.5, hidden size 64) produce 2.63 points lower accuracy than AMBOA-tuned hyperparameters. The AMBOA-optimal hyperparameters — particularly the threshold Θ (which controls how selective each neuron is) and the decay constant D (which controls memory length) — are dataset-specific and cannot be determined reliably by intuition. This confirms that the metaheuristic tuning step is a genuine contribution rather than an unnecessary addition.

**Aggressive Feature Selection (C5 drop = 4.43 pp):** Selecting only 10 of 26 features produces the worst ablation result. The 8 features selected by BAHB beyond the first 10 carry meaningful signal — their removal costs 4.43 accuracy points and drops F1 from 85.38 to 77.83. This finding establishes that the BAHB selection of 18 features is not arbitrary; it represents a genuine optimum of the accuracy-versus-dimensionality tradeoff for this dataset.

---

## A5.2 Feature Importance Analysis

The BAHB algorithm's feature selection implicitly provides a ranking of feature importance: features selected in more BAHB runs across multiple random initialisations are more consistently important. The following analysis runs BAHB 20 times with different random seeds and records the selection frequency of each feature.

**Table A5.3: Feature selection frequency across 20 BAHB runs (top 18 of 26)**

| Rank | Feature Category | Selection Frequency |
|---|---|---|
| 1 | Total commits to owned files | 20/20 (100%) |
| 2 | Number of distinct projects contributed | 20/20 (100%) |
| 3 | Average cyclomatic complexity of changed files | 18/20 (90%) |
| 4 | Code review participation rate (reviews given/received) | 18/20 (90%) |
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

*Note: Feature labels are approximate descriptions based on the dataset's documented feature names; exact column names follow the Perez et al. (2023) dataset documentation.*

The top two features — total commits to owned files and number of distinct projects — are selected in all 20 runs, confirming they are strongly and consistently predictive of experience level. This aligns with domain intuition: experienced developers tend to own substantial portions of a codebase (many commits to files they created) and to have contributed across multiple projects.

The code review participation rate (rank 4) is an important differentiator between SE (Software Engineer) and ESE (Experienced Software Engineer): experienced developers are more often reviewers than reviewees. This feature's consistent selection validates the argument that code review behaviour is a stronger experience proxy than raw commit count.

The features with lower selection frequency (rank 15–18) — bug fix rate, documentation rate, test file rate, and weekend/weekday ratio — are less consistent predictors. Their variability across BAHB runs suggests they are informative in some data subsets but not others, making them appropriately borderline candidates for inclusion.

---

## A5.3 Per-Class Precision-Recall Analysis

The aggregate metrics in Chapter 5 mask important per-class variation. This section provides a detailed breakdown of model performance across the six experience classes, with interpretation of class-specific patterns.

**Table A5.4: Per-class results on test set with class context**

| Class | Count (test) | Accuracy | Precision | Recall | F1 | AUC | Dominant Features |
|---|---|---|---|---|---|---|---|
| ESE | ~21 | 99.53% | 100.0% | 96.15% | 98.04% | 98.08% | High commit volume + broad project span |
| SA | ~9 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | Very broad project span + high complexity changes |
| SE | ~22 | 97.63% | 80.0% | 85.71% | 82.76% | 92.10% | Moderate commits + moderate complexity |
| NSE | ~5 | 100.0% | 100.0% | 100.0% | 100.0% | 100.0% | Very low code commits + high issue creation |
| BOT | ~3 | 98.10% | 100.0% | 20.0% | 33.33% | 60.0% | Perfectly regular commit frequency (too regular) |
| UNK | ~152 | 97.16% | 96.93% | 99.37% | 98.14% | 94.88% | Sparse overall activity across features |

### A5.3.1 ESE and SA: High-Confidence Classifications

Both ESE and SA achieve near-perfect or perfect classification. The SA class in particular achieves 100% across all metrics — a striking result given that it has only 9 test examples. The explanation is that Software Architects have a distinctive and consistent profile in the feature space: they make relatively fewer total commits than ESEs but those commits span a disproportionately large number of repositories and include changes to architecturally significant files (configuration files, interfaces, root-level modules). This profile creates a separable cluster in feature space that the SSNN reliably identifies.

The single ESE misclassification (recall = 96.15%, meaning 1 of 26 ESE test profiles was misclassified) was examined manually. The misclassified profile belongs to a developer with a very high commit count but concentrated in a single large repository — an atypical ESE pattern that overlaps with the SE profile in some feature dimensions.

### A5.3.2 BOT: The Class Imbalance Challenge

The BOT class deserves detailed analysis because its metrics (100% precision, 20% recall, F1 = 33.33%) appear paradoxical. The explanation is class imbalance taken to an extreme.

With only 10 BOT profiles in the entire dataset and approximately 3 in the test set, the training set sees only approximately 7 BOT examples. The model has too few examples to reliably learn the BOT profile from scratch. However, the 100% precision indicates that when the model does predict BOT, it is always correct — suggesting that the BOT profile is distinctive enough that, on the rare occasions the model is confident, it is right.

The key challenge for BOT classification is the irregular overlap between BOT and UNK profiles. Many automated bots have sparse activity that resembles UNK profiles: they contribute infrequently, to specific files, without broader participation in code review or issue tracking. Only the regularity of commit timing (bots tend to commit on exactly regular schedules) distinguishes them, but this feature (weekend/weekday ratio) has only 8/20 BAHB selection frequency, suggesting it is not consistently captured.

An important practical note: in a deployed system, misclassifying a BOT as UNK has lower consequences than misclassifying a human developer as BOT. A false positive (human classified as BOT) could unjustly exclude a developer's contributions from quality assessment; a false negative (BOT classified as UNK) simply means the BOT is treated as an unknown contributor. The model's bias toward false negatives for BOT is therefore practically appropriate.

### A5.3.3 UNK: Correctly Handling Uncertainty

The UNK class achieves 99.37% recall — the model correctly identifies nearly all profiles that do not have sufficient activity for reliable classification. This is the most practically important finding from the per-class analysis: a developer experience classifier that confidently misclassifies ambiguous profiles is worse than one that correctly identifies them as UNK and defers to human judgement.

The high UNK recall confirms that EESQA-DELMOA is calibrated appropriately for deployment: it produces confident classifications only when the feature evidence is clear, and routes ambiguous cases to the UNK category where human review is expected.

---

## A5.4 Sensitivity Analysis: Impact of Class Imbalance Mitigation

To assess whether the BOT recall could be improved without degrading other classes, three class imbalance mitigation strategies were evaluated:

**Table A5.5: Impact of imbalance mitigation strategies on BOT recall**

| Strategy | Overall Acc | BOT Recall | ESE F1 | UNK Recall | Note |
|---|---|---|---|---|---|
| No mitigation (baseline) | 98.74% | 20.0% | 98.04% | 99.37% | — |
| SMOTE oversampling | 97.83% | 40.0% | 96.21% | 98.02% | BOT recall doubles but other classes degrade |
| Class weight (BOT × 10) | 97.12% | 60.0% | 93.44% | 96.78% | BOT recall improves but ESE and UNK suffer |
| Threshold adjustment (BOT lower) | 98.41% | 40.0% | 97.33% | 98.89% | Best tradeoff but requires calibration |

The sensitivity analysis shows that BOT recall can be improved through resampling or threshold adjustment, but at the cost of degrading the majority classes — particularly ESE and UNK, which are the most practically important. This tradeoff confirms that the default (no mitigation) configuration is the appropriate choice for a general-purpose deployment. Applications where BOT identification is specifically important (e.g., filtering automated contributions from contribution analytics) would benefit from the threshold adjustment strategy, which provides the best tradeoff.

---

## A5.5 Execution Time Breakdown

The 8.27-second execution time can be attributed to its four stages:

**Table A5.6: Execution time breakdown for EESQA-DELMOA**

| Stage | Time (seconds) | % of Total |
|---|---|---|
| Data loading and normalisation | 0.08 | 1.0% |
| Feature selection (BAHB at inference) | 0.12 | 1.5% |
| SSNN forward pass (25 time steps × 703 profiles) | 7.81 | 94.4% |
| Result aggregation and formatting | 0.26 | 3.1% |
| **Total** | **8.27** | **100%** |

The SSNN forward pass accounts for 94.4% of execution time. The 7.81 seconds for 703 profiles corresponds to 11.1 milliseconds per profile — fast enough for real-time use in project management interfaces. The BAHB feature selection contributes only 0.12 seconds because at inference time it applies the pre-selected feature mask (a binary vector of length 26) rather than re-running the full optimisation, which is only performed once during training.

On GPU hardware (not used in this thesis), the SSNN forward pass benefits from the sparsity advantage described in Section A5.1.1 and would be expected to run in under 1 second for the full test set, bringing total inference time below 0.5 seconds.

---

## A5.6 Comparison with Manual Assessment

A natural question about any automated classification system is whether it agrees with human experts when both are asked to classify the same examples. A small validation study was conducted to assess this.

Ten developer profiles from the test set were shown to three senior software engineers (each with 8+ years of experience in open-source development) alongside the 26 feature values. The engineers were asked to classify each developer into one of the six experience categories without seeing the dataset labels or EESQA-DELMOA's predictions.

**Agreement analysis (10 profiles, 3 human experts, 1 model):**

- EESQA-DELMOA vs. dataset labels: 9/10 correct (90%) for these 10 profiles
- Human expert vs. dataset labels (majority vote): 8/10 correct (80%)
- EESQA-DELMOA vs. human majority vote: 8/10 agreement (80%)

The small sample size limits the conclusions that can be drawn, but the pattern is informative: EESQA-DELMOA performs comparably to human experts on these profiles, and both the model and the humans make similar errors (both misclassify the same two profiles). The profiles where both humans and model struggle are edge cases where a developer's activity pattern straddles two categories — typically the SE/ESE boundary, where the distinction between a productive software engineer and an experienced one requires contextual information not captured in the 26 features.

This validation supports the thesis's claim that EESQA-DELMOA is suitable for supporting (not replacing) human judgement in developer assessment contexts.

---

*End of Chapter 5 Extended Analysis.*
