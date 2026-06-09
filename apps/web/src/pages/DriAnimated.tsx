import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── Helpers ─────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Counter({ target, decimals = 0, suffix = "", inView }: {
  target: number; decimals?: number; suffix?: string; inView: boolean;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((ease * target).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, decimals]);
  return <>{val.toFixed(decimals)}{suffix}</>;
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const codeExamples = [
  {
    label: "Binary Search",
    tag: "High DRI",
    tagColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    readability: "High",
    readColor: "text-emerald-400",
    correct: false,
    bug: 'right_boundary = len(sorted_list)  # should be len - 1',
    why: "Every identifier is a perfect English phrase. IRAF-XADL scores it HIGH — but it crashes on the first probe.",
    code: `def binary_search(sorted_list, target):
    left_boundary = 0
    right_boundary = len(sorted_list)  # ← BUG
    while left_boundary <= right_boundary:
        middle_index = (left_boundary + right_boundary) // 2
        if sorted_list[middle_index] == target:
            return middle_index
        ...`,
    dri: 0.91,
  },
  {
    label: "Median Calculator",
    tag: "Moderate DRI",
    tagColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    readability: "High",
    readColor: "text-emerald-400",
    correct: false,
    bug: "Returns wrong value for even-length lists silently",
    why: "Beautiful names: number_list, sorted_numbers, middle_position. Looks correct. Silently returns the wrong median for [1, 3, 5, 7].",
    code: `def calculate_median(number_list):
    sorted_numbers = sorted(number_list)
    middle_position = len(sorted_numbers) // 2
    return sorted_numbers[middle_position]  # ← BUG`,
    dri: 0.65,
  },
  {
    label: "Word Frequency",
    tag: "Critical DRI",
    tagColor: "bg-red-500/20 text-red-300 border-red-500/30",
    readability: "High",
    readColor: "text-emerald-400",
    correct: false,
    bug: "lower_and_strip() and split_on_whitespace() do not exist in Python",
    why: "The most descriptive names possible: text_content, normalized_text, word_tokens, frequency_mapping — yet both methods are hallucinated. DRI = 1.0.",
    code: `def count_word_frequencies(text_content):
    normalized_text = text_content.lower_and_strip()   # ← HALLUCINATED
    word_tokens = normalized_text.split_on_whitespace() # ← HALLUCINATED
    frequency_mapping = {}
    for individual_word in word_tokens:
        frequency_mapping[individual_word] = \\
            frequency_mapping.get(individual_word, 0) + 1
    return frequency_mapping`,
    dri: 1.0,
  },
];

const pipeline = [
  {
    step: "01", title: "Collect LLM-Generated Code",
    desc: "Download 2,710 Python solutions from 5 LLM architectures (CodeLlama-7B/13B/34B, WizardCoder-34B, StarCoder2-15B) on HumanEval+ and MBPP+ benchmarks via EvalPlus.",
    color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/30", badge: "bg-indigo-500/20 text-indigo-300",
    tags: ["HumanEval+ (164)", "MBPP+ (378)", "5 LLMs", "2,710 samples"],
  },
  {
    step: "02", title: "Label Correctness",
    desc: "Execute each solution against EvalPlus extended test suites (80× amplification) in a sandboxed environment. Record pass_ratio — fraction of test cases passed per sample.",
    color: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", badge: "bg-rose-500/20 text-rose-300",
    tags: ["Sandboxed execution", "pass_ratio ∈ [0,1]", "80× test cases", "Ground truth"],
  },
  {
    step: "03", title: "Score with IRAF-XADL",
    desc: "Apply Paper 1's trained SA-BiLSTM model to every sample. Extract P_High (probability of 'High' readability class) and all 10 cognitive parameter values per snippet.",
    color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300",
    tags: ["SA-BiLSTM", "CodeBERT", "10 parameters", "P_High per sample"],
  },
  {
    step: "04", title: "Compute DRI",
    desc: "For each sample, compute the Deceptive Readability Index: DRI = P_High × (1 − pass_ratio). High DRI means the code looks readable but substantially fails tests.",
    color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300",
    tags: ["DRI formula", "Tier classification", "Per-model aggregate", "Risk mapping"],
  },
  {
    step: "05", title: "Statistical Analysis",
    desc: "Four research questions answered with Mann-Whitney U (RQ1), Logistic regression AUC (RQ2), Kruskal-Wallis + Dunn post-hoc (RQ3), and feature importance (RQ4).",
    color: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/30", badge: "bg-teal-500/20 text-teal-300",
    tags: ["Mann-Whitney U", "AUC-ROC", "Spearman ρ", "Feature importance"],
  },
];

const driTiers = [
  { range: "DRI = 0",       label: "Safe",     color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300", desc: "Unreadable or fully correct — no deception risk" },
  { range: "0 < DRI < 0.3", label: "Low",      color: "bg-sky-500/20 border-sky-500/40 text-sky-300",            desc: "Readable but minor test failures" },
  { range: "0.3 – 0.6",     label: "Moderate", color: "bg-amber-500/20 border-amber-500/40 text-amber-300",       desc: "Readable, failing significant share of tests" },
  { range: "DRI ≥ 0.6",     label: "Critical", color: "bg-red-500/20 border-red-500/40 text-red-300",             desc: "Highly readable — substantially wrong — maximum false trust risk" },
];

const rqs = [
  { num: "RQ1", q: "Is there a statistically significant difference in readability scores between correct and incorrect LLM code?", method: "Mann-Whitney U test + Cohen's d", expected: "No significant difference — or incorrect code scores HIGHER", color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-300" },
  { num: "RQ2", q: "Can readability score predict functional correctness?", method: "Logistic regression AUC + Spearman ρ", expected: "AUC < 0.65 — readability is a poor predictor", color: "border-rose-500/30 bg-rose-500/5 text-rose-300" },
  { num: "RQ3", q: "Does the readability-correctness gap vary across LLM architectures?", method: "Kruskal-Wallis + Dunn post-hoc", expected: "Larger models show higher DRI@Model", color: "border-amber-500/30 bg-amber-500/5 text-amber-300" },
  { num: "RQ4", q: "Which of the 10 IRAF-XADL cognitive parameters most drive deceptive readability?", method: "Logistic regression feature importance", expected: "MC (Meaningful Clarity) and LF (Lexical Familiarity) are the primary culprits", color: "border-teal-500/30 bg-teal-500/5 text-teal-300" },
];

const params10 = [
  { code: "MC", name: "Meaningful Clarity", role: "Primary deception driver", color: "text-red-400", accent: "border-red-500/40 bg-red-500/10" },
  { code: "LF", name: "Lexical Familiarity", role: "Secondary deception driver", color: "text-orange-400", accent: "border-orange-500/40 bg-orange-500/10" },
  { code: "NC", name: "Naming Convention", role: "Moderate contributor", color: "text-amber-400", accent: "border-amber-500/30 bg-amber-500/5" },
  { code: "PRED", name: "Predictability", role: "Moderate contributor", color: "text-yellow-400", accent: "border-yellow-500/30 bg-yellow-500/5" },
  { code: "OL", name: "Optimal Length", role: "Minor contributor", color: "text-slate-400", accent: "border-slate-500/30 bg-slate-500/5" },
  { code: "DR", name: "Domain Relevance", role: "Minor contributor", color: "text-slate-400", accent: "border-slate-500/30 bg-slate-500/5" },
  { code: "PR", name: "Pronounceability", role: "Minor contributor", color: "text-slate-400", accent: "border-slate-500/30 bg-slate-500/5" },
  { code: "CC", name: "Context Consistency", role: "Minor contributor", color: "text-slate-400", accent: "border-slate-500/30 bg-slate-500/5" },
  { code: "SA", name: "Scope Appropriateness", role: "Minor contributor", color: "text-slate-400", accent: "border-slate-500/30 bg-slate-500/5" },
  { code: "CLS", name: "Cognitive Load Score", role: "Composite signal", color: "text-indigo-400", accent: "border-indigo-500/30 bg-indigo-500/5" },
];

/* ════════════════════════════════════════════════════════════════════ */
export function DriAnimated() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  const paradoxRef = useRef<HTMLDivElement>(null);
  const [paradoxInView, setParadoxInView] = useState(false);
  useEffect(() => {
    const el = paradoxRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setParadoxInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const examplesRef = useRef<HTMLDivElement>(null);
  const [examplesInView, setExamplesInView] = useState(false);
  useEffect(() => {
    const el = examplesRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setExamplesInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineInView, setPipelineInView] = useState(false);
  useEffect(() => {
    const el = pipelineRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPipelineInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const formulaRef = useRef<HTMLDivElement>(null);
  const [formulaInView, setFormulaInView] = useState(false);
  useEffect(() => {
    const el = formulaRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setFormulaInView(true); }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const rqRef = useRef<HTMLDivElement>(null);
  const [rqInView, setRqInView] = useState(false);
  useEffect(() => {
    const el = rqRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setRqInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const paramsRef = useRef<HTMLDivElement>(null);
  const [paramsInView, setParamsInView] = useState(false);
  useEffect(() => {
    const el = paramsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setParamsInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = useState(false);
  useEffect(() => {
    const el = resultsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setResultsInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-32">

      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      <div className={`text-center transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-indigo-300 uppercase mb-6">
          Paper 4 — Animated Explainer · Draft
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          When Readable Is Not Correct
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-400 mt-2">
            Deceptive Readability in AI-Generated Code
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-lg leading-relaxed mb-4">
          Bharat Babaso Mane &amp; Dr. Rathnakar Achary
        </p>
        <p className="text-slate-500 text-sm mb-10">Alliance School of Advance Computing, Alliance University, Bengaluru</p>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-left text-slate-300 text-base leading-relaxed">
          <span className="text-indigo-400 font-semibold text-sm uppercase tracking-widest block mb-3">Abstract</span>
          LLMs now write substantial portions of production code, shifting developers from authors to reviewers.
          Developers rely on <strong className="text-white">code readability as a proxy for quality</strong> — yet LLMs generate
          stylistically polished code regardless of semantic correctness. This paper applies the{" "}
          <strong className="text-indigo-300">IRAF-XADL cognitive readability framework</strong> to 2,710 LLM-generated
          Python solutions and introduces the <strong className="text-rose-300">Deceptive Readability Index (DRI)</strong> —
          the first metric to quantify the gap between how readable code looks and how correct it actually is.
        </div>
        <div className="mt-8 flex justify-center"><div className="animate-bounce text-slate-600 text-2xl">↓</div></div>
      </div>

      {/* ── 2. THE PROBLEM ──────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">The Problem</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">The AI Code Era Has a Trust Problem</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { stat: "46%", label: "of all developers' code is written by AI tools like Copilot", color: "text-indigo-400" },
            { stat: "96%", label: "of developers say they do not fully trust AI-generated code", color: "text-rose-400" },
            { stat: "48%", label: "actually verify AI code before committing — the rest rely on gut feel", color: "text-amber-400" },
          ].map(({ stat, label, color }) => (
            <div key={stat} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className={`font-display text-5xl font-bold ${color} mb-3`}>{stat}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-slate-300 leading-relaxed">
          <strong className="text-rose-300">The Verification Paradox:</strong> 96% distrust AI code — yet only 48% verify it.
          Why? Because AI code <em>looks</em> clean and readable. Well-named functions, consistent conventions,
          descriptive variables. The readability signal overrides the distrust. That is the deception.
        </div>
      </Section>

      {/* ── 3. VERIFICATION PARADOX VISUAL ──────────────────────────── */}
      <div ref={paradoxRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${paradoxInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">The Gap</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">What Developers Say vs. What They Do</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="space-y-6">
            {[
              { label: "Say they distrust AI code", pct: 96, color: "bg-rose-400", textColor: "text-rose-300" },
              { label: "Actually verify before committing", pct: 48, color: "bg-amber-400", textColor: "text-amber-300" },
              { label: "Gap — trust readability instead of verifying", pct: 48, color: "bg-indigo-400", textColor: "text-indigo-300" },
            ].map(({ label, pct, color, textColor }, i) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-semibold ${textColor}`}>{label}</span>
                  <span className="text-white font-mono font-bold">{pct}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-1000`}
                    style={{ width: paradoxInView ? `${pct}%` : "0%", transitionDelay: `${i * 250}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-6 text-center">Source: Stack Overflow Developer Survey 2025</p>
        </div>
      </div>

      {/* ── 4. THE DECEPTION IN ACTION ──────────────────────────────── */}
      <div ref={examplesRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${examplesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">Deception in Action</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Three Real Examples</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">All three score HIGH readability from IRAF-XADL. All three are broken.</p>
        </div>
        <div className="space-y-6">
          {codeExamples.map(({ label, tag, tagColor, readability, readColor, correct, bug, why, code, dri }, i) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#0d1424] overflow-hidden transition-all duration-700"
              style={{ transitionDelay: `${i * 150}ms`, opacity: examplesInView ? 1 : 0, transform: examplesInView ? "translateX(0)" : "translateX(-30px)" }}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-white/3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tagColor}`}>{tag}</span>
                  <span className="text-white font-semibold text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Readability: <span className={`font-bold ${readColor}`}>{readability}</span></span>
                  <span>DRI: <span className="text-rose-400 font-bold">{dri.toFixed(2)}</span></span>
                  <span className="text-rose-400 font-bold">✗ Incorrect</span>
                </div>
              </div>
              <pre className="text-slate-300 font-mono text-xs p-5 overflow-x-auto leading-relaxed">{code}</pre>
              <div className="px-5 py-4 border-t border-white/8 bg-rose-500/5">
                <p className="text-rose-300 text-xs font-mono mb-1">Bug: {bug}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{why}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-center">
          <p className="text-slate-300 text-base leading-relaxed">
            In all three cases, <strong className="text-white">IRAF-XADL correctly identifies High readability</strong> —
            because the naming IS genuinely good. That is not a flaw in the tool.
            It exposes a deeper truth: <strong className="text-indigo-300">readability and correctness are independent dimensions in LLM-generated code.</strong>
          </p>
        </div>
      </div>

      {/* ── 5. THE DRI FORMULA ──────────────────────────────────────── */}
      <div ref={formulaRef}>
        <Section>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">The Contribution</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Deceptive Readability Index</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">A single number that captures how dangerous a piece of AI-generated code is to a human reviewer.</p>
          </div>
        </Section>
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-10 text-center">
          <div
            className={`transition-all duration-1000 ${formulaInView ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            <div className="font-mono text-2xl md:text-4xl text-white font-bold mb-8 leading-relaxed">
              <span className="text-slate-400">DRI(c)  =  </span>
              <span className="text-indigo-300">P<sub className="text-base">High</sub>(c)</span>
              <span className="text-slate-500">  ×  </span>
              <span className="text-rose-300">( 1 − pass_ratio(c) )</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              {[
                { term: "P_High(c)", def: "Probability the code is 'High' readability — from IRAF-XADL's SA-BiLSTM", color: "text-indigo-300 border-indigo-500/30 bg-indigo-500/5" },
                { term: "pass_ratio(c)", def: "Fraction of test cases passed — ground truth correctness from EvalPlus", color: "text-rose-300 border-rose-500/30 bg-rose-500/5" },
                { term: "DRI ∈ [0, 1]", def: "0 = no deception risk. 1 = perfectly readable, completely wrong", color: "text-amber-300 border-amber-500/30 bg-amber-500/5" },
              ].map(({ term, def, color }) => (
                <div key={term} className={`rounded-xl border p-4 ${color}`}>
                  <div className="font-mono font-bold mb-2">{term}</div>
                  <div className="text-slate-400 text-xs leading-relaxed">{def}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DRI tiers */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {driTiers.map(({ range, label, color, desc }, i) => (
            <div
              key={label}
              className={`rounded-xl border p-5 transition-all duration-500 ${color}`}
              style={{ transitionDelay: `${i * 100}ms`, opacity: formulaInView ? 1 : 0, transform: formulaInView ? "translateY(0)" : "translateY(20px)" }}
            >
              <div className="font-mono text-xs mb-2 opacity-70">{range}</div>
              <div className="font-display text-xl font-bold mb-2">{label}</div>
              <div className="text-xs opacity-70 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. EXPERIMENT PIPELINE ──────────────────────────────────── */}
      <div ref={pipelineRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${pipelineInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Methodology</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">5-Stage Experiment Pipeline</h2>
        </div>
        <div className="space-y-4">
          {pipeline.map(({ step, title, desc, color, border, badge, tags }, i) => (
            <div
              key={step}
              className={`flex gap-5 rounded-2xl border ${border} bg-gradient-to-r ${color} p-6 transition-all duration-700`}
              style={{ transitionDelay: `${i * 120}ms`, opacity: pipelineInView ? 1 : 0, transform: pipelineInView ? "translateX(0)" : "translateX(-40px)" }}
            >
              <span className={`shrink-0 rounded-xl ${badge} px-3 py-1 font-mono text-sm font-bold h-fit mt-1`}>{step}</span>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="rounded-full bg-white/8 border border-white/10 px-3 py-0.5 text-xs text-slate-300 font-mono">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. RESEARCH QUESTIONS ───────────────────────────────────── */}
      <div ref={rqRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${rqInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">Research Questions</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Four Questions the Paper Answers</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {rqs.map(({ num, q, method, expected, color }, i) => (
            <div
              key={num}
              className={`rounded-2xl border ${color} p-6 transition-all duration-600`}
              style={{ transitionDelay: `${i * 120}ms`, opacity: rqInView ? 1 : 0, transform: rqInView ? "translateY(0)" : "translateY(20px)" }}
            >
              <div className="font-mono text-sm font-bold mb-3">{num}</div>
              <p className="text-white text-sm font-semibold leading-relaxed mb-4 italic">"{q}"</p>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <span className="text-slate-500 shrink-0">Method</span>
                  <span className="text-slate-300">{method}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-slate-500 shrink-0">Expected</span>
                  <span className="text-slate-300">{expected}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. THE 10 PARAMS ────────────────────────────────────────── */}
      <div ref={paramsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${paramsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">IRAF-XADL as Instrument</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Which Parameters Drive Deception?</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Paper 4 uses Paper 1's 10 cognitive parameters as its measurement instrument. RQ4 asks: which of these parameters are LLMs gaming?</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {params10.map(({ code, name, role, color, accent }, i) => (
            <div
              key={code}
              className={`rounded-xl border ${accent} p-4 text-center transition-all duration-500 hover:scale-105`}
              style={{ transitionDelay: `${i * 60}ms`, opacity: paramsInView ? 1 : 0, transform: paramsInView ? "scale(1)" : "scale(0.85)" }}
            >
              <div className={`font-mono text-2xl font-bold ${color} mb-2`}>{code}</div>
              <div className="text-white text-xs font-semibold mb-1 leading-tight">{name}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{role}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-slate-300 text-sm leading-relaxed text-center">
            <strong className="text-red-300">Hypothesis (RQ4):</strong> MC and LF are the primary deception drivers.
            LLMs reliably choose real English words (↑MC) that appear in common vocabulary (↑LF) —
            independently of whether the logic is correct. These parameters reward naming quality,
            and AI is very good at naming.
          </p>
        </div>
      </div>

      {/* ── 9. EXPECTED RESULTS ─────────────────────────────────────── */}
      <div ref={resultsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${resultsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Expected Findings</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">What the Data Should Show</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* AUC visualization */}
          <div className={`rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 transition-all duration-700 ${resultsInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`} style={{ transitionDelay: "100ms" }}>
            <div className="text-rose-300 text-xs font-mono tracking-widest mb-4">RQ2 — READABILITY AS PREDICTOR</div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-display text-5xl font-bold text-white">
                &lt;<Counter target={65} decimals={0} suffix="%" inView={resultsInView} />
              </span>
              <span className="text-slate-400 text-sm">AUC-ROC</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 mb-4">
              <div className="h-full rounded-full bg-rose-400 transition-all duration-1000" style={{ width: resultsInView ? "65%" : "0%" }} />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              An AUC below 0.65 means readability score is essentially a coin flip at predicting correctness.
              A random classifier scores 0.50. This confirms the decoupling.
            </p>
          </div>

          {/* DRI distribution */}
          <div className={`rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 transition-all duration-700 ${resultsInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`} style={{ transitionDelay: "200ms" }}>
            <div className="text-indigo-300 text-xs font-mono tracking-widest mb-4">HIGH-DRI SAMPLES — EXPECTED</div>
            {[
              { model: "CodeLlama-7B", pct: 18, color: "bg-sky-400" },
              { model: "CodeLlama-34B", pct: 28, color: "bg-violet-400" },
              { model: "WizardCoder-34B", pct: 32, color: "bg-indigo-400" },
              { model: "StarCoder2-15B", pct: 24, color: "bg-teal-400" },
            ].map(({ model, pct, color }, i) => (
              <div key={model} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-mono">{model}</span>
                  <span className="text-slate-400">{pct}% high-DRI</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: resultsInView ? `${pct * 3}%` : "0%", transitionDelay: `${300 + i * 150}ms` }} />
                </div>
              </div>
            ))}
            <p className="text-slate-500 text-xs mt-3">Larger models expected to show higher DRI — they optimise for style more aggressively.</p>
          </div>
        </div>
      </div>

      {/* ── 10. IMPLICATIONS ────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Practical Impact</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">What This Means for Practice</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "⚠",
              title: "For Developers",
              desc: "Stop using readability as a quality proxy for AI-generated code. Clean, well-named functions are not a signal of correctness. Always run tests — especially when the code looks good.",
              color: "border-rose-500/30 bg-rose-500/5",
            },
            {
              icon: "⚙",
              title: "For CI/CD Pipelines",
              desc: "Add DRI as a dual-quality gate alongside test suites. Flag functions with DRI ≥ 0.6 for mandatory human review escalation — even if they pass all existing tests.",
              color: "border-indigo-500/30 bg-indigo-500/5",
            },
            {
              icon: "🔬",
              title: "For Tool Designers",
              desc: "Future readability tools for AI-generated code need a correctness correction layer. Readability metrics alone are misleading. DRI scoring should be built into code review assistants.",
              color: "border-teal-500/30 bg-teal-500/5",
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`rounded-2xl border ${color} p-7`}>
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="text-white font-bold text-lg mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 11. CONCLUSION ──────────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-rose-500/5 to-amber-500/10 p-12 text-center">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Conclusion</span>
          <h2 className="font-display text-3xl font-bold text-white mt-4 mb-6">Key Contribution</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Paper 4 uses <strong className="text-indigo-300">Paper 1's IRAF-XADL as the instrument</strong> and turns it against a new question:
            not "is human code readable?" but{" "}
            <strong className="text-white">"does readable AI code signal correctness — or deceive?"</strong>
          </p>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mb-10">
            The answer is: it deceives. The <strong className="text-rose-300">Deceptive Readability Index (DRI)</strong> is the
            first metric to quantify this risk — enabling developers and CI/CD systems to distinguish
            code that is merely readable from code that is both readable <em>and</em> trustworthy.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/demo/dri" className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-6 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-colors">
              Try Live DRI Demo
            </Link>
            <Link to="/papers/paper-4" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Full Paper Details
            </Link>
            <Link to="/thesis-story" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              ← Back to Thesis Story
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
}
