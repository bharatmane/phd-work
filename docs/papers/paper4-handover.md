# Paper 4 Handover — "When Readable Is Not Correct"

**Session date**: 2026-06-02
**Status**: CONFIRMED NOVEL — Full plan ready, execution can begin

---

## Novelty Confirmed (The Readability Spectrum — Read in Full)

The closest competitor (arXiv:2605.13280, Ye et al., Peking University, May 2026) was read page by page. Verdict: **NOT competing — it's our motivation paper.**

**What they do**: Compare readability of LLM code vs human-written code using a 61-feature model (TF + BWF + PF + DF, 77.5% accuracy, logistic regression). 5,869 prompts from World of Code + LeetCode. **Zero correctness labels. Zero test execution.**

**What they find**: LLM code is MORE readable than human code (p<0.001, r=0.398), but has distinct issue patterns (Excessive Complexity, Redundant Comments, Unknown API, Redundant Variables, Overblanking).

**The key quote from their Discussion** (p.10) — use this in our paper's introduction:
> *"our finding that LLMs achieve numerical readability parity with humans while introducing distinct readability issues highlights... **a novel critical correctness-readability gap**. Models that generate functionally correct but cryptic code ultimately impose greater cognitive burdens on developers."*

They name the gap. We fill it — from the opposite and more dangerous direction:
- Their concern: correct but unreadable → cognitive burden
- **Our contribution: readable but incorrect → false trust (DRI)**

**DRI metric**: Confirmed no prior art in any paper. Zero results for "Deceptive Readability Index" in code context.

**IRAF-XADL as instrument**: Their model (77.5% accuracy, structural/visual metrics) vs ours (98%+ accuracy, CodeBERT + SA-BiLSTM, 10 cognitive parameters). Completely different. Our per-parameter RQ4 analysis is unique.

---

## Paper

**Title**: *"When Readable Is Not Correct: Quantifying the Readability-Correctness Decoupling in LLM-Generated Code Using Cognitive Parameter Analysis"*

**Target**: IEEE Access (Scopus Q1, open access, IEEE-branded, no page limit, 4-8 week review)

**Estimated length**: 15-20 pages (IEEE double-column format)

---

## The DRI Metric

```
DRI(c) = P_High(c) × (1 − pass_ratio(c))
```

| DRI | Meaning | Risk |
|-----|---------|------|
| 0 | Unreadable OR correct | Safe |
| 0–0.3 | Low deception | Caution |
| 0.3–0.6 | Moderate deception | Warning |
| ≥ 0.6 | Readable + wrong | **Critical** |

`DRI@Model = mean DRI for all samples from that LLM`

---

## Four Research Questions

- **RQ1**: Statistically significant readability difference: correct vs. incorrect LLM code?
- **RQ2**: Does readability score predict correctness? (Expected: No, AUC < 0.65)
- **RQ3**: Does the gap vary across LLM architectures?
- **RQ4**: Which of the 10 IRAF-XADL parameters (MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED) drive deceptive readability? (Expected: MC and LF)

---

## Dataset (Zero API Cost)

### Benchmarks
- **HumanEval+** (164 Python problems, 80× tests): `load_dataset("evalplus/humanevalplus")`
- **MBPP+** (378 Python problems, 35× tests): `load_dataset("evalplus/mbppplus")`

### LLM Solutions (pre-generated, free download)
- EvalPlus v0.1.0 release: https://github.com/evalplus/evalplus/releases/tag/v0.1.0
- Files: `${MODEL_NAME}_temp_${TEMPERATURE}.zip`
- Available: CodeLlama-7B/13B/34B, CodeLlama-Python variants, WizardCoder, StarCoder, Codex
- **Select 5 models** spanning capability range for RQ3

Total: ~542 problems × 5 models = ~2,710 samples

---

## Experiment Pipeline

```
1. Download EvalPlus datasets (HumanEval+, MBPP+) via Hugging Face
2. Download EvalPlus v0.1.0 pre-generated solutions (5 models) from GitHub releases
3. Run: evalplus.evaluate --dataset humaneval+ --samples solutions.jsonl
   → get pass_ratio per sample
4. Add /batch endpoint to apps/api/api.py (one small addition)
5. POST all samples to /batch → get P_High, features[MC..PRED], structural metrics
6. Compute DRI = P_High × (1 − pass_ratio) for each sample
7. Statistical analysis:
   - RQ1: Mann-Whitney U + Cohen's d
   - RQ2: Spearman ρ + Logistic Regression AUC
   - RQ3: Kruskal-Wallis + Dunn post-hoc
   - RQ4: Feature importance from logistic regression on 10 parameters
8. Case studies: top-10 high-DRI samples per model
```

---

## Infrastructure (apps/api/)

**Existing (ready)**:
- `api.py` — POST `/predict` endpoint; returns P_High/P_Medium/P_Low + 10 features + structural
- `src/model.py` — SA-BiLSTM (3 layers, 128 units, 4-head attention)
- `src/features.py` — 10 cognitive parameters (MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED)
- `src/preprocess.py` — Python AST identifier extraction

**One addition needed**:
```python
# Add to apps/api/api.py
@app.post("/batch")
def batch_predict(samples: list[PredictRequest]):
    return [predict(s) for s in samples]
```

**New scripts** (create in `experiment/` folder):
- `download_evalplus.py` — download datasets + solutions
- `run_correctness.py` — evalplus.evaluate wrapper
- `score_readability.py` — batch POST to /batch
- `compute_dri.py` — merge + compute DRI
- `analyze.py` — all statistical tests + figures
- `case_study.py` — top-N high-DRI sample extraction

---

## Paper Outline (IEEE Access)

| Section | Content |
|---------|---------|
| Abstract | RQs, method, key finding (H1 confirmed + DRI), implication |
| I. Introduction | AI adoption; verification paradox (SO 2025: 96% distrust, 48% verify); Ye et al. (2025) identify correctness-readability gap; we measure it |
| II. Background & Related Work | Buse&Weimer 2010, Scalabrino 2016, IRAF-XADL (Paper 1), Readability Spectrum (Ye 2025), Atlassian study, Bug Survey 2025, Beyond Functional Correctness (Wang 2024) |
| III. Motivation | 3 illustrative examples of high-DRI code; DRI definition; RQs + hypotheses |
| IV. Study Design | Datasets; LLM selection; pipeline; DRI formula; statistical plan; threats |
| V. Results | RQ1 (boxplots), RQ2 (regression table), RQ3 (DRI@Model table+chart), RQ4 (feature importance chart), DRI distribution histogram |
| VI. Discussion | H1-H4 revisited; CI/CD integration; case studies; limitations |
| VII. Conclusion | DRI as dual-scoring layer; future: multi-agent, Java/C++, security angle |

**Write order**: IV → V → II → I → III → VI → VII → Abstract

---

## Key Differentiator for Reviewers

> The Readability Spectrum (Ye et al., 2025) uses a 77.5%-accurate logistic regression on 61
> surface/structural features to compare LLM vs human code readability. We use IRAF-XADL's
> 98%+-accurate SA-BiLSTM on 10 **cognitive semantic parameters** (MC, NC, OL, DR, PR, LF, CC,
> SA, CLS, PRED) to measure readability within LLM-generated code against correctness ground truth.
> Different instrument, different question, different direction, different contribution.

---

## Critical References

| Paper | Why | Where to cite |
|-------|-----|---------------|
| Ye et al. 2025 — Readability Spectrum | **The motivation paper** — they name our gap | Section I (Introduction) + Section II |
| Paper 1 (IRAF-XADL) — your own | The measurement instrument | Section II + IV |
| Gao et al. 2025 — Bug Survey | Semantic bugs dominate; false-correct appearance | Section I |
| Wang et al. 2024 — Beyond Functional Correctness | Style/correctness orthogonality — our starting point | Section II |
| Stack Overflow 2025 | Verification paradox (96/48 stat) | Section I |
| He et al. 2026 — Speed at Cost of Quality | Tech debt from AI code | Section I |
| Chen et al. 2021 — HumanEval | Primary dataset | Section IV |
| Austin et al. 2021 — MBPP | Secondary dataset | Section IV |
| Li et al. 2023 — EvalPlus | Enhanced benchmark justification | Section IV |

---

## Next Session — Start Here

1. `pip install evalplus datasets`
2. Download HumanEval+ and MBPP+ via Hugging Face
3. Download EvalPlus v0.1.0 solution ZIPs from GitHub releases
4. Add `/batch` endpoint to `apps/api/api.py`
5. Run smoke test: score 10 samples, verify DRI computes end-to-end
6. Full run: all ~2,710 samples
7. Begin writing Section IV (Study Design)

Full plan: `C:\Users\bhara\.claude\plans\serene-exploring-cherny.md`
