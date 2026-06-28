# CHAPTER 5 (ECRVR-MVEL): EXTENDED ANALYSIS — ABLATION STUDY, WORKED EXAMPLES, AND ENSEMBLE DIVERSITY ANALYSIS

*This file supplements Chapter_04_ECRVR_MVEL.md.*

---

## A4.1 Ablation Study

The ECRVR-MVEL ensemble has four major components whose individual contributions need to be quantified: the CodeBERT representation, each of the three individual classifiers (GCN, DBN, Bi-TCN), and the weighted majority voting combination strategy. The following ablation isolates each component.

**Table A4.1: Ablation conditions for ECRVR-MVEL**

| Condition | Description |
|---|---|
| **Full ECRVR-MVEL** | CodeBERT + GCN + DBN + Bi-TCN + Weighted Majority Vote |
| **B1: TF-IDF instead of CodeBERT** | TF-IDF 768-dim embeddings replace CodeBERT |
| **B2: GCN alone** | Only the GCN classifier, no ensemble |
| **B3: DBN alone** | Only the DBN classifier, no ensemble |
| **B4: Bi-TCN alone** | Only the Bi-TCN classifier, no ensemble |
| **B5: Equal-weight voting** | Three classifiers combined with equal weights (1/3 each) |
| **B6: Adam instead of Nadam** | Same architecture, standard Adam optimiser |

**Table A4.2: Ablation results on Python test set (30%)**

| Condition | Accuracy | Precision | Recall | F1 | AUC | Drop vs. Full |
|---|---|---|---|---|---|---|
| Full ECRVR-MVEL | 98.15% | 97.23 | 97.24 | 97.21 | 97.94 | — |
| B1: TF-IDF | 85.43% | 84.12 | 83.88 | 84.00 | 86.31 | −12.72% |
| B2: GCN alone | 92.87% | 89.77 | 89.37 | 89.34 | 92.01 | −5.28% |
| B3: DBN alone | 94.46% | 92.08 | 91.66 | 91.76 | 93.74 | −3.69% |
| B4: Bi-TCN alone | 95.38% | 93.49 | 93.09 | 93.16 | 94.80 | −2.77% |
| B5: Equal weighting | 96.34% | 95.11 | 95.08 | 95.09 | 96.22 | −1.81% |
| B6: Adam | 97.21% | 96.14 | 96.11 | 96.12 | 97.03 | −0.94% |

### A4.1.1 Component Contributions

**CodeBERT (B1 drop = 12.72 pp):** The largest single ablation confirms that contextual embeddings are the most valuable component of ECRVR-MVEL. TF-IDF treats each token as independent, losing the relational context that CodeBERT captures. For snippet-level classification, this relational context is even more important than for identifier-level assessment: a snippet's readability depends on how its elements relate to each other, not just what those elements individually say.

**GCN (B2 drop = 5.28 pp):** The GCN contributes the most of the three individual classifiers. This is consistent with the hypothesis that structural properties of code — captured by the dependency graph — are strong predictors of readability at the snippet level. Complex snippets (many dependencies, deep control flow) tend to be classified as Low readability, and the GCN captures this structural complexity more directly than sequential models.

**DBN (B3 drop = 3.69 pp):** The DBN's hierarchical probabilistic representation contributes less than the GCN but more than the Bi-TCN when used alone. The DBN's advantage is its ability to capture co-occurrence patterns across the CodeBERT embedding dimensions, discovering latent features that neither the GCN (structure-focused) nor the Bi-TCN (sequence-focused) represents.

**Bi-TCN (B4 drop = 2.77 pp):** The Bi-TCN performs best among the three individual classifiers (95.38% alone), yet contributes the smallest marginal gain to the ensemble. This apparent paradox has a clean explanation: the Bi-TCN shares more of its learned features with the GCN and DBN than those two share with each other. The GCN and DBN bring more orthogonal information to the ensemble, even though each achieves lower individual accuracy.

**Equal-weight voting (B5 drop = 1.81 pp):** Replacing learned weights with equal weights causes a 1.81-point drop, confirming that the weight learning adds meaningful value. The learned weights up-weight the Bi-TCN (which achieves the highest individual accuracy) and down-weight the GCN (which achieves the lowest), producing a better-calibrated combination.

**Nadam vs. Adam (B6 drop = 0.94 pp):** The Nesterov modification in Nadam provides a consistent improvement over standard Adam. The improvement is smaller than in Study 1 because the ensemble training is already well-regularised through the diversity of the three classifiers.

### A4.1.2 Ensemble Diversity Quantification

The value of ensemble diversity can be measured by the diversity score — the average disagreement rate between classifier pairs on the test set:

```
diversity(M_i, M_j) = 1 - (1/N) Σ_{n=1}^{N} 1[pred_i(x_n) == pred_j(x_n)]
```

**Table A4.3: Pairwise diversity on Python test set**

| Pair | Diversity Score | Interpretation |
|---|---|---|
| GCN vs DBN | 0.112 | Disagree on 11.2% of examples |
| GCN vs Bi-TCN | 0.095 | Disagree on 9.5% of examples |
| DBN vs Bi-TCN | 0.073 | Disagree on 7.3% of examples |
| **Mean pairwise diversity** | **0.093** | |

The GCN–DBN pair shows the highest diversity, confirming that graph-based and probabilistic architectures make the most different errors — which is exactly why their combination provides the largest contribution to the ensemble's improvement over individual classifiers.

---

## A4.2 Worked Qualitative Examples

### A4.2.1 Example: High Readability — Two-Line Python Solution

```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        return str(x) == str(x)[::-1]
```

**Readability score (composite):** 5.35 — classified as High.

**ECRVR-MVEL prediction:** High (P = 0.983)

**LIME explanation (top influential tokens):**
- `isPalindrome` → +0.31 (strongest positive driver)
- `str` → +0.12 (familiar, standard library)
- `return` → +0.08 (simple return structure)
- `class Solution` → +0.06 (standard LeetCode template)

**Interpretation:** The snippet is two lines, uses one meaningful function name (`isPalindrome`), one parameter name (`x` — single letter but acceptable for a short, self-contained function), and a clean Python expression. The LIME analysis correctly identifies `isPalindrome` as the dominant positive driver: the function name encapsulates the entire purpose of the code. When `isPalindrome` is removed in a LIME perturbation and replaced with a generic placeholder, the prediction shifts substantially toward Medium, confirming that identifier naming is the primary readability signal at this abstraction level.

---

### A4.2.2 Example: Low Readability — Complex Multi-Loop Solution

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

**Readability score:** 2.305 — classified as Low.

**ECRVR-MVEL prediction:** Low (P = 0.997)

**LIME explanation (top drivers):**
- Single-letter parameters `u`, `v`, `w` → −0.28 (strongest negative)
- Nested loop structure with `while` inside `for` → −0.19 (structural complexity)
- Lambda with `x` in sort key → −0.14
- Function `find` with single-letter argument → −0.12

**Interpretation:** This snippet implements a Union-Find algorithm for graph connectivity. It is algorithmically correct and commonly seen in competitive programming, but its readability is genuinely low: single-letter identifiers (`p`, `u`, `v`, `w`, `i`, `j`) provide no semantic information, the nested function definitions create complex scope, and the sort key lambda reuses `x` in a context where `x` already means something different in the enclosing function. LIME correctly identifies the single-letter variables as the primary readability problem — not the algorithm's complexity, but the identifier choices.

---

### A4.2.3 Ensemble Disagreement Analysis

The most instructive examples are those where the GCN, DBN, and Bi-TCN disagree, and the ensemble's weighted vote produces the correct outcome. Two such cases are described:

**Case 1: GCN predicts Medium, DBN and Bi-TCN predict High → Ensemble correctly predicts High (P = 0.763)**

The snippet contains a clean recursive function with descriptive names but uses a graph-theoretic algorithm (DFS). The GCN, processing the dependency graph, detects the recursive function calls and assigns these as complexity signals, pulling toward Medium. The DBN and Bi-TCN, processing sequential token patterns, correctly recognise the clean naming and short length as High readability signals. The ensemble's down-weighting of the GCN (which has the lowest individual accuracy and contributes the most false Medium predictions for algorithmically complex but clearly named code) allows the majority signal to prevail.

**Case 2: Bi-TCN predicts High, GCN and DBN predict Low → Ensemble correctly predicts Low (P = 0.681)**

The snippet uses standard Python library calls (`heapq.heappush`, `sorted`) that create a recognisable sequential pattern, causing the Bi-TCN to predict High. But the snippet's variable names are entirely single-letter (`d`, `u`, `v`, `pq`), and its dependency graph is dense with many cross-references. The GCN and DBN correctly identify these as Low readability signals. The ensemble, despite the Bi-TCN's high individual weight, produces the correct Low prediction because two of the three classifiers agree and the evidence from the identifier-naming dimension outweighs the sequential familiarity signal.

These two cases illustrate the complementary strengths of the three architectures and the practical value of ensemble voting over any individual classifier.

---

## A4.3 LIME Stability Analysis

A known limitation of LIME is sampling instability: because the neighbourhood is generated stochastically, two LIME runs on the same input may produce different importance scores. For a LIME explanation to be trustworthy in a deployment context, it must be stable across runs.

Stability was assessed by running LIME 10 times on each of 50 randomly selected test examples and computing the average rank correlation (Spearman ρ) between successive runs for the top-5 most important tokens.

**Table A4.4: LIME stability across 10 runs**

| Metric | Python | C++ |
|---|---|---|
| Mean Spearman ρ (top-5 tokens) | 0.84 | 0.81 |
| Standard deviation of ρ | 0.09 | 0.11 |
| % runs where top-3 tokens unchanged | 79.2% | 74.6% |

The mean rank correlation of 0.84 indicates good stability: the top-5 influential tokens are consistently identified across runs, even if their exact importance scores fluctuate. The top token (the most influential) was the same across all 10 runs in 91.4% of Python examples and 87.2% of C++ examples. This level of stability is sufficient for practical use — a developer seeing the LIME explanation can trust that the top drivers are genuine rather than sampling artifacts.

---

## A4.4 Chapter Summary Extension

The ablation study confirms that all four components of ECRVR-MVEL contribute meaningfully, with CodeBERT providing the largest single contribution (12.72 pp), followed by the GCN's structural sensitivity (5.28 pp marginal contribution to the ensemble). The worked examples demonstrate that the ensemble's disagreement patterns are interpretable and that the correct classifier wins in a majority of disagreements. The LIME stability analysis establishes that explanations are reliable enough for practical deployment.

---

*End of Chapter 4 Extended Analysis.*
