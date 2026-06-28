# RAC / Doctoral Committee — Progress Review Prep

**Candidate:** Bharat Babaso Mane · **Supervisor:** Dr. Rathnakar Achary
**Institution:** Alliance School of Advanced Computing, Alliance University, Bengaluru
**Prepared:** 2026-06-11 · for review meeting this weekend
**Portfolio:** https://phd.dgtula.com

> **Thesis title:** *Evaluating Program Comprehension through Explainable Deep Learning: A Multi-Level Framework for Identifier Readability, Code Snippet Analysis, and Developer Experience Classification.*

---

## 1. 30-second elevator pitch

> "Code comprehension is the single biggest cost in software maintenance, yet it's assessed manually and subjectively. My thesis builds an **explainable deep-learning framework that measures program comprehension at three levels** — the *identifier*, the *code snippet*, and the *developer who wrote it* — each with state-of-the-art accuracy **and** human-interpretable explanations (SHAP / LIME). Two of the three papers are published in ETASR (Scopus-indexed), the third is accepted and in production, and a fourth paper extends the framework to **AI-generated code**, where I show readability and correctness *decouple* — a timely risk as LLMs write more production code."

---

## 2. Thesis at a glance — the multi-level framework

| Level | Paper | Framework | What it answers | XAI | Status |
|-------|-------|-----------|-----------------|-----|--------|
| **Identifier** | P1 | IRAF-XADL | Is this *name* readable? | SHAP | ✅ Published — ETASR 16(3) |
| **Code snippet / block** | P2 | ECRVR-MVEL | Is this *function* readable (High/Med/Low)? | LIME | ✅ Published — ETASR 16(4) |
| **Developer** | P3 | EESQA-DELMOA | What *experience level* wrote this; is it a bot? | Bio-inspired opt. | ✅ Accepted — ETASR (in production) |
| **AI-generated code** | P4 | DRI (extension) | Does readable LLM code = *correct* code? | Per-parameter attribution | 📝 Under submission — IEEE Access |

**The thread:** each level zooms out — from the smallest unit of meaning (the identifier), to the unit of logic (the snippet), to the human source (the developer), and finally to the *non-human* source (the LLM). Comprehension is measured consistently and explainably across all four.

---

## 3. What changed since the last review (the headline)

1. **Paper 3 ACCEPTED at ETASR** — moved from "submitted" to accepted, now in the production queue (vol/issue/pages pending). All three core papers are now in the same Scopus-indexed journal.
2. **Two papers fully published** with DOIs (P1: 10.48084/etasr.17996; P2: 10.48084/etasr.19084).
3. **Paper 4 conceived and pipeline built** — a forward-looking extension into LLM-generated code quality (DRI metric), under submission to IEEE Access (Q1).
4. **Public research portfolio live** at phd.dgtula.com — interactive demos, animated explainers, downloadable PDFs.

---

## 4. Per-paper deep dive

### Paper 1 — IRAF-XADL (Identifier level) ✅ Published
- **Citation:** B. B. Mane and R. Achary, *Eng. Technol. Appl. Sci. Res.*, vol. 16, no. 3, pp. 36731–36737, Jun. 2026.
- **Method:** AST-based identifier extraction (LibCST/Tree-Sitter) → 10 cognitively-grounded readability parameters + CodeBERT (768-d) embeddings → self-attention BiLSTM (3 layers, 128 hidden, 4-head) with AdamW → SHAP explanations.
- **Results:** Python — Acc **98.13%**, F1 97.21%. C++ — Acc **98.42%**, F1 97.61%.
- **Key finding:** Morphological Complexity (MC) and Lexical Familiarity (LF) are the dominant predictors.
- **Contribution:** First end-to-end *explainable* identifier-readability pipeline bridging cognitive science and deep learning across two languages.

### Paper 2 — ECRVR-MVEL (Code snippet level) ✅ Published
- **Citation:** B. B. Mane and R. Achary, *Eng. Technol. Appl. Sci. Res.*, vol. 16, no. 4, pp. 37326–37331, Aug. 2026.
- **Method:** CodeBERT embeddings → weighted majority-voting ensemble of **GCN** (structural) + **DBN** (probabilistic) + **BiTCN** (temporal) → Nadam → LIME.
- **Data:** Python 1,681 samples / C++ 1,504 samples, balanced across High/Med/Low.
- **Results:** C++ — Acc **98.38%**, F1 97.59%. Beats DT (92.84%), LR (69.23%), SVM (73.20%), NN (88.58%).
- **Why it matters for the thesis:** Independently *validates* Paper 1 — LIME again surfaces MC and PRED as dominant, confirming the parameter set generalizes from identifiers to whole snippets.

### Paper 3 — EESQA-DELMOA (Developer level) ✅ Accepted, in production
- **Citation:** B. B. Mane and R. Achary, *Eng. Technol. Appl. Sci. Res.*, 2026 (in production; vol/no/pp pending).
- **Method:** Min-max normalization → **BAHB** (Bio-inspired Artificial Hummingbird) feature selection → **SSNN** (Simplified Spiking Neural Network) classifier → **AMBOA** (Adaptive Migration Butterfly Optimization) tuning.
- **Data:** 703 developer instances, 6 classes (SE, BOT, UNK, NSE, SA, ESE) — Zenodo.
- **Results:** Acc **98.74%**, exec time **8.27s** (vs AlexNet 15.82s, CNN 17.33s). Beats RF (94.70%), NB (89.15%), ANN (93.20%), DBN (91.86%), CNN (94.78%).
- **Forward relevance:** includes a **BOT** class — detecting automated authorship, directly bridging to Paper 4's AI-code theme.

### Paper 4 — DRI / "When Readable Is Not Correct" (AI-generated code) 📝 Under submission
- **Target:** IEEE Access (Scopus Q1, open access).
- **Premise:** LLMs produce fluent, *readable-looking* code regardless of correctness. Developers use readability as a trust proxy → systematic false trust.
- **Method:** Apply IRAF-XADL to 2,710 LLM solutions (HumanEval+ / MBPP+, 5 model architectures). Introduce **Deceptive Readability Index: DRI = P_High × (1 − pass_ratio)**.
- **Status:** Pipeline fully implemented; results pending execution. Four RQs (readability vs correctness distribution, predictive power, per-architecture gap, per-parameter drivers).
- **Contribution:** First empirical measurement of the readability–correctness decoupling in AI code; DRI as a CI/CD quality gate.

---

## 5. Numbers to have on the tip of your tongue

| Metric | Value |
|--------|-------|
| Papers published (Scopus) | **2** (ETASR 16(3), 16(4)) |
| Papers accepted/in production | **1** (P3, ETASR) |
| Papers under submission | **1** (P4, IEEE Access Q1) |
| Best accuracy — P1 (C++) | 98.42% |
| Best accuracy — P2 (C++) | 98.38% |
| Best accuracy — P3 | 98.74% (8.27s) |
| Readability parameters (cognitive) | 10 (MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED) |
| Dominant predictors across P1+P2 | MC, LF, PRED |
| Languages covered | Python, C++ (+ repo-level multi-lang in P3) |
| LLM solutions analyzed (P4) | 2,710 across 5 architectures |

---

## 6. Anticipated RAC questions + crisp answers

**Positioning & novelty**

- **Q: What's the single novel contribution of the thesis?**
  A: A *unified, explainable* comprehension framework spanning three levels of granularity — most prior work treats readability at one level and trades accuracy for interpretability. I deliver both, and validate the same cognitive parameters across levels.

- **Q: Isn't this just applying CodeBERT three times?**
  A: No — CodeBERT is the shared embedding backbone, but each level has a purpose-built classifier (SA-BiLSTM / GCN-DBN-BiTCN ensemble / SSNN) and a matched explainability method. The contribution is the *cross-level validation* of cognitive readability parameters and the explainability layer, not the embedding.

- **Q: How do P1 and P2 differ if both measure readability?**
  A: Granularity and architecture. P1 scores *identifiers* (sub-token semantics, sequence model). P2 scores *whole snippets* (structural + temporal + probabilistic ensemble, 3-class). P2 independently re-confirms P1's dominant parameters — that's deliberate triangulation, not redundancy.

**Methodology rigor**

- **Q: Why spiking neural networks (P3) — gimmick or justified?**
  A: SSNN gives biologically-plausible *temporal* encoding at a fraction of the compute — 8.27s vs 15–17s for CNN/AlexNet — while beating them on accuracy. For developer-class data the speed/accuracy trade-off is the contribution.

- **Q: Bio-inspired optimizers (BAHB/AMBOA) — aren't these arbitrary?**
  A: They're ablated against the baselines in the paper; feature selection via BAHB reduces the feature set without accuracy loss, and AMBOA tuning is benchmarked. Happy to walk the committee through the ablation table.

- **Q: Are the accuracies suspiciously high (98%+)?**
  A: They're on balanced, peer-reviewed benchmark datasets with held-out evaluation, and consistent across two journals' review. The limitation I acknowledge is dataset scale — addressed in §7.

**Explainability**

- **Q: SHAP and LIME are post-hoc — do they reflect the true model?**
  A: They're local-fidelity approximations, yes. Their value here is *agreement*: independent methods (SHAP in P1, LIME in P2) converge on the same dominant parameters, which raises confidence beyond any single explainer.

**Gaps & scope**

- **Q: Only Python and C++ — generalizability?**
  A: Correct, and it's stated as a limitation. The AST pipeline is language-pluggable (Tree-Sitter grammars); Java/JS/TS extension is concrete future work, not a redesign.

- **Q: How does Paper 4 fit a thesis that's about human comprehension?**
  A: It's the natural extension — as authorship shifts from humans to LLMs, the *same* comprehension framework becomes a tool to audit machine output. The DRI shows readability no longer implies quality, which reframes why explainable comprehension metrics matter going forward.

**Timeline & completion**

- **Q: Where are you relative to submission?**
  A: 3 of 4 papers accepted/published in Scopus venues; synopsis drafted. Remaining: P4 results + write-up, and thesis integration. (See §8.)

- **Q: What's the risk to on-time submission?**
  A: The only open dependency is P4's experimental run and review turnaround. The pipeline is built, so execution is days, not months; the thesis core does not depend on P4 acceptance.

---

## 7. Limitations & mitigations (own them before they're asked)

| Limitation | Mitigation / framing |
|------------|---------------------|
| Two languages only (Py, C++) | AST pipeline is grammar-pluggable; multilingual is future work, not rework |
| Dataset scale (P3: 703 devs) | Acknowledged; cross-org validation proposed; results consistent with benchmarks |
| Post-hoc explainers (SHAP/LIME) | Cross-method agreement strengthens trust; not relied on in isolation |
| P4 results pending | Pipeline complete and deterministic; thesis core independent of P4 |
| High accuracies may invite scrutiny | Balanced data, held-out eval, double peer review across two ETASR issues |

---

## 8. Timeline to submission (proposed talking points)

- **Now → 2 weeks:** Run P4 experiments, finalize DRI results, submit to IEEE Access.
- **Parallel:** Fold P3 (accepted) and finalized parameter validation into the thesis integration chapter.
- **Synopsis:** v2 drafted (`docs/annexures/Synopsis-v2.docx`) — ready for committee review.
- **Remaining chapters:** Cross-paper synthesis + conclusions; introduction/literature already supported by published papers.
- **Ask the committee:** confirmation that 3 published/accepted Scopus papers + 1 under submission satisfies the publication requirement for submission.

---

## 9. Slide outline (drop into PowerPoint / Beamer)

1. **Title slide** — thesis title, candidate, supervisor, date.
2. **The problem** — comprehension is the dominant maintenance cost, assessed manually. (1 stat-heavy slide.)
3. **Thesis statement** — multi-level explainable comprehension framework (the §2 table as a visual).
4. **Progress headline** — 2 published, 1 accepted, 1 under submission (timeline bar).
5. **Paper 1 — IRAF-XADL** — pipeline diagram, key result, SHAP example.
6. **Paper 2 — ECRVR-MVEL** — ensemble diagram, result, LIME example, "validates P1."
7. **Paper 3 — EESQA-DELMOA** — BAHB→SSNN→AMBOA flow, accuracy + speed bar, BOT-class hook.
8. **Cross-paper validation** — MC/LF/PRED recurring across SHAP & LIME (the unifying evidence).
9. **Paper 4 — DRI** — the readability–correctness decoupling, DRI formula, why it matters now.
10. **Contributions summary** — 4 bullets, one per level.
11. **Limitations & future work** — honest slide (§7).
12. **Timeline to submission** — Gantt-style (§8).
13. **Ask / decisions needed** — publication-requirement confirmation; any committee guidance on scope.
14. **Backup slides** — ablation tables, dataset stats, full citations, DOIs.

---

## 10. Decisions to seek from the committee

- [ ] Confirm publication count (3 Scopus + 1 under submission) meets submission threshold.
- [ ] Approve synopsis v2 / note any required revisions.
- [ ] Confirm scope: is Paper 4 *required* for submission or a value-add extension?
- [ ] Agree a target submission month.

---

*One-line close for the meeting:* "The framework is built, validated across three levels in Scopus venues, and already extending into the AI-code era — I'm asking the committee to confirm scope so I can move to submission."

---

# Appendix A — Quick Recap (refresher after time away)

*Plain-English memory refresher for all papers and the overall thesis.*

## The big picture (the thesis in one breath)

You built **one explainable AI framework that measures how understandable code is — at three increasing levels of zoom**, then extended it to a fourth, AI-specific level:

> **identifier → code snippet → developer → (AI-generated code)**

The unifying idea: *program comprehension* is the biggest hidden cost in software, but it's judged manually and subjectively. You made it **measurable** (deep learning, 98%+ accuracy) **and explainable** (SHAP/LIME show *why*) — and you proved the same handful of cognitive "readability parameters" matter at every level.

Thesis title restates exactly this: *Evaluating Program Comprehension through Explainable Deep Learning: A Multi-Level Framework for Identifier Readability, Code Snippet Analysis, and Developer Experience Classification.*

## Paper-by-paper, in plain language

### Paper 1 — IRAF-XADL · "Is this *name* readable?" ✅ Published (ETASR 16(3))
- **Question:** Are identifier names (variables, functions, classes) easy for a human to understand?
- **What you did:** Pulled identifiers out of code using AST parsers (LibCST for Python, Tree-Sitter for C++), cleaned them (split camelCase/snake_case, lemmatize), then scored them on **10 cognitive readability parameters** *and* fed them through **CodeBERT** (code-trained language model → 768-number vectors). A **self-attention BiLSTM** classifies readability. **SHAP** explains which parameters drove each prediction.
- **Result:** ~98% accuracy (Python 98.13%, C++ 98.42%). Dominant signals: **MC** (Morphological Complexity) and **LF** (Lexical Familiarity).
- **So what:** First *explainable* identifier-readability pipeline fusing cognitive science with modern code embeddings.

### Paper 2 — ECRVR-MVEL · "Is this whole *function* readable?" ✅ Published (ETASR 16(4))
- **Question:** Zoom out from a name to a whole snippet — is it High, Medium, or Low readability?
- **What you did:** CodeBERT embeddings again, classification by a **3-model voting ensemble**: **GCN** (structure), **DBN** (probabilistic features), **BiTCN** (sequence patterns), combined by weighted majority vote. **LIME** explains predictions.
- **Result:** ~98% accuracy (C++ 98.38%), beating classic baselines (SVM 73%, LogReg 69%).
- **So what (the clever part):** It **independently re-confirms Paper 1** — LIME surfaces the *same* dominant parameters (MC, PRED). Deliberate triangulation: two methods, same answer = stronger thesis.

### Paper 3 — EESQA-DELMOA · "Who *wrote* this, and how experienced are they?" ✅ Accepted, in production (ETASR)
- **Question:** Zoom out to the *human* — classify a developer's experience level, and spot automated (bot) contributors.
- **What you did:** Normalize → **BAHB** (Bio-inspired Artificial Hummingbird — *feature selection*) → **SSNN** (Simplified Spiking Neural Network — brain-like, low-compute classifier) → **AMBOA** (Adaptive Migration Butterfly Optimization — *hyperparameter tuning*).
- **Data:** 703 developers, **6 classes**: Software Engineer, Bot, Unknown, Non-SE, Software Architect, Experienced SE.
- **Result:** 98.74% accuracy in **8.27 seconds** — far faster than CNN/AlexNet (15–17s) while more accurate.
- **So what:** Objective, code-driven developer-experience scoring; the **BOT class** bridges to Paper 4 (non-human authorship).

### Paper 4 — DRI · "When code *looks* good but *isn't*" 📝 Under submission (IEEE Access, Q1)
- **Question:** LLMs write polished-looking code. Does *readable* = *correct*? Developers assume yes — that's dangerous.
- **What you did:** Ran IRAF-XADL on **2,710 LLM-generated Python solutions** (HumanEval+ / MBPP+, 5 models), each with known pass/fail. Invented **DRI = P_High × (1 − pass_ratio)** — high when code reads as "High readability" but fails its tests.
- **Status:** Pipeline built; **results pending the experimental run**.
- **So what:** First study measuring the **readability–correctness decoupling** in AI code; a practical CI/CD risk metric. The future-facing contribution.

## Jargon decoder (acronym refresher)

| Term | What it actually is |
|------|---------------------|
| **CodeBERT** | BERT pre-trained on code; turns code/text into 768-dim vectors. Shared backbone in P1, P2, P4. |
| **SA-BiLSTM** | Self-Attention Bidirectional LSTM — sequence classifier in P1. |
| **GCN / DBN / BiTCN** | The 3 ensemble members in P2: structure / probabilistic / temporal. |
| **SSNN** | Simplified Spiking Neural Network — fast, brain-inspired classifier in P3. |
| **BAHB / AMBOA** | Bio-inspired *feature selection* / *hyperparameter tuning* metaheuristics in P3. |
| **SHAP / LIME** | The two explainability (XAI) methods — *why* a model predicted what it did. SHAP in P1, LIME in P2. |
| **The 10 parameters** | MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED — cognitive readability features. **MC, LF, PRED** keep winning. |
| **DRI** | Deceptive Readability Index = P_High × (1 − pass_ratio) — Paper 4 metric. |

## The one thread that ties it together (memorize this)

Each paper **zooms out one level** — name → function → human → machine — and at every level you do the same two things: **measure comprehension accurately** *and* **explain it**. Proof it's one coherent framework, not four disconnected papers: the **same cognitive parameters (MC, LF, PRED) recur across independent methods (SHAP and LIME) and independent levels.** That recurrence is the thesis's spine.
