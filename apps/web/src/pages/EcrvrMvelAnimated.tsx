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

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const pipeline = [
  {
    step: "01", title: "Text Preprocessing",
    desc: "Four-stage pipeline: tokenization of keywords/identifiers/operators, comment removal, whitespace normalization, and automatic language detection for Python & C++.",
    color: "from-cyan-500/20 to-cyan-500/5", border: "border-cyan-500/30", badge: "bg-cyan-500/20 text-cyan-300",
    tags: ["Tokenization", "Comment Removal", "Whitespace Norm.", "Language Detection"],
  },
  {
    step: "02", title: "CodeBERT Embeddings",
    desc: "Multi-layer Transformer with positional encoding and multi-head self-attention converts raw code into rich vector representations, capturing long-range dependencies and semantic structure.",
    color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300",
    tags: ["Positional Encoding", "Multi-head Attention", "Contextual Vectors"],
  },
  {
    step: "03", title: "Weighted Majority Voting Ensemble",
    desc: "Three deep learning models — GCN, DBN, and BiTCN — classify readability independently. Weights are assigned based on each model's prior validation accuracy, and a weighted vote decides the final class.",
    color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300",
    tags: ["GCN", "DBN", "BiTCN", "Weighted Vote"],
  },
  {
    step: "04", title: "Nadam Optimization",
    desc: "Nesterov-accelerated Adaptive Moment Estimation combines NAG's lookahead with Adam's adaptive rates, improving convergence speed and handling non-convex loss landscapes efficiently.",
    color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300",
    tags: ["Nesterov Momentum", "Adaptive Learning Rate", "Bias Correction"],
  },
  {
    step: "05", title: "LIME Explainability",
    desc: "Local Interpretable Model-agnostic Explanations perturb each code sample and fit a local linear model to reveal which features drive each readability prediction — High, Medium, or Low.",
    color: "from-rose-500/20 to-rose-500/5", border: "border-rose-500/30", badge: "bg-rose-500/20 text-rose-300",
    tags: ["Local Explanations", "Feature Perturbation", "Class-level Insights"],
  },
];

const ensembleModels = [
  {
    name: "GCN", full: "Graph Convolutional Network",
    role: "Learns structural relationships between code tokens by treating the source code as a graph, propagating information across neighboring nodes up to 3 hops.",
    strength: "Captures relational and structural patterns",
    pythonAcc: 92.87, cppAcc: 92.77,
    color: "border-cyan-500/30 bg-cyan-500/5", badge: "bg-cyan-500/15 text-cyan-300", bar: "bg-cyan-400",
    icon: "⬡",
  },
  {
    name: "DBN", full: "Deep Belief Network",
    role: "Stacked Restricted Boltzmann Machines learn hierarchical feature representations through unsupervised pre-training, extracting probabilistic code patterns.",
    strength: "Unsupervised hierarchical feature learning",
    pythonAcc: 94.46, cppAcc: 93.07,
    color: "border-violet-500/30 bg-violet-500/5", badge: "bg-violet-500/15 text-violet-300", bar: "bg-violet-400",
    icon: "◈",
  },
  {
    name: "BiTCN", full: "Bidirectional Temporal Conv. Network",
    role: "Dilated convolutions scan code sequences in both forward and backward directions, capturing both syntactic dependencies and future-context signals simultaneously.",
    strength: "Bidirectional temporal sequence modeling",
    pythonAcc: 95.38, cppAcc: 93.81,
    color: "border-emerald-500/30 bg-emerald-500/5", badge: "bg-emerald-500/15 text-emerald-300", bar: "bg-emerald-400",
    icon: "⇌",
  },
];

const limeFeaturesPython = [
  { feature: "readability > 4.88", pct: 82, impact: "positive", cls: "High" },
  { feature: "MC > 0.24", pct: 71, impact: "positive", cls: "High" },
  { feature: "PRED (predictability)", pct: 65, impact: "positive", cls: "Medium" },
  { feature: "CLS (cognitive load)", pct: 52, impact: "negative", cls: "Medium" },
  { feature: "NC (naming convention)", pct: 44, impact: "positive", cls: "Low" },
];

const limeFeaturesC = [
  { feature: "PRED (predictability)", pct: 88, impact: "positive", cls: "Low" },
  { feature: "readability score", pct: 79, impact: "positive", cls: "High" },
  { feature: "NC (naming convention)", pct: 54, impact: "positive", cls: "Low" },
  { feature: "CLS (cognitive load)", pct: 47, impact: "negative", cls: "Medium" },
  { feature: "SA (scope appropriateness)", pct: 38, impact: "negative", cls: "High" },
];

const comparativePython = [
  { name: "Decision Tree", acc: 60.40 },
  { name: "Logistic Regression", acc: 65.10 },
  { name: "Random Forest", acc: 69.20 },
  { name: "Bayesian Network", acc: 87.02 },
  { name: "Naïve Bayes", acc: 88.58 },
  { name: "SVM", acc: 89.62 },
  { name: "Neural Network", acc: 90.11 },
  { name: "ECRVR-MVEL", acc: 98.15, highlight: true },
];

const codeSnippets = [
  { lang: "Python", score: 5.35, level: "High", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300", code: "def isPalindrome(self, x):\n  y = list(str(x))\n  return y == list(reversed(y))" },
  { lang: "Python", score: 4.25, level: "Medium", color: "border-amber-500/30 bg-amber-500/5 text-amber-300", code: "def singleNumber(self, nums):\n  return (sum(set(nums))*3\n    - sum(nums)) // 2" },
  { lang: "Python", score: 2.31, level: "Low", color: "border-rose-500/30 bg-rose-500/5 text-rose-300", code: "def majorityElement(self, nums):\n  return [v for v in set(nums)\n    if nums.count(v) > floor(len(nums)/3)]" },
];

/* ════════════════════════════════════════════════════════════════════ */
export function EcrvrMvelAnimated() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  /* pipeline */
  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineInView, setPipelineInView] = useState(false);
  useEffect(() => {
    const el = pipelineRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPipelineInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* ensemble */
  const ensRef = useRef<HTMLDivElement>(null);
  const [ensInView, setEnsInView] = useState(false);
  useEffect(() => {
    const el = ensRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEnsInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* voting */
  const voteRef = useRef<HTMLDivElement>(null);
  const [voteInView, setVoteInView] = useState(false);
  useEffect(() => {
    const el = voteRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVoteInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* lime */
  const limeRef = useRef<HTMLDivElement>(null);
  const [limeInView, setLimeInView] = useState(false);
  useEffect(() => {
    const el = limeRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setLimeInView(true); }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* results */
  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = useState(false);
  useEffect(() => {
    const el = resultsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setResultsInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  /* comparative */
  const compRef = useRef<HTMLDivElement>(null);
  const [compInView, setCompInView] = useState(false);
  useEffect(() => {
    const el = compRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCompInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-32">

      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <div className={`text-center transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <span className="inline-block rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-violet-300 uppercase mb-6">
          Animated Paper Explainer · Paper 2
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          ECRVR-MVEL
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-emerald-400 to-amber-400 mt-2 text-2xl md:text-3xl">
            Explainable Code Readability via Ensemble Learning
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-lg leading-relaxed mb-4">
          Bharat Babaso Mane &amp; Dr. Rathnakar Achary
        </p>
        <p className="mx-auto max-w-2xl text-slate-500 text-sm mb-10">
          Alliance School of Advance Computing, Alliance University, Bengaluru · Accepted — ETASR
        </p>

        {/* acronym breakdown */}
        <div className="mx-auto max-w-3xl mb-8">
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { letter: "E", word: "Explainable", color: "text-violet-300 border-violet-500/30 bg-violet-500/10" },
              { letter: "C", word: "Code", color: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" },
              { letter: "R", word: "Readability", color: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
              { letter: "V", word: "Vector", color: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
              { letter: "R", word: "Representations", color: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
              { letter: "M", word: "Majority", color: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
              { letter: "V", word: "Voting", color: "text-pink-300 border-pink-500/30 bg-pink-500/10" },
              { letter: "E", word: "Ensemble", color: "text-indigo-300 border-indigo-500/30 bg-indigo-500/10" },
              { letter: "L", word: "Learning", color: "text-teal-300 border-teal-500/30 bg-teal-500/10" },
            ].map(({ letter, word, color }, i) => (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2 ${color} transition-all duration-500`}
                style={{ transitionDelay: `${i * 80}ms`, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(10px)" }}
              >
                <span className="font-bold text-base">{letter}</span>
                <span className="text-slate-400 text-xs ml-1">{word}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-left text-slate-300 text-base leading-relaxed">
          <span className="text-violet-400 font-semibold text-sm uppercase tracking-widest block mb-3">Abstract</span>
          Code readability reflects a human evaluation of source code comprehensibility and is essential to software quality and maintenance.
          Prior methods rely on <strong className="text-white">labor-intensive handcrafted features</strong> or{" "}
          <strong className="text-white">opaque deep learning</strong> with no transparency.
          ECRVR-MVEL combines <strong className="text-violet-300">CodeBERT vector representations</strong> with a{" "}
          <strong className="text-emerald-300">weighted majority voting ensemble</strong> of GCN, DBN, and BiTCN
          classifiers, optimized with <strong className="text-amber-300">Nadam</strong> and explained with{" "}
          <strong className="text-rose-300">LIME</strong> — classifying code into High, Medium, and Low readability
          with full transparency.
        </div>
        <div className="mt-8 flex justify-center">
          <div className="animate-bounce text-slate-600 text-2xl">↓</div>
        </div>
      </div>

      {/* ── 2. THE PROBLEM ─────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">The Problem</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Why existing approaches fall short</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { stat: "70%", label: "of software lifecycle cost is in the maintenance stage", color: "text-rose-400" },
            { stat: "Manual", label: "feature engineering captures only partial source code information", color: "text-amber-400" },
            { stat: "Black-box", label: "deep learning models hide their reasoning from practitioners", color: "text-violet-400" },
          ].map(({ stat, label, color }) => (
            <div key={stat} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className={`font-display text-4xl font-bold ${color} mb-3`}>{stat}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 text-slate-300 text-base leading-relaxed">
          <strong className="text-violet-300">Research Gap:</strong> The field lacks interpretable deep learning frameworks
          that simultaneously learn complex code features <em>and</em> provide transparent, per-prediction explanations —
          most prior work trades off accuracy for explainability or vice versa.
        </div>
      </Section>

      {/* ── 3. PIPELINE ────────────────────────────────────────────── */}
      <div ref={pipelineRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${pipelineInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">The Framework</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">5-Stage ECRVR-MVEL Pipeline</h2>
        </div>
        <div className="space-y-4">
          {pipeline.map(({ step, title, desc, color, border, badge, tags }, i) => (
            <div
              key={step}
              className={`rounded-2xl border ${border} bg-gradient-to-r ${color} p-6 transition-all duration-700`}
              style={{ transitionDelay: `${i * 130}ms`, opacity: pipelineInView ? 1 : 0, transform: pipelineInView ? "translateX(0)" : "translateX(-40px)" }}
            >
              <div className="flex gap-5">
                <span className={`shrink-0 rounded-xl ${badge} px-3 py-1 font-mono text-sm font-bold h-fit mt-1`}>{step}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <span key={t} className={`rounded-full border ${border} px-3 py-0.5 text-xs font-mono text-slate-300`}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. DATASET ─────────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Dataset</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Code Snippets: Insights &amp; Readability</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Python and C++ code snippets annotated with readability scores, cyclomatic complexity, line counts, and identifier metadata.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { lang: "Python", total: 1681, low: 561, med: 560, high: 560, color: "border-cyan-500/30 bg-cyan-500/5", badge: "text-cyan-300" },
            { lang: "C++", total: 1504, low: 502, med: 500, high: 502, color: "border-violet-500/30 bg-violet-500/5", badge: "text-violet-300" },
          ].map(({ lang, total, low, med, high, color, badge }) => (
            <div key={lang} className={`rounded-2xl border ${color} p-6`}>
              <div className={`font-mono text-xs tracking-widest mb-4 ${badge}`}>{lang} DATASET — {total} SAMPLES</div>
              <div className="space-y-3">
                {[["Low Readability", low, "bg-rose-400"], ["Medium Readability", med, "bg-amber-400"], ["High Readability", high, "bg-emerald-400"]].map(([label, count, bar]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{label as string}</span><span>{count as number} samples</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${bar as string} rounded-full`} style={{ width: `${((count as number) / total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Example snippets */}
        <div className="grid md:grid-cols-3 gap-4">
          {codeSnippets.map(({ lang, score, level, color, code }) => (
            <div key={level} className={`rounded-xl border ${color} p-4`}>
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-xs">{lang}</span>
                <span className={`text-xs font-bold`}>Score: {score} → {level}</span>
              </div>
              <pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono">{code}</pre>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. ENSEMBLE MODELS ─────────────────────────────────────── */}
      <div ref={ensRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${ensInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Stage 3 — Deep Dive</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Three Classifiers, One Ensemble</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Each model captures a different structural property of source code. Their weighted votes produce a result stronger than any individual model.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {ensembleModels.map(({ name, full, role, strength, pythonAcc, cppAcc, color, badge, bar, icon }, i) => (
            <div
              key={name}
              className={`rounded-2xl border ${color} p-6 transition-all duration-700`}
              style={{ transitionDelay: `${i * 150}ms`, opacity: ensInView ? 1 : 0, transform: ensInView ? "translateY(0)" : "translateY(30px)" }}
            >
              <div className="text-4xl mb-3">{icon}</div>
              <div className={`inline-block rounded-full ${badge} px-3 py-1 text-xs font-mono font-bold mb-3`}>{name}</div>
              <h3 className="text-white font-semibold text-sm mb-2">{full}</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">{role}</p>
              <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300 mb-4">
                <strong>Strength:</strong> {strength}
              </div>
              <div className="space-y-2">
                {[["Python", pythonAcc], ["C++", cppAcc]].map(([lang, acc]) => (
                  <div key={lang as string}>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{lang as string} Accuracy</span><span>{(acc as number).toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${bar} rounded-full transition-all duration-1000`}
                        style={{ width: ensInView ? `${(acc as number) - 60}%` : "0%", transitionDelay: `${i * 150 + 400}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. VOTING MECHANISM ────────────────────────────────────── */}
      <div ref={voteRef}>
        <Section>
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Ensemble Decision</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Weighted Majority Voting</h2>
          </div>
        </Section>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8">
          <div className="flex flex-col items-center gap-6">
            {/* Input */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-sm text-slate-300 font-mono text-center">
              Source Code → CodeBERT Embeddings
            </div>
            <div className="text-slate-600">↓ classified independently by each model</div>
            {/* Three model votes */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {[
                { name: "GCN", vote: "Medium", weight: "w₁", color: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
                { name: "DBN", vote: "High", weight: "w₂", color: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
                { name: "BiTCN", vote: "High", weight: "w₃", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
              ].map(({ name, vote, weight, color }, i) => (
                <div
                  key={name}
                  className={`rounded-xl border ${color} p-4 text-center transition-all duration-500`}
                  style={{ transitionDelay: `${i * 150}ms`, opacity: voteInView ? 1 : 0, transform: voteInView ? "scale(1)" : "scale(0.8)" }}
                >
                  <div className="font-mono text-xs mb-1">{name}</div>
                  <div className="font-bold text-white text-sm mb-1">{vote}</div>
                  <div className="text-xs text-slate-500">weight {weight}</div>
                </div>
              ))}
            </div>
            <div
              className={`transition-all duration-700 delay-500 ${voteInView ? "opacity-100" : "opacity-0"}`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="text-slate-500 text-xs font-mono">WC = AC × AN — weighted confidence vote</div>
                <div className="h-8 w-px bg-gradient-to-b from-amber-400 to-emerald-400" />
                <div className="text-amber-400 text-lg">↓</div>
              </div>
            </div>
            {/* Final decision */}
            <div
              className={`rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-10 py-4 text-center transition-all duration-700 delay-700 ${voteInView ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            >
              <div className="text-emerald-400 text-xs font-mono tracking-widest mb-1">FINAL PREDICTION</div>
              <div className="text-white font-bold text-2xl">HIGH Readability</div>
              <div className="text-slate-500 text-xs mt-1">DBN + BiTCN outweigh GCN's Medium vote</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. LIME ────────────────────────────────────────────────── */}
      <div ref={limeRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${limeInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">Stage 5 — Explainability</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">LIME Feature Explanations</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">LIME perturbs each code sample and fits a local linear model to explain which features push predictions toward each readability class.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Python Dataset", features: limeFeaturesPython, accent: "cyan" },
            { title: "C++ Dataset", features: limeFeaturesC, accent: "violet" },
          ].map(({ title, features, accent }) => (
            <div key={title} className={`rounded-2xl border border-${accent}-500/20 bg-${accent}-500/5 p-6`}>
              <div className={`text-${accent}-300 font-mono text-xs tracking-widest mb-5`}>{title}</div>
              <div className="space-y-4">
                {features.map(({ feature, pct, impact, cls }, i) => (
                  <div key={feature} className="transition-all duration-500" style={{ transitionDelay: `${i * 90}ms`, opacity: limeInView ? 1 : 0 }}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-mono">{feature}</span>
                      <span className={`text-xs font-semibold ${impact === "positive" ? "text-emerald-400" : "text-rose-400"}`}>
                        {impact === "positive" ? "▲" : "▼"} {cls}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${impact === "positive" ? "bg-emerald-400" : "bg-rose-400"}`}
                        style={{ width: limeInView ? `${pct}%` : "0%", transitionDelay: `${i * 90 + 200}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. RESULTS ─────────────────────────────────────────────── */}
      <div ref={resultsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${resultsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Experimental Results</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Best Results (30% Test Split)</h2>
          <p className="text-slate-400 mt-3">Weighted Majority Voting Ensemble outperforms all three individual models</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[
            { lang: "PYTHON DATASET", metrics: [{ label: "Accuracy", v: 98.15 }, { label: "Precision", v: 97.23 }, { label: "Recall", v: 97.24 }, { label: "F1-Score", v: 97.21 }, { label: "AUC Score", v: 97.94 }], color: "border-cyan-500/20 bg-cyan-500/5", accent: "text-cyan-300 text-cyan-400", slide: "-translate-x-8" },
            { lang: "C++ DATASET", metrics: [{ label: "Accuracy", v: 98.38 }, { label: "Precision", v: 97.61 }, { label: "Recall", v: 97.60 }, { label: "F1-Score", v: 97.59 }, { label: "AUC Score", v: 98.19 }], color: "border-violet-500/20 bg-violet-500/5", accent: "text-violet-300 text-violet-400", slide: "translate-x-8" },
          ].map(({ lang, metrics, color, accent, slide }) => {
            const [label1, label2] = accent.split(" ");
            return (
              <div key={lang} className={`rounded-2xl border ${color} p-8 transition-all duration-700 ${resultsInView ? "opacity-100 translate-x-0" : `opacity-0 ${slide}`}`} style={{ transitionDelay: "150ms" }}>
                <div className={`${label1} font-mono text-xs tracking-widest mb-6`}>{lang} — WMVE ENSEMBLE</div>
                {metrics.map(({ label, v }) => (
                  <div key={label} className="flex justify-between items-baseline border-b border-white/5 py-3 last:border-0">
                    <span className="text-slate-400 text-sm">{label}</span>
                    <span className="font-display text-2xl font-bold text-white">
                      <Counter target={v} decimals={2} inView={resultsInView} />
                      <span className={`${label2} text-sm ml-1`}>%</span>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Individual model comparison */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-xs text-slate-500 font-mono tracking-widest mb-5">INDIVIDUAL MODEL vs ENSEMBLE — PYTHON ACCURACY</div>
          <div className="space-y-3">
            {[
              { name: "GCN (alone)", acc: 92.87, bar: "bg-cyan-400/60" },
              { name: "DBN (alone)", acc: 94.46, bar: "bg-violet-400/60" },
              { name: "BiTCN (alone)", acc: 95.38, bar: "bg-emerald-400/60" },
              { name: "WMVE Ensemble", acc: 98.15, bar: "bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400", highlight: true },
            ].map(({ name, acc, bar, highlight }, i) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={highlight ? "text-white font-semibold" : "text-slate-400"}>{name}</span>
                  <span className={highlight ? "text-emerald-400 font-bold" : "text-slate-500"}>{acc}%</span>
                </div>
                <div className={`h-2.5 bg-white/5 rounded-full overflow-hidden ${highlight ? "h-4" : ""}`}>
                  <div
                    className={`h-full rounded-full ${bar} transition-all duration-1000`}
                    style={{ width: resultsInView ? `${(acc - 88) * 8}%` : "0%", transitionDelay: `${i * 120 + 300}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 9. COMPARATIVE ─────────────────────────────────────────── */}
      <div ref={compRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${compInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Comparative Analysis</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">vs. Existing Methods — Python</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
          {comparativePython.map(({ name, acc, highlight }, i) => (
            <div key={name} className="transition-all duration-500" style={{ transitionDelay: `${i * 80}ms`, opacity: compInView ? 1 : 0 }}>
              <div className="flex justify-between text-sm mb-1">
                <span className={highlight ? "text-white font-bold" : "text-slate-400"}>{name}</span>
                <span className={highlight ? "text-emerald-400 font-bold text-base" : "text-slate-500"}>{acc}%</span>
              </div>
              <div className={`bg-white/5 rounded-full overflow-hidden ${highlight ? "h-5" : "h-2"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${highlight ? "bg-gradient-to-r from-violet-400 via-emerald-400 to-cyan-400" : "bg-slate-500/50"}`}
                  style={{ width: compInView ? `${acc}%` : "0%", transitionDelay: `${i * 80 + 200}ms` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. CONCLUSION ─────────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-emerald-500/5 to-amber-500/10 p-10 text-center">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Conclusion</span>
          <h2 className="font-display text-3xl font-bold text-white mt-4 mb-6">Key Contribution</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            ECRVR-MVEL establishes an <strong className="text-violet-300">interpretable ensemble framework</strong> that
            unifies CodeBERT's semantic richness with the complementary strengths of{" "}
            <strong className="text-cyan-300">GCN</strong>, <strong className="text-violet-300">DBN</strong>, and{" "}
            <strong className="text-emerald-300">BiTCN</strong> — producing{" "}
            <strong className="text-amber-300">98.15% accuracy on Python</strong> and{" "}
            <strong className="text-amber-300">98.38% on C++</strong>, with{" "}
            <strong className="text-rose-300">LIME explanations</strong> that make every prediction auditable and actionable.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/papers/paper-2" className="rounded-full bg-violet-500/20 border border-violet-500/40 px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors">
              ← Full Paper Detail
            </Link>
            <Link to="/papers/iraf-xadl/animated" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Paper 1 Explainer →
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
}
