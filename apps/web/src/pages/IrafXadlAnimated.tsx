import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── Scroll-trigger hook ─────────────────────────────────────────── */
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

/* ── Animated counter ────────────────────────────────────────────── */
function Counter({ target, decimals = 2, inView }: { target: number; decimals?: number; inView: boolean }) {
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
  return <>{val.toFixed(decimals)}</>;
}

/* ── Section wrapper with fade-up animation ──────────────────────── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const pipeline = [
  { step: "01", title: "AST Extraction", desc: "LibCST parses Python; Tree-Sitter parses C++. Variables, functions, classes, and parameters are extracted as typed identifier records.", color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", badge: "bg-cyan-500/20 text-cyan-300" },
  { step: "02", title: "Lexical Normalization", desc: "camelCase / snake_case splitting, lemmatization, stopword removal, and semantic cleanup produce clean token sequences.", color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300" },
  { step: "03", title: "10 Readability Parameters", desc: "Ten linguistically and cognitively grounded parameters are computed: MC, NC, OL, DR, PR, LF, CC, SA, CLS, and PRED.", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300" },
  { step: "04", title: "CodeBERT Embeddings", desc: "A pre-trained CodeBERT model generates 768-dimensional contextual vectors capturing programming-specific semantics.", color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300" },
  { step: "05", title: "SA-BiLSTM Classification", desc: "A self-attention BiLSTM (3 layers, 128 hidden units, 4-head attention) learns bidirectional sequential dependencies.", color: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", badge: "bg-rose-500/20 text-rose-300" },
  { step: "06", title: "AdamW Optimization", desc: "Decoupled weight decay separates regularization from gradient updates, ensuring stable convergence and generalization.", color: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/30", badge: "bg-sky-500/20 text-sky-300" },
  { step: "07", title: "SHAP Explainability", desc: "SHAP values trace each identifier token and feature's contribution toward the final readability prediction.", color: "from-pink-500/20 to-pink-500/5", border: "border-pink-500/30", badge: "bg-pink-500/20 text-pink-300" },
];

const parameters = [
  { code: "MC", name: "Morphological Complexity", desc: "Measures structural complexity via character n-gram perplexity" },
  { code: "NC", name: "Naming Convention", desc: "Adherence to language-standard naming conventions" },
  { code: "OL", name: "Optimal Length", desc: "Whether identifier length falls within the cognitive sweet spot" },
  { code: "DR", name: "Domain Relevance", desc: "Cosine similarity of tokens to domain-specific vocabulary embeddings" },
  { code: "PR", name: "Pronounceability", desc: "Vowel-to-consonant ratio as a proxy for ease of phonetic decoding" },
  { code: "LF", name: "Lexical Familiarity", desc: "Log-frequency of tokens in a large natural language corpus" },
  { code: "CC", name: "Context Consistency", desc: "Semantic alignment with neighboring identifiers via embedding similarity" },
  { code: "SA", name: "Scope Appropriateness", desc: "Length-to-scope-size ratio measuring contextual verbosity" },
  { code: "CLS", name: "Cognitive Load Score", desc: "Composite of familiarity, clarity, and ambiguity factors" },
  { code: "PRED", name: "Predictability", desc: "Probability of the identifier given its surrounding code context" },
];

const shapBars = [
  { feature: "MC — Morphological Complexity", pct: 87, color: "bg-cyan-400" },
  { feature: "LF — Lexical Familiarity", pct: 76, color: "bg-violet-400" },
  { feature: "PRED — Predictability", pct: 68, color: "bg-emerald-400" },
  { feature: "NC — Naming Convention", pct: 61, color: "bg-amber-400" },
  { feature: "DR — Domain Relevance", pct: 54, color: "bg-rose-400" },
  { feature: "OL — Optimal Length", pct: 46, color: "bg-sky-400" },
  { feature: "CLS — Cognitive Load", pct: 40, color: "bg-pink-400" },
  { feature: "PR — Pronounceability", pct: 36, color: "bg-indigo-400" },
  { feature: "CC — Context Consistency", pct: 33, color: "bg-teal-400" },
  { feature: "SA — Scope Appropriateness", pct: 28, color: "bg-orange-400" },
];

const tokens = ["calculate", "Total", "Amount", "For", "User"];
const tokenColors = ["text-cyan-300", "text-violet-300", "text-emerald-300", "text-amber-300", "text-rose-300"];

/* ════════════════════════════════════════════════════════════════════ */
export function IrafXadlAnimated() {
  /* hero state */
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  /* pipeline step-by-step reveal */
  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineInView, setPipelineInView] = useState(false);
  useEffect(() => {
    const el = pipelineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPipelineInView(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* parameters reveal */
  const paramsRef = useRef<HTMLDivElement>(null);
  const [paramsInView, setParamsInView] = useState(false);
  useEffect(() => {
    const el = paramsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setParamsInView(true); }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* CodeBERT token animation */
  const bertRef = useRef<HTMLDivElement>(null);
  const [bertInView, setBertInView] = useState(false);
  useEffect(() => {
    const el = bertRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBertInView(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* SHAP bars */
  const shapRef = useRef<HTMLDivElement>(null);
  const [shapInView, setShapInView] = useState(false);
  useEffect(() => {
    const el = shapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShapInView(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* results metrics */
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = useState(false);
  useEffect(() => {
    const el = resultsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setResultsInView(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-32">

      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <div className={`text-center transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <span className="inline-block rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-cyan-300 uppercase mb-6">
          Animated Paper Explainer
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          IRAF-XADL
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 mt-2">
            Identifier Readability via Explainable Deep Learning
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-lg leading-relaxed mb-4">
          Bharat Babaso Mane &amp; Dr. Rathnakar Achary
        </p>
        <p className="mx-auto max-w-2xl text-slate-500 text-sm mb-10">
          Alliance School of Advance Computing, Alliance University, Bengaluru
        </p>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-left text-slate-300 text-base leading-relaxed">
          <span className="text-cyan-400 font-semibold text-sm uppercase tracking-widest block mb-3">Abstract</span>
          Identifier names are natural language representations of program concepts and play a central role in program understanding.
          This paper proposes <strong className="text-white">IRAF-XADL</strong> — a framework that combines syntax-aware AST extraction,
          ten cognitive readability parameters, <strong className="text-cyan-300">CodeBERT embeddings</strong>, and a{" "}
          <strong className="text-violet-300">self-attention BiLSTM classifier</strong> to predict identifier readability with{" "}
          <strong className="text-emerald-300">SHAP-based interpretable explanations</strong>.
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-bounce text-slate-600 text-2xl">↓</div>
        </div>
      </div>

      {/* ── 2. THE PROBLEM ─────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">The Problem</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Why does identifier readability matter?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { stat: "70%", label: "of software lifecycle cost is in maintenance", color: "text-rose-400" },
            { stat: "40%", label: "of developer time is spent reading — not writing — code", color: "text-amber-400" },
            { stat: "~0", label: "interpretable ML frameworks existed for identifier-level readability", color: "text-cyan-400" },
          ].map(({ stat, label, color }) => (
            <div key={stat} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className={`font-display text-5xl font-bold ${color} mb-3`}>{stat}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-slate-300 text-base leading-relaxed">
          <strong className="text-rose-300">Research Gap:</strong> Prior approaches either isolate handcrafted metrics from
          modern contextual code representations, or use black-box deep learning with no interpretability — leaving identifier
          quality poorly understood and manually assessed.
        </div>
      </Section>

      {/* ── 3. PIPELINE ────────────────────────────────────────────── */}
      <div ref={pipelineRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${pipelineInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">The Framework</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">7-Stage IRAF-XADL Pipeline</h2>
        </div>
        <div className="space-y-4">
          {pipeline.map(({ step, title, desc, color, border, badge }, i) => (
            <div
              key={step}
              className={`flex gap-5 rounded-2xl border ${border} bg-gradient-to-r ${color} p-6 transition-all duration-700`}
              style={{
                transitionDelay: `${i * 120}ms`,
                opacity: pipelineInView ? 1 : 0,
                transform: pipelineInView ? "translateX(0)" : "translateX(-40px)",
              }}
            >
              <span className={`shrink-0 rounded-xl ${badge} px-3 py-1 font-mono text-sm font-bold h-fit mt-1`}>{step}</span>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. 10 PARAMETERS ───────────────────────────────────────── */}
      <div ref={paramsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${paramsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Stage 3</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">10 Readability Parameters</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Linguistically and cognitively grounded — covering semantics, structure, cognition, and context.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {parameters.map(({ code, name, desc }, i) => (
            <div
              key={code}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all duration-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 group"
              style={{
                transitionDelay: `${i * 60}ms`,
                opacity: paramsInView ? 1 : 0,
                transform: paramsInView ? "scale(1)" : "scale(0.85)",
              }}
            >
              <div className="font-mono text-2xl font-bold text-emerald-400 mb-2 group-hover:scale-110 transition-transform">{code}</div>
              <div className="text-white text-xs font-semibold mb-2 leading-tight">{name}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. CODEBERT ────────────────────────────────────────────── */}
      <div ref={bertRef}>
        <Section>
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Stage 4</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">CodeBERT Embeddings</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Pre-trained on millions of code-natural language pairs, CodeBERT produces 768-dimensional vectors that capture programming-specific semantics beyond surface-level tokens.</p>
          </div>
        </Section>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 overflow-x-auto">
          <div className="flex flex-col items-center gap-8 min-w-[520px]">
            {/* Input tokens */}
            <div className="flex gap-3 flex-wrap justify-center">
              {tokens.map((tok, i) => (
                <div
                  key={tok}
                  className={`rounded-lg border border-white/15 bg-white/8 px-4 py-2 font-mono text-sm font-semibold ${tokenColors[i]} transition-all duration-500`}
                  style={{ transitionDelay: `${i * 120}ms`, opacity: bertInView ? 1 : 0, transform: bertInView ? "translateY(0)" : "translateY(-20px)" }}
                >
                  {tok}
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div className={`transition-all duration-700 delay-700 ${bertInView ? "opacity-100" : "opacity-0"}`}>
              <div className="flex flex-col items-center gap-1">
                <div className="text-slate-500 text-xs font-mono tracking-widest">CodeBERT (12 transformer layers)</div>
                <div className="h-8 w-px bg-gradient-to-b from-amber-400 to-violet-400" />
                <div className="text-amber-400 text-lg">↓</div>
              </div>
            </div>
            {/* Embedding vector */}
            <div
              className={`transition-all duration-700 delay-1000 ${bertInView ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 text-center">
                <div className="text-violet-300 text-xs font-mono mb-3 tracking-widest">768-DIMENSIONAL EMBEDDING VECTOR</div>
                <div className="flex gap-1 flex-wrap justify-center max-w-xs mx-auto">
                  {Array.from({ length: 32 }, (_, i) => (
                    <div
                      key={i}
                      className="h-6 rounded"
                      style={{
                        width: `${Math.max(8, Math.min(24, Math.abs(Math.sin(i * 1.3) * 20)))}px`,
                        backgroundColor: `hsla(${200 + i * 5}, 70%, 65%, ${0.4 + Math.abs(Math.sin(i)) * 0.5})`,
                        transition: `all 0.4s ease ${i * 30}ms`,
                        opacity: bertInView ? 1 : 0,
                      }}
                    />
                  ))}
                  <div className="text-slate-500 text-xs font-mono self-center ml-1">…768</div>
                </div>
                <div className="mt-3 text-slate-400 text-xs">Captures syntax, semantics, and contextual intent of each identifier</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. SA-BiLSTM ───────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">Stage 5</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Self-Attention BiLSTM</h2>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8">
          <div className="flex flex-col gap-4 items-center">
            {/* Input */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 font-mono">
              CodeBERT embeddings + 10 readability parameters
            </div>
            <div className="text-slate-600">↓</div>
            {/* BiLSTM block */}
            <div className="w-full max-w-lg rounded-xl border border-rose-500/30 bg-rose-500/10 p-5">
              <div className="text-rose-300 text-xs font-mono tracking-widest text-center mb-4">BiLSTM — 3 LAYERS · 128 HIDDEN UNITS · DROPOUT 0.3</div>
              <div className="flex justify-between items-center gap-2">
                <div className="flex-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-center">
                  <div className="text-cyan-300 text-xs font-semibold">Forward LSTM</div>
                  <div className="text-slate-500 text-xs mt-1">h₁ → h₂ → h₃ →</div>
                </div>
                <div className="text-slate-600 text-xs">⊕</div>
                <div className="flex-1 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3 text-center">
                  <div className="text-violet-300 text-xs font-semibold">Backward LSTM</div>
                  <div className="text-slate-500 text-xs mt-1">← h₃ ← h₂ ← h₁</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600">↓</div>
            {/* Self-attention */}
            <div className="w-full max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <div className="text-amber-300 text-xs font-mono tracking-widest mb-2">SELF-ATTENTION — 4 HEADS · DIM 128</div>
              <div className="text-slate-400 text-xs">Weighs each token's importance; focuses on the most readability-relevant features</div>
            </div>
            <div className="text-slate-600">↓</div>
            {/* Output */}
            <div className="flex gap-4">
              {["Readable", "Unreadable"].map((label, i) => (
                <div key={label} className={`rounded-xl border px-6 py-3 text-sm font-semibold text-center ${i === 0 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-rose-500/40 bg-rose-500/10 text-rose-300"}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. SHAP ────────────────────────────────────────────────── */}
      <div ref={shapRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${shapInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-pink-400 uppercase">Stage 7</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">SHAP Explainability</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">SHAP values reveal which readability parameters drive each prediction, making the model transparent and auditable.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
          <div className="text-xs text-slate-500 font-mono tracking-widest mb-6">FEATURE IMPORTANCE (relative SHAP contribution)</div>
          {shapBars.map(({ feature, pct, color }, i) => (
            <div
              key={feature}
              className="transition-all duration-500"
              style={{ transitionDelay: `${i * 80}ms`, opacity: shapInView ? 1 : 0 }}
            >
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-mono">{feature}</span>
                <span className="text-slate-500">{pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-1000`}
                  style={{ width: shapInView ? `${pct}%` : "0%", transitionDelay: `${i * 80 + 200}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. RESULTS ─────────────────────────────────────────────── */}
      <div ref={resultsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${resultsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Experimental Results</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">State-of-the-Art Performance</h2>
          <p className="text-slate-400 mt-3">Code Snippets: Insights and Readability Dataset — Python &amp; C++</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Python */}
          <div className={`rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8 transition-all duration-700 ${resultsInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`} style={{ transitionDelay: "100ms" }}>
            <div className="text-cyan-300 text-xs font-mono tracking-widest mb-6">PYTHON DATASET</div>
            {[
              { label: "Accuracy", value: 98.13 },
              { label: "Precision", value: 97.22 },
              { label: "Recall", value: 97.20 },
              { label: "F1-Score", value: 97.21 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-baseline border-b border-white/5 py-3 last:border-0">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="font-display text-2xl font-bold text-white">
                  <Counter target={value} decimals={2} inView={resultsInView} />
                  <span className="text-cyan-400 text-sm ml-1">%</span>
                </span>
              </div>
            ))}
          </div>
          {/* C++ */}
          <div className={`rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8 transition-all duration-700 ${resultsInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`} style={{ transitionDelay: "200ms" }}>
            <div className="text-violet-300 text-xs font-mono tracking-widest mb-6">C++ DATASET</div>
            {[
              { label: "Accuracy", value: 98.42 },
              { label: "Precision", value: 97.62 },
              { label: "Recall", value: 97.61 },
              { label: "F1-Score", value: 97.61 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-baseline border-b border-white/5 py-3 last:border-0">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="font-display text-2xl font-bold text-white">
                  <Counter target={value} decimals={2} inView={resultsInView} />
                  <span className="text-violet-400 text-sm ml-1">%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. CONCLUSION ──────────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-rose-500/10 p-10 text-center">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Conclusion</span>
          <h2 className="font-display text-3xl font-bold text-white mt-4 mb-6">Key Contribution</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            IRAF-XADL positions identifier readability as an <strong className="text-cyan-300">explainable machine learning problem</strong> —
            combining ten cognitive readability parameters with CodeBERT embeddings and self-attention BiLSTM to produce
            both <strong className="text-violet-300">high accuracy</strong> and <strong className="text-emerald-300">interpretable explanations</strong>,
            outperforming all existing baselines on Python and C++ datasets.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/papers/iraf-xadl" className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-6 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors">
              ← Full Paper Detail
            </Link>
            <Link to="/methodology/iraf-xadl" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Methodology Deep Dive
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
}
