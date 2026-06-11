import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ── Helpers ─────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Counter({ target, decimals = 2, inView }: { target: number; decimals?: number; inView: boolean }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1800; const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setVal(parseFloat(((1 - Math.pow(1 - p, 3)) * target).toFixed(decimals)));
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
    step: "01", title: "Min-Max Normalization",
    desc: "Scales all developer metrics (experience duration, contribution frequency, prior projects) to [0,1], ensuring no single feature dominates due to magnitude and enabling fair cross-developer comparison.",
    color: "from-teal-500/20 to-teal-500/5", border: "border-teal-500/30", badge: "bg-teal-500/20 text-teal-300",
    tags: ["Feature Scaling", "Range [0,1]", "Unbiased Comparison"],
    icon: "⇔",
  },
  {
    step: "02", title: "BAHB — Bio-Inspired Feature Selection",
    desc: "The Artificial Hummingbird Algorithm mimics three flight behaviors — axial, diagonal, and omnidirectional — to explore the feature space and identify the 18 most informative features from 26 total.",
    color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-300",
    tags: ["Guided Foraging", "Territory Search", "18 of 26 Features Selected"],
    icon: "🦅",
  },
  {
    step: "03", title: "SSNN — Simplified Spiking Neural Network",
    desc: "A biologically plausible classifier where neurons fire only when membrane potential exceeds a threshold. Unlike traditional ANNs, SSNN processes temporal spike patterns, enabling efficient and biologically realistic classification.",
    color: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300",
    tags: ["Spike Coding", "Membrane Potential", "Temporal Processing"],
    icon: "⚡",
  },
  {
    step: "04", title: "AMBOA — Adaptive Migration Butterfly Optimization",
    desc: "Inspired by butterfly foraging and mating, AMBOA tunes SSNN hyperparameters via PSO-enhanced global and local search with linearly decreasing inertia weights, preventing local optima and accelerating convergence.",
    color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300",
    tags: ["PSO-Enhanced", "Global + Local Search", "Adaptive Inertia"],
    icon: "🦋",
  },
];

const classes = [
  { code: "ESE", full: "Experienced Software Engineer", count: 69, color: "bg-emerald-400", textColor: "text-emerald-300", acc30: 99.53, f130: 98.04 },
  { code: "SA", full: "Software Architect", count: 29, color: "bg-cyan-400", textColor: "text-cyan-300", acc30: 100.0, f130: 100.0 },
  { code: "SE", full: "Software Engineer", count: 73, color: "bg-violet-400", textColor: "text-violet-300", acc30: 97.63, f130: 82.76 },
  { code: "NSE", full: "Non-Software Engineer", count: 17, color: "bg-amber-400", textColor: "text-amber-300", acc30: 100.0, f130: 100.0 },
  { code: "BOT", full: "Bot Account", count: 10, color: "bg-rose-400", textColor: "text-rose-300", acc30: 98.10, f130: 33.33 },
  { code: "UNK", full: "Unknown", count: 505, color: "bg-slate-400", textColor: "text-slate-300", acc30: 97.16, f130: 98.14 },
];

const comparative = [
  { name: "Naïve Bayes", acc: 89.15, time: 11.60 },
  { name: "DBN Model", acc: 91.86, time: 12.29 },
  { name: "AlexNet", acc: 92.34, time: 15.82 },
  { name: "ANN", acc: 93.20, time: 14.51 },
  { name: "Decision Tree", acc: 94.08, time: 16.18 },
  { name: "Random Forest", acc: 94.70, time: 14.57 },
  { name: "CNN", acc: 94.78, time: 17.33 },
  { name: "EESQA-DELMOA", acc: 98.74, time: 8.27, highlight: true },
];

const snnSteps = [
  { label: "Input Spike", desc: "Incoming spike Cⱼ,ₕ received", color: "bg-teal-400" },
  { label: "Membrane Update", desc: "Potential D increases by synaptic weight Vⱼ", color: "bg-emerald-400" },
  { label: "Threshold Check", desc: "If D ≥ D_threshold → fire!", color: "bg-amber-400" },
  { label: "Spike Output", desc: "Neuron fires — output spike sent", color: "bg-violet-400" },
  { label: "Decay", desc: "Membrane potential decays back toward rest (GD=0)", color: "bg-slate-400" },
];

/* ════════════════════════════════════════════════════════════════════ */
export function EesqaDelmoaAnimated() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  const pipelineRef = useRef<HTMLDivElement>(null);
  const [pipelineInView, setPipelineInView] = useState(false);
  useEffect(() => {
    const el = pipelineRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPipelineInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const snnRef = useRef<HTMLDivElement>(null);
  const [snnInView, setSnnInView] = useState(false);
  useEffect(() => {
    const el = snnRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSnnInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const classRef = useRef<HTMLDivElement>(null);
  const [classInView, setClassInView] = useState(false);
  useEffect(() => {
    const el = classRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setClassInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [resultsInView, setResultsInView] = useState(false);
  useEffect(() => {
    const el = resultsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setResultsInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const compRef = useRef<HTMLDivElement>(null);
  const [compInView, setCompInView] = useState(false);
  useEffect(() => {
    const el = compRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCompInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const timeRef = useRef<HTMLDivElement>(null);
  const [timeInView, setTimeInView] = useState(false);
  useEffect(() => {
    const el = timeRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-32">

      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <div className={`text-center transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <span className="inline-block rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-teal-300 uppercase mb-6">
          Animated Paper Explainer · Paper 3
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
          EESQA-DELMOA
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-amber-400 to-violet-400 mt-2 text-2xl md:text-3xl">
            Developer Experience → Software Quality
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-lg mb-4">
          Bharat Babaso Mane &amp; Dr. Rathnakar Achary
        </p>
        <p className="mx-auto max-w-2xl text-slate-500 text-sm mb-10">
          Alliance School of Advance Computing, Alliance University, Bengaluru · Accepted — ETASR (in production)
        </p>

        {/* acronym */}
        <div className="mx-auto max-w-3xl mb-8 flex flex-wrap justify-center gap-2 text-sm">
          {[
            ["E", "Empirical", "text-teal-300 border-teal-500/30 bg-teal-500/10"],
            ["E", "Evaluation", "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"],
            ["S", "Software", "text-cyan-300 border-cyan-500/30 bg-cyan-500/10"],
            ["Q", "Quality", "text-violet-300 border-violet-500/30 bg-violet-500/10"],
            ["A", "Assessment", "text-amber-300 border-amber-500/30 bg-amber-500/10"],
            ["D", "Developer", "text-rose-300 border-rose-500/30 bg-rose-500/10"],
            ["E", "Experience", "text-sky-300 border-sky-500/30 bg-sky-500/10"],
            ["L", "Level", "text-pink-300 border-pink-500/30 bg-pink-500/10"],
            ["M", "Metaheuristic", "text-indigo-300 border-indigo-500/30 bg-indigo-500/10"],
            ["O", "Optimization", "text-orange-300 border-orange-500/30 bg-orange-500/10"],
            ["A", "Algorithms", "text-lime-300 border-lime-500/30 bg-lime-500/10"],
          ].map(([letter, word, color], i) => (
            <div key={i} className={`rounded-lg border px-3 py-2 ${color} transition-all duration-500`}
              style={{ transitionDelay: `${i * 70}ms`, opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(10px)" }}>
              <span className="font-bold text-base">{letter}</span>
              <span className="text-slate-400 text-xs ml-1">{word}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-left text-slate-300 text-base leading-relaxed">
          <span className="text-teal-400 font-semibold text-sm uppercase tracking-widest block mb-3">Abstract</span>
          Software quality is profoundly shaped by the experience level of the developer who writes it.
          Yet identifying that experience level accurately — and using it to guide project allocation — remains unsolved.
          EESQA-DELMOA proposes a four-stage pipeline: <strong className="text-teal-300">min-max normalization</strong>,
          bio-inspired <strong className="text-emerald-300">hummingbird feature selection (BAHB)</strong>,
          a <strong className="text-violet-300">Simplified Spiking Neural Network (SSNN)</strong> classifier,
          and <strong className="text-amber-300">butterfly optimization (AMBOA)</strong> for parameter tuning —
          achieving <strong className="text-white">98.74% accuracy</strong> across six developer experience classes
          in just <strong className="text-white">8.27 seconds</strong>.
        </div>
        <div className="mt-8 flex justify-center"><div className="animate-bounce text-slate-600 text-2xl">↓</div></div>
      </div>

      {/* ── 2. PROBLEM ─────────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">The Problem</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Allocating the right developer is hard</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { stat: "70%", label: "of lifecycle cost is maintenance — quality of code directly impacts this", color: "text-rose-400" },
            { stat: "Manual", label: "hiring assessments are expensive, slow, and inconsistent across organizations", color: "text-amber-400" },
            { stat: "6 Levels", label: "of developer expertise exist but no automated framework classifies them objectively", color: "text-teal-400" },
          ].map(({ stat, label, color }) => (
            <div key={stat} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className={`font-display text-4xl font-bold ${color} mb-3`}>{stat}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-6 text-slate-300 leading-relaxed">
          <strong className="text-teal-300">Research Gap:</strong> Prior models rely on pull-request history, hiring interviews,
          or subjective cognitive assessments — all expensive and non-scalable. No framework systematically links
          developer experience directly to code quality metrics using biologically inspired deep learning.
        </div>
      </Section>

      {/* ── 3. DATASET ─────────────────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">Dataset</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">703 Developers · 6 Experience Classes</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Open-source dataset (Zenodo) with 26 developer metrics. BAHB selects the 18 most informative features.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="text-xs text-slate-500 font-mono tracking-widest mb-6">CLASS DISTRIBUTION — 703 INSTANCES</div>
          <div className="space-y-4">
            {classes.map(({ code, full, count, color, textColor }) => (
              <div key={code}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-mono font-bold ${textColor}`}>{code}</span>
                  <span className="text-slate-500">{full} — {count} instances</span>
                  <span className="text-slate-400">{((count / 703) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${(count / 703) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-slate-400">
            <strong className="text-amber-300">Note:</strong> UNK (Unknown) dominates with 505 samples — a real-world class imbalance challenge that SSNN handles through temporal spike pattern discrimination.
          </div>
        </div>
      </Section>

      {/* ── 4. PIPELINE ────────────────────────────────────────────── */}
      <div ref={pipelineRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${pipelineInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-teal-400 uppercase">The Framework</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">4-Stage EESQA-DELMOA Pipeline</h2>
        </div>
        <div className="space-y-4">
          {pipeline.map(({ step, title, desc, color, border, badge, tags, icon }, i) => (
            <div key={step} className={`rounded-2xl border ${border} bg-gradient-to-r ${color} p-6 transition-all duration-700`}
              style={{ transitionDelay: `${i * 130}ms`, opacity: pipelineInView ? 1 : 0, transform: pipelineInView ? "translateX(0)" : "translateX(-40px)" }}>
              <div className="flex gap-5">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <span className={`rounded-xl ${badge} px-3 py-1 font-mono text-sm font-bold`}>{step}</span>
                  <span className="text-2xl">{icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => <span key={t} className={`rounded-full border ${border} px-3 py-0.5 text-xs font-mono text-slate-300`}>{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. BAHB VISUALIZATION ──────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Stage 2 — Deep Dive</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">How the Hummingbird Finds Features</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">BAHB mimics 3 hummingbird flight behaviors to explore the 26-feature space and select the best 18.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { type: "Axial Flight", desc: "Searches along a single axis at a time — probes one feature dimension for local optima", icon: "→", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300" },
            { type: "Diagonal Flight", desc: "Searches across multiple axes simultaneously — explores feature combinations", icon: "↗", color: "border-teal-500/30 bg-teal-500/5 text-teal-300" },
            { type: "Omnidirectional", desc: "Explores all directions at once — global search across the full feature space", icon: "✦", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300" },
          ].map(({ type, desc, icon, color }) => (
            <div key={type} className={`rounded-2xl border ${color} p-6 text-center`}>
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="font-semibold text-white mb-2">{type}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-white">26</div>
              <div className="text-slate-500 text-xs mt-1">Total Features</div>
            </div>
            <div className="text-slate-600 text-2xl flex-1 text-center">→ BAHB selects →</div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-emerald-400">18</div>
              <div className="text-slate-500 text-xs mt-1">Optimal Features</div>
            </div>
            <div className="text-slate-600 text-2xl flex-1 text-center">→ fed into →</div>
            <div className="text-center">
              <div className="font-display text-3xl font-bold text-violet-400">SSNN</div>
              <div className="text-slate-500 text-xs mt-1">Classifier</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 6. SSNN VISUALIZATION ──────────────────────────────────── */}
      <div ref={snnRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${snnInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">Stage 3 — Deep Dive</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">How Spiking Neurons Classify</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Unlike ANNs that pass continuous values, SSNN neurons fire spikes only when membrane potential exceeds a threshold — more biologically accurate and computationally efficient.</p>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-8">
          <div className="space-y-4">
            {snnSteps.map(({ label, desc, color }, i) => (
              <div key={label} className="flex items-center gap-5 transition-all duration-500"
                style={{ transitionDelay: `${i * 120}ms`, opacity: snnInView ? 1 : 0, transform: snnInView ? "translateX(0)" : "translateX(-30px)" }}>
                <div className={`shrink-0 w-3 h-3 rounded-full ${color}`} />
                <div className="flex-1 h-px bg-white/10" />
                <div className="w-44 shrink-0">
                  <div className="text-white text-sm font-semibold">{label}</div>
                  <div className="text-slate-500 text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="text-slate-400 text-xs font-mono tracking-widest mb-3">TRADITIONAL ANN</div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" />
                <span className="text-slate-400 text-xs">Continuous activation (always on)</span>
              </div>
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5">
              <div className="text-violet-300 text-xs font-mono tracking-widest mb-3">SSNN — SPIKE-BASED</div>
              <div className="flex items-center gap-1">
                {[0,0,0,1,0,0,1,0,0,0,1,0].map((s, i) => (
                  <div key={i} className={`flex-1 rounded-sm transition-all duration-300 ${s ? "h-6 bg-violet-400" : "h-1 bg-white/10"}`}
                    style={{ transitionDelay: snnInView ? `${i * 80 + 500}ms` : "0ms" }} />
                ))}
                <span className="text-slate-400 text-xs ml-2 shrink-0">Spikes only when needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. CLASS-LEVEL RESULTS ─────────────────────────────────── */}
      <div ref={classRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${classInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-teal-400 uppercase">Class-Level Performance</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Results per Developer Class (30% Test)</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classes.map(({ code, full, acc30, f130, color, textColor }, i) => (
            <div key={code} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-500"
              style={{ transitionDelay: `${i * 100}ms`, opacity: classInView ? 1 : 0, transform: classInView ? "scale(1)" : "scale(0.9)" }}>
              <div className={`font-mono text-xl font-bold ${textColor} mb-1`}>{code}</div>
              <div className="text-slate-500 text-xs mb-4">{full}</div>
              <div className="space-y-2">
                {[["Accuracy", acc30, color], ["F1-Score", f130, color]].map(([lbl, val, bar]) => (
                  <div key={lbl as string}>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{lbl as string}</span><span className="font-semibold">{(val as number).toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${bar as string} rounded-full transition-all duration-1000`}
                        style={{ width: classInView ? `${val as number}%` : "0%", transitionDelay: `${i * 100 + 300}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-slate-400">
          <strong className="text-amber-300">BOT class note:</strong> Only 10 samples in the BOT class result in a lower F1 (33.33%) — a class imbalance artifact, not a model failure. Accuracy remains 98.10% even for this rare class.
        </div>
      </div>

      {/* ── 8. KEY METRICS ─────────────────────────────────────────── */}
      <div ref={resultsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${resultsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Overall Results</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">State-of-the-Art Performance</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: "Accuracy", value: 98.74, color: "text-teal-400", border: "border-teal-500/20 bg-teal-500/5" },
            { label: "Precision", value: 96.16, color: "text-emerald-400", border: "border-emerald-500/20 bg-emerald-500/5" },
            { label: "Recall", value: 83.54, color: "text-cyan-400", border: "border-cyan-500/20 bg-cyan-500/5" },
            { label: "F1-Score", value: 85.38, color: "text-violet-400", border: "border-violet-500/20 bg-violet-500/5" },
            { label: "AUC Score", value: 90.84, color: "text-amber-400", border: "border-amber-500/20 bg-amber-500/5" },
            { label: "Exec. Time", value: 8.27, color: "text-rose-400", border: "border-rose-500/20 bg-rose-500/5", suffix: "s", decimals: 2 },
          ].map(({ label, value, color, border, suffix = "%", decimals = 2 }, i) => (
            <div key={label} className={`rounded-2xl border ${border} p-8 text-center transition-all duration-500`}
              style={{ transitionDelay: `${i * 80}ms`, opacity: resultsInView ? 1 : 0, transform: resultsInView ? "translateY(0)" : "translateY(20px)" }}>
              <div className={`font-display text-4xl font-bold ${color} mb-2`}>
                <Counter target={value} decimals={decimals} inView={resultsInView} />{suffix}
              </div>
              <div className="text-slate-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. COMPARATIVE ACCURACY ────────────────────────────────── */}
      <div ref={compRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${compInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Comparative Analysis</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Accuracy vs. All Baselines</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
          {comparative.map(({ name, acc, highlight }, i) => (
            <div key={name} className="transition-all duration-500" style={{ transitionDelay: `${i * 80}ms`, opacity: compInView ? 1 : 0 }}>
              <div className="flex justify-between text-sm mb-1">
                <span className={highlight ? "text-white font-bold" : "text-slate-400"}>{name}</span>
                <span className={highlight ? "text-teal-400 font-bold text-base" : "text-slate-500"}>{acc}%</span>
              </div>
              <div className={`bg-white/5 rounded-full overflow-hidden ${highlight ? "h-5" : "h-2"}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${highlight ? "bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" : "bg-slate-500/50"}`}
                  style={{ width: compInView ? `${(acc - 87) * 9}%` : "0%", transitionDelay: `${i * 80 + 200}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. EXECUTION TIME ─────────────────────────────────────── */}
      <div ref={timeRef}>
        <Section>
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest text-rose-400 uppercase">Speed Advantage</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Fastest by a Wide Margin</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">EESQA-DELMOA runs in 8.27s — CNN takes 17.33s. Lower is better.</p>
          </div>
        </Section>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
          {comparative.sort((a, b) => b.time - a.time).map(({ name, time, highlight }, i) => (
            <div key={name} className="transition-all duration-500" style={{ transitionDelay: `${i * 80}ms`, opacity: timeInView ? 1 : 0 }}>
              <div className="flex justify-between text-sm mb-1">
                <span className={highlight ? "text-white font-bold" : "text-slate-400"}>{name}</span>
                <span className={highlight ? "text-rose-400 font-bold" : "text-slate-500"}>{time}s</span>
              </div>
              <div className={`bg-white/5 rounded-full overflow-hidden ${highlight ? "h-4" : "h-2"}`}>
                <div className={`h-full rounded-full transition-all duration-1000 ${highlight ? "bg-gradient-to-r from-rose-400 to-amber-400" : "bg-slate-500/40"}`}
                  style={{ width: timeInView ? `${(time / 17.33) * 100}%` : "0%", transitionDelay: `${i * 80 + 200}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 11. CONCLUSION ─────────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-teal-500/10 via-violet-500/5 to-amber-500/10 p-10 text-center">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Conclusion</span>
          <h2 className="font-display text-3xl font-bold text-white mt-4 mb-6">Key Contribution</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            EESQA-DELMOA frames <strong className="text-teal-300">developer experience classification</strong> as an
            objective, code-driven problem — using bio-inspired{" "}
            <strong className="text-emerald-300">hummingbird feature selection</strong>,
            biologically realistic <strong className="text-violet-300">spiking neural networks</strong>, and
            <strong className="text-amber-300"> butterfly optimization</strong> to achieve{" "}
            <strong className="text-white">98.74% accuracy</strong> in just{" "}
            <strong className="text-white">8.27 seconds</strong> — enabling intelligent, automated developer allocation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/papers/paper-3" className="rounded-full bg-teal-500/20 border border-teal-500/40 px-6 py-3 text-sm font-semibold text-teal-300 hover:bg-teal-500/30 transition-colors">
              ← Full Paper Detail
            </Link>
            <Link to="/thesis-story" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              See the Bigger Picture →
            </Link>
            <Link to="/papers/paper-2/animated" className="rounded-full bg-violet-500/10 border border-violet-500/30 px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/20 transition-colors">
              Paper 2 Explainer
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
}
