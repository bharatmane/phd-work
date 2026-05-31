import { useState } from "react";
import { PasswordGate } from "../components/common/PasswordGate";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Badge } from "../components/common/Badge";

const TITLE =
  "Explainable Deep Learning for Multi-Level Program Comprehension: " +
  "Identifier Readability, Code Snippet Analysis, and Developer Experience Classification";

const chapters = [
  {
    num: 1,
    title: "Introduction",
    color: "slate",
    sections: ["Background", "Significance of the Study", "Research Problem", "Objectives", "Scope of the Study", "Challenges and Limitations", "Potential Impact", "Research Contributions", "Structure of the Thesis", "Summary"],
    highlights: [
      "4 research problems, 4 RQs, 5 objectives",
      "3-level program comprehension hierarchy",
      "Explainability as a design requirement, not an afterthought",
    ],
  },
  {
    num: 2,
    title: "Literature Survey",
    color: "slate",
    sections: ["Program Comprehension Theory", "Code Readability Measurement", "Identifier Quality Assessment", "Machine Learning for Code Quality", "Transformer Models (CodeBERT)", "Ensemble Methods", "Recurrent Architectures", "Spiking Neural Networks", "Explainable AI (SHAP & LIME)", "Developer Experience Assessment", "Challenges in Existing Approaches", "Justification for Selected Models", "Research Gap Analysis"],
    highlights: [
      "17 thematic sections",
      "First justification-for-models section in this literature",
      "4 specific research gaps mapped to 4 thesis contributions",
    ],
  },
  {
    num: 3,
    title: "IRAF-XADL",
    subtitle: "Identifier Readability Analysis Framework",
    color: "cyan",
    sections: ["Problem Formulation", "Framework Architecture", "Identifier Extraction (LibCST / Tree-Sitter)", "10 Readability Parameters (MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED)", "CodeBERT Embeddings (768-dim)", "SA-BiLSTM Classifier (3 layers, 4 heads)", "AdamW Optimisation", "SHAP Explainability", "Results: Python & C++", "Comparative Analysis (7 baselines)", "Ablation Study (6 conditions)", "Qualitative Examples (5 identifiers)", "Error Analysis"],
    highlights: [
      "Python: 97.36% test accuracy (+15pp over best baseline)",
      "C++: 97.94% test accuracy (+17pp over best baseline)",
      "SHAP: MC and NC dominant features",
      "CodeBERT contributes 12.64pp (largest ablation drop)",
    ],
    metrics: [
      { label: "Python Acc.", val: "97.36%" },
      { label: "C++ Acc.", val: "97.94%" },
      { label: "Best Baseline", val: "82.00%" },
    ],
  },
  {
    num: 4,
    title: "ECRVR-MVEL",
    subtitle: "Ensemble Code Readability Classification",
    color: "violet",
    sections: ["Problem Formulation", "Framework Architecture", "Text Preprocessing (tokenisation, language detection)", "CodeBERT [CLS] Encoding (sliding window)", "Graph Convolutional Network (GCN)", "Deep Belief Network (DBN)", "Bidirectional Temporal Convolutional Network (Bi-TCN)", "Weighted Majority Voting Ensemble (WMVE)", "Nadam Optimisation", "LIME Explainability", "Results: Python & C++ (per-class breakdown)", "Comparative Analysis (7 baselines)", "Ablation Study (7 conditions)", "Ensemble Diversity Analysis", "LIME Stability Analysis", "Qualitative Examples"],
    highlights: [
      "Python: 98.15% test accuracy (+8pp over Neural Network)",
      "C++: 98.38% test accuracy (+4pp over Naïve Bayes)",
      "WMVE outperforms all 3 individual classifiers",
      "LIME stability: mean Spearman ρ = 0.84",
    ],
    metrics: [
      { label: "Python Acc.", val: "98.15%" },
      { label: "C++ Acc.", val: "98.38%" },
      { label: "Best Individual", val: "95.38% (Bi-TCN)" },
    ],
  },
  {
    num: 5,
    title: "EESQA-DELMOA",
    subtitle: "Developer Experience Classification",
    color: "rose",
    sections: ["Problem Formulation", "Framework Architecture", "Min-Max Normalisation", "BAHB Feature Selection (18/26 features)", "Simplified Spiking Neural Network (SSNN)", "AMBOA Hyperparameter Tuning", "Dataset (703 profiles, 6 classes)", "Results (per-class analysis)", "Comparative Analysis (7 baselines)", "Execution Time Analysis", "Ablation Study (5 conditions)", "Feature Importance Analysis (BAHB)", "Per-Class Deep Analysis", "Sensitivity Analysis (class imbalance)", "Discussion & Limitations"],
    highlights: [
      "Accuracy: 98.74% — highest of all 8 methods",
      "Execution time: 8.27s — lowest of all 8 methods",
      "SA class: 100% precision, recall, F1",
      "SSNN is 43% faster than equivalent ANN",
    ],
    metrics: [
      { label: "Accuracy", val: "98.74%" },
      { label: "Exec. Time", val: "8.27s" },
      { label: "Best Baseline", val: "94.78% (CNN)" },
    ],
  },
  {
    num: 6,
    title: "Cross-Study Analysis and Discussion",
    color: "amber",
    sections: ["Multi-Level Program Comprehension Framework", "The Causal Chain Across Levels", "Convergence of SHAP and LIME", "Performance Trajectory Interpretation", "Ensemble Diversity Principle Validated", "Efficiency as a Design Goal", "Practical Implications for Teams", "Comparison with Industrial Tools (SonarQube, Pylint)", "The Naturalness Hypothesis", "Threats to Validity (4 types)"],
    highlights: [
      "First cross-method, cross-level XAI validation in code readability",
      "SHAP (Study 1) + LIME (Study 2) both identify MC and NC",
      "Ensemble diversity quantified: GCN–DBN disagree on 11.2% of examples",
      "Comparison with SonarQube, Pylint, DeepSource",
    ],
  },
  {
    num: 7,
    title: "Conclusions and Future Work",
    color: "slate",
    sections: ["Summary of the Research", "Answers to 4 Research Questions", "5 Contributions Revisited", "3 Principal Limitations", "8 Future Research Directions", "Impact Statement", "Closing Remarks"],
    highlights: [
      "RQ1–RQ4 answered with supporting evidence",
      "8 future directions including IDE plugin, human study, multi-language",
      "Practical impact: CI/CD integration, developer education, AI code quality benchmarking",
    ],
  },
];

const colorMap: Record<string, { badge: string; border: string; num: string }> = {
  slate:  { badge: "border-slate-300/25 bg-slate-300/10 text-slate-200",   border: "border-white/10",          num: "text-slate-400" },
  cyan:   { badge: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",       border: "border-cyan-300/20",        num: "text-cyan-300"  },
  violet: { badge: "border-violet-300/25 bg-violet-300/10 text-violet-100", border: "border-violet-300/20",      num: "text-violet-300"},
  rose:   { badge: "border-rose-300/25 bg-rose-300/10 text-rose-100",       border: "border-rose-300/20",        num: "text-rose-300"  },
  amber:  { badge: "border-amber-300/25 bg-amber-300/10 text-amber-100",    border: "border-amber-300/20",       num: "text-amber-300" },
};

function ChapterCard({ ch, open, onToggle }: {
  ch: typeof chapters[number];
  open: boolean;
  onToggle: () => void;
}) {
  const c = colorMap[ch.color];
  return (
    <GlassCard className={`border ${c.border} transition-all`}>
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-4 text-left"
      >
        <span className={`font-mono text-4xl font-bold ${c.num} shrink-0 leading-none`}>
          {String(ch.num).padStart(2, "0")}
        </span>
        <div className="flex-1">
          <span className={`inline-flex rounded-full border px-3 py-0.5 text-xs uppercase tracking-widest ${c.badge}`}>
            Chapter {ch.num}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-white">{ch.title}</h3>
          {"subtitle" in ch && ch.subtitle && (
            <p className="text-xs text-slate-400">{ch.subtitle}</p>
          )}
        </div>
        <span className="text-slate-500 mt-1">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
          {/* Highlights */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Key highlights</p>
            <ul className="space-y-1.5">
              {ch.highlights.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className={`shrink-0 ${c.num}`}>✓</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* Metrics */}
          {"metrics" in ch && ch.metrics && (
            <div className="grid grid-cols-3 gap-3">
              {ch.metrics.map((m) => (
                <div key={m.label} className="rounded-xl bg-white/5 p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">{m.label}</p>
                  <p className="mt-1 text-xl font-bold text-white">{m.val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sections */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Sections covered</p>
            <div className="flex flex-wrap gap-2">
              {ch.sections.map((s, i) => (
                <span key={i} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-slate-400">
                  {i + 1}. {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function ThesisContent() {
  const [openChapter, setOpenChapter] = useState<number | null>(3);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 space-y-16">

      {/* Header */}
      <div>
        <Badge>PhD Thesis</Badge>
        <h1 className="mt-4 font-display text-3xl text-white md:text-4xl leading-snug">{TITLE}</h1>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          {[
            { k: "Scholar",    v: "Bharat Babaso Mane" },
            { k: "Supervisor", v: "Dr. Rathnakar Achary" },
            { k: "University", v: "Alliance University, Bengaluru" },
            { k: "Year",       v: "2026" },
          ].map((item) => (
            <div key={item.k}>
              <span className="text-slate-500 text-xs uppercase tracking-widest">{item.k}</span>
              <p className="mt-1 text-slate-200 text-sm">{item.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* At-a-glance metrics */}
      <section>
        <SectionHeader eyebrow="Overview" title="At a glance" description="Key results across all three studies." />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "IRAF-XADL Python",  val: "97.36%", color: "text-cyan-300" },
            { label: "IRAF-XADL C++",     val: "97.94%", color: "text-cyan-300" },
            { label: "ECRVR-MVEL Python", val: "98.15%", color: "text-violet-300" },
            { label: "ECRVR-MVEL C++",    val: "98.38%", color: "text-violet-300" },
            { label: "EESQA Accuracy",    val: "98.74%", color: "text-rose-300" },
            { label: "EESQA Speed",       val: "8.27s",  color: "text-rose-300" },
          ].map((m) => (
            <GlassCard key={m.label} className="text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.val}</p>
              <p className="mt-1 text-[10px] text-slate-500 uppercase leading-4">{m.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 5 Contributions */}
      <section>
        <SectionHeader eyebrow="Contributions" title="Five original contributions" description="" />
        <div className="mt-6 space-y-3">
          {[
            { n: "C1", title: "Ten-dimensional identifier readability parameter set", detail: "MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED" },
            { n: "C2", title: "IRAF-XADL framework", detail: "CodeBERT + SA-BiLSTM + SHAP — 97%+ accuracy" },
            { n: "C3", title: "ECRVR-MVEL ensemble", detail: "GCN + DBN + Bi-TCN + LIME — 98%+ accuracy" },
            { n: "C4", title: "EESQA-DELMOA system", detail: "SSNN + BAHB + AMBOA — 98.74%, 8.27s" },
            { n: "C5", title: "Multi-level, explainability-first framework", detail: "First cross-method XAI validation: SHAP + LIME both identify MC & NC" },
          ].map((c) => (
            <div key={c.n} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="font-mono text-sm text-cyan-400 shrink-0 w-6">{c.n}</span>
              <div>
                <p className="text-sm font-medium text-white">{c.title}</p>
                <p className="text-xs text-slate-400">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chapters */}
      <section>
        <SectionHeader
          eyebrow="Chapters"
          title="Chapter-by-chapter breakdown"
          description="Click any chapter to expand its contents and key findings."
        />
        <div className="mt-6 space-y-4">
          {chapters.map((ch) => (
            <ChapterCard
              key={ch.num}
              ch={ch}
              open={openChapter === ch.num}
              onToggle={() => setOpenChapter(openChapter === ch.num ? null : ch.num)}
            />
          ))}
        </div>
      </section>

      {/* Back matter */}
      <section>
        <SectionHeader eyebrow="Back matter" title="References and appendices" description="" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <GlassCard>
            <h4 className="font-semibold text-white">References</h4>
            <p className="mt-2 text-sm text-slate-400">~55 entries in Chicago format covering CodeBERT, SHAP, LIME, program comprehension theory, ensemble methods, spiking neural networks, and developer experience research.</p>
          </GlassCard>
          <GlassCard>
            <h4 className="font-semibold text-white">Appendices</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-400">
              <li>A — Dataset details (Kaggle + Zenodo)</li>
              <li>B — Hyperparameter tables (all three models)</li>
              <li>C — Evaluation metric formulas</li>
              <li>D — Reproducibility information</li>
            </ul>
          </GlassCard>
          <GlassCard>
            <h4 className="font-semibold text-white">Publications</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-400">
              <li><span className="text-emerald-400">P1 — Accepted</span> · IRAF-XADL identifier readability</li>
              <li><span className="text-emerald-400">P2 — Accepted</span> · ECRVR-MVEL ensemble readability</li>
              <li><span className="text-amber-400">P3 — Under Review</span> · EESQA-DELMOA developer quality</li>
            </ul>
          </GlassCard>
          <GlassCard>
            <h4 className="font-semibold text-white">Word count</h4>
            <p className="mt-2 text-sm text-slate-400">Target: ~64,000 words across 7 chapters. Structured to Alliance University PhD template (Annexure 18) with Times New Roman 12pt, 1.5 line spacing, Chicago referencing.</p>
          </GlassCard>
        </div>
      </section>

    </div>
  );
}

export function ThesisPage() {
  return (
    <PasswordGate storageKey="thesis_auth">
      <ThesisContent />
    </PasswordGate>
  );
}
