import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}>
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────────────────────── */
const papers = [
  {
    num: "01", id: "iraf-xadl",
    title: "IRAF-XADL",
    full: "Identifier Readability via Explainable Deep Learning",
    question: "Is this variable name readable — and why?",
    level: "Identifier Level",
    levelDesc: "Single variable, function, or class name",
    input: "Individual identifiers extracted via AST",
    features: "10 handcrafted cognitive parameters + CodeBERT",
    classifier: "Self-Attention BiLSTM (SA-BiLSTM)",
    xai: "SHAP — global feature attribution",
    optimizer: "AdamW",
    output: "Binary: Readable / Unreadable",
    dataset: "Code Snippets: Insights & Readability (Kaggle)",
    bestAcc: "98.42%",
    lang: "Python & C++",
    status: "Published — ETASR Vol.16 No.3",
    color: "from-cyan-500 to-cyan-700",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    badge: "bg-cyan-500/20 text-cyan-300",
    accent: "text-cyan-400",
    glow: "shadow-cyan-500/10",
    animateTo: "/papers/iraf-xadl/animated",
    icon: "◈",
  },
  {
    num: "02", id: "paper-2",
    title: "ECRVR-MVEL",
    full: "Explainable Code Readability via Ensemble Learning",
    question: "How readable is this entire code snippet — and what drives that?",
    level: "Code Block Level",
    levelDesc: "Entire function or code snippet",
    input: "Full source code snippets",
    features: "CodeBERT vectors (no handcrafted params)",
    classifier: "Ensemble: GCN + DBN + BiTCN (Weighted Vote)",
    xai: "LIME — local per-prediction explanation",
    optimizer: "Nadam",
    output: "Ternary: High / Medium / Low",
    dataset: "Code Snippets: Insights & Readability (Kaggle)",
    bestAcc: "98.38%",
    lang: "Python & C++",
    status: "Accepted — ETASR (In Proof)",
    color: "from-violet-500 to-violet-700",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    badge: "bg-violet-500/20 text-violet-300",
    accent: "text-violet-400",
    glow: "shadow-violet-500/10",
    animateTo: "/papers/paper-2/animated",
    icon: "⬡",
  },
  {
    num: "03", id: "paper-3",
    title: "EESQA-DELMOA",
    full: "Developer Experience → Software Quality Assessment",
    question: "What experience level is this developer — and how does that predict quality?",
    level: "Developer Level",
    levelDesc: "The human who writes the code",
    input: "Developer metrics: experience, contributions, projects",
    features: "18 selected features (from 26) via BAHB",
    classifier: "Simplified Spiking Neural Network (SSNN)",
    xai: "Bio-inspired optimization (AMBOA)",
    optimizer: "AMBOA",
    output: "6-class: ESE / SA / SE / NSE / BOT / UNK",
    dataset: "Open-source developer dataset — Zenodo (703 instances)",
    bestAcc: "98.74%",
    lang: "Multi-language (repo-level)",
    status: "Submitted",
    color: "from-teal-500 to-teal-700",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    badge: "bg-teal-500/20 text-teal-300",
    accent: "text-teal-400",
    glow: "shadow-teal-500/10",
    animateTo: "/papers/paper-3/animated",
    icon: "⚡",
  },
];

const sharedFoundations = [
  { label: "CodeBERT", desc: "Papers 1 & 2 both use CodeBERT as the embedding backbone", papers: [1, 2], color: "bg-cyan-400" },
  { label: "XAI Philosophy", desc: "All 3 papers produce interpretable, explainable predictions (SHAP, LIME, bio-inspired)", papers: [1, 2, 3], color: "bg-violet-400" },
  { label: "Same Dataset", desc: "Papers 1 & 2 both use the Code Snippets: Insights & Readability dataset", papers: [1, 2], color: "bg-emerald-400" },
  { label: "Python & C++", desc: "Papers 1 & 2 both evaluate on Python and C++ codebases", papers: [1, 2], color: "bg-amber-400" },
  { label: "Deep Learning", desc: "All 3 papers use deep learning architectures for classification", papers: [1, 2, 3], color: "bg-rose-400" },
  { label: "≥98% Accuracy", desc: "All 3 papers achieve ≥98% accuracy on their respective benchmarks", papers: [1, 2, 3], color: "bg-teal-400" },
];

const validationLinks = [
  {
    from: "Paper 1 defines", highlight: "MC (Morphological Complexity)",
    to: "Paper 2's LIME identifies MC as the top driver of readability predictions",
    color: "border-cyan-500/30 bg-cyan-500/5", arrow: "text-cyan-400",
  },
  {
    from: "Paper 1 defines", highlight: "PRED (Predictability)",
    to: "Paper 2's LIME confirms PRED is dominant for both Low and High readability classes",
    color: "border-violet-500/30 bg-violet-500/5", arrow: "text-violet-400",
  },
  {
    from: "Paper 1 defines", highlight: "NC (Naming Convention)",
    to: "Paper 2's LIME shows NC contributes positively to Low class predictions",
    color: "border-emerald-500/30 bg-emerald-500/5", arrow: "text-emerald-400",
  },
  {
    from: "Papers 1 & 2 establish", highlight: "code quality is measurable by AI",
    to: "Paper 3 extends this to ask: can we predict quality from who wrote it?",
    color: "border-teal-500/30 bg-teal-500/5", arrow: "text-teal-400",
  },
];

const thesis3Pillars = [
  {
    pillar: "Measure", paper: "Paper 1", desc: "Precisely measure identifier-level readability using 10 cognitive parameters and explainable deep learning", color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300", icon: "◎",
  },
  {
    pillar: "Validate", paper: "Paper 2", desc: "Validate that code-level readability can be classified and explained at scale using ensemble learning", color: "border-violet-500/30 bg-violet-500/5 text-violet-300", icon: "✓",
  },
  {
    pillar: "Guide", paper: "Paper 3", desc: "Guide project allocation by predicting developer experience from code quality signals", color: "border-teal-500/30 bg-teal-500/5 text-teal-300", icon: "→",
  },
];

/* ════════════════════════════════════════════════════════════════════ */
export function ThesisStory() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  const zoomRef = useRef<HTMLDivElement>(null);
  const [zoomInView, setZoomInView] = useState(false);
  useEffect(() => {
    const el = zoomRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setZoomInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsInView, setCardsInView] = useState(false);
  useEffect(() => {
    const el = cardsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCardsInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const diffRef = useRef<HTMLDivElement>(null);
  const [diffInView, setDiffInView] = useState(false);
  useEffect(() => {
    const el = diffRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setDiffInView(true); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const valRef = useRef<HTMLDivElement>(null);
  const [valInView, setValInView] = useState(false);
  useEffect(() => {
    const el = valRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setValInView(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const pillarsRef = useRef<HTMLDivElement>(null);
  const [pillarsInView, setPillarsInView] = useState(false);
  useEffect(() => {
    const el = pillarsRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPillarsInView(true); }, { threshold: 0.2 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 space-y-32">

      {/* ── 1. HERO ────────────────────────────────────────────────── */}
      <div className={`text-center transition-all duration-1000 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <span className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold tracking-widest text-slate-300 uppercase mb-6">
          PhD Thesis · Animated Story
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
          Three Papers.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-teal-400 mt-2">
            One Bigger Goal.
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-300 text-xl leading-relaxed mb-4">
          Each paper asks a different question at a different scale. Together they form a unified answer to:
        </p>
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/5 px-8 py-6 text-xl text-white font-display font-semibold leading-relaxed">
          "Can Artificial Intelligence measure, explain, and predict software quality — at every level of abstraction?"
        </div>
        <div className="mt-8 flex justify-center"><div className="animate-bounce text-slate-600 text-2xl">↓</div></div>
      </div>

      {/* ── 2. ZOOM OUT ────────────────────────────────────────────── */}
      <div ref={zoomRef}>
        <div className={`text-center mb-14 transition-all duration-700 ${zoomInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">The Three Levels</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">A Zoom-Out Across Abstraction</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Each paper operates at a different granularity of the same core question.</p>
        </div>

        <div className="relative flex flex-col items-center gap-0">
          {[
            {
              paper: "Paper 1 · IRAF-XADL",
              level: "Identifier Level",
              example: "calculateTotalAmountForUser",
              question: "Is this name readable?",
              width: "w-48",
              color: "border-cyan-500/40 bg-cyan-500/10",
              badge: "text-cyan-300",
              delay: 0,
            },
            {
              paper: "Paper 2 · ECRVR-MVEL",
              level: "Code Block Level",
              example: "def isPalindrome(self, x): ...",
              question: "Is this function readable?",
              width: "w-72",
              color: "border-violet-500/40 bg-violet-500/10",
              badge: "text-violet-300",
              delay: 200,
            },
            {
              paper: "Paper 3 · EESQA-DELMOA",
              level: "Developer Level",
              example: "Author of 73 commits, 3 projects",
              question: "Is this developer experienced?",
              width: "w-full max-w-lg",
              color: "border-teal-500/40 bg-teal-500/10",
              badge: "text-teal-300",
              delay: 400,
            },
          ].map(({ paper, level, example, question, width, color, badge, delay }, i) => (
            <div key={paper} className="flex flex-col items-center w-full"
              style={{ transitionDelay: `${delay}ms`, opacity: zoomInView ? 1 : 0, transform: zoomInView ? "scaleX(1)" : "scaleX(0.3)", transition: "all 0.8s ease" }}>
              {i > 0 && (
                <div className="h-6 w-px bg-gradient-to-b from-slate-600 to-slate-700 my-1" />
              )}
              <div className={`${width} mx-auto rounded-2xl border ${color} p-5 text-center`}>
                <div className={`font-mono text-xs tracking-widest ${badge} mb-1`}>{paper}</div>
                <div className="text-white font-semibold text-sm mb-2">{level}</div>
                <div className="font-mono text-slate-400 text-xs bg-black/30 rounded-lg px-3 py-2 mb-2">{example}</div>
                <div className="text-slate-300 text-sm italic">"{question}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. PAPER CARDS SIDE BY SIDE ────────────────────────────── */}
      <div ref={cardsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${cardsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Paper by Paper</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">What Each Paper Does</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {papers.map(({ num, title, full, question, level, levelDesc, input, features, classifier, xai, optimizer, output, bestAcc, status, border, bg, badge, accent, animateTo, icon }, i) => (
            <div key={num}
              className={`rounded-2xl border ${border} ${bg} p-6 flex flex-col transition-all duration-700`}
              style={{ transitionDelay: `${i * 150}ms`, opacity: cardsInView ? 1 : 0, transform: cardsInView ? "translateY(0)" : "translateY(30px)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-2xl`}>{icon}</span>
                <div>
                  <div className={`font-mono text-xs ${accent} tracking-widest`}>PAPER {num}</div>
                  <div className="text-white font-bold text-lg">{title}</div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-4 italic">"{question}"</p>

              <div className="space-y-3 flex-1 text-xs">
                {[
                  ["Level", `${level} — ${levelDesc}`],
                  ["Input", input],
                  ["Features", features],
                  ["Classifier", classifier],
                  ["XAI", xai],
                  ["Output", output],
                  ["Best Acc.", bestAcc],
                  ["Status", status],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-slate-600 shrink-0 w-16">{k}</span>
                    <span className="text-slate-300 leading-relaxed">{v}</span>
                  </div>
                ))}
              </div>

              <Link to={animateTo} className={`mt-5 rounded-full border ${border} px-4 py-2 text-xs font-semibold ${accent} text-center hover:bg-white/5 transition-colors`}>
                Animated Explainer ✦
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. DIFFERENCE TABLE ────────────────────────────────────── */}
      <div ref={diffRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${diffInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Key Differences</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">How They Differ</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-5 py-4 text-slate-400 font-semibold">Dimension</th>
                <th className="text-left px-5 py-4 text-cyan-300 font-semibold">Paper 1 (IRAF-XADL)</th>
                <th className="text-left px-5 py-4 text-violet-300 font-semibold">Paper 2 (ECRVR-MVEL)</th>
                <th className="text-left px-5 py-4 text-teal-300 font-semibold">Paper 3 (EESQA-DELMOA)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Scope", "Identifier (1 name)", "Code snippet (1 function)", "Developer (person)"],
                ["Input", "Single token string", "Full source code block", "Developer metrics"],
                ["Handcrafted Features", "Yes — 10 parameters", "No — learned by CodeBERT", "No — selected by BAHB"],
                ["Embedding", "CodeBERT (768-dim)", "CodeBERT (positional)", "Min-max normalized metrics"],
                ["Classifier", "SA-BiLSTM (single)", "GCN+DBN+BiTCN (ensemble)", "SSNN (spiking)"],
                ["XAI Method", "SHAP (global)", "LIME (local)", "AMBOA (optimization-based)"],
                ["Optimizer", "AdamW", "Nadam", "AMBOA"],
                ["Output Classes", "2 (binary)", "3 (High/Med/Low)", "6 (experience levels)"],
                ["Dataset", "Code Snippets (Kaggle)", "Code Snippets (Kaggle)", "Developer dataset (Zenodo)"],
                ["Best Accuracy", "98.42% (C++)", "98.38% (C++)", "98.74% (overall)"],
              ].map(([dim, p1, p2, p3], i) => (
                <tr key={dim} className={`border-b border-white/5 transition-all duration-500 ${diffInView ? "opacity-100" : "opacity-0"}`}
                  style={{ transitionDelay: `${i * 60}ms` }}>
                  <td className="px-5 py-3 text-slate-400 font-medium">{dim}</td>
                  <td className="px-5 py-3 text-slate-300">{p1}</td>
                  <td className="px-5 py-3 text-slate-300">{p2}</td>
                  <td className="px-5 py-3 text-slate-300">{p3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. SHARED FOUNDATIONS ──────────────────────────────────── */}
      <Section>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">What They Share</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Common Foundations</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Despite operating at different levels, the three papers are united by shared design principles.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sharedFoundations.map(({ label, desc, papers: ps, color }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-white font-semibold text-sm">{label}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-3">{desc}</p>
              <div className="flex gap-2">
                {ps.map(p => (
                  <span key={p} className={`rounded-full px-2 py-0.5 text-xs font-mono ${p === 1 ? "bg-cyan-500/20 text-cyan-300" : p === 2 ? "bg-violet-500/20 text-violet-300" : "bg-teal-500/20 text-teal-300"}`}>
                    P{p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 6. CROSS-PAPER VALIDATION ──────────────────────────────── */}
      <div ref={valRef}>
        <div className={`text-center mb-10 transition-all duration-700 ${valInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">Cross-Paper Validation</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Paper 2 Validates Paper 1</h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            Paper 1 formally defines 10 readability parameters. Paper 2 uses a completely different approach (LIME on CodeBERT vectors) —
            yet independently identifies the <em>same</em> parameters as the most important features.
            This is a powerful cross-paper validation.
          </p>
        </div>
        <div className="space-y-4">
          {validationLinks.map(({ from, highlight, to, color, arrow }, i) => (
            <div key={highlight}
              className={`rounded-xl border ${color} p-5 flex gap-5 items-start transition-all duration-600`}
              style={{ transitionDelay: `${i * 120}ms`, opacity: valInView ? 1 : 0, transform: valInView ? "translateX(0)" : "translateX(-30px)" }}>
              <div className={`shrink-0 font-mono text-xs ${arrow} mt-1`}>P1→P2</div>
              <div>
                <span className="text-slate-400 text-sm">{from} </span>
                <strong className="text-white">{highlight}</strong>
                <span className={`${arrow} mx-2`}>→</span>
                <span className="text-slate-300 text-sm">{to}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. THREE PILLARS ───────────────────────────────────────── */}
      <div ref={pillarsRef}>
        <div className={`text-center mb-12 transition-all duration-700 ${pillarsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Thesis Framework</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">Measure · Validate · Guide</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">Each paper serves a distinct role in the thesis argument.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {thesis3Pillars.map(({ pillar, paper, desc, color, icon }, i) => (
            <div key={pillar}
              className={`rounded-2xl border ${color} p-8 text-center transition-all duration-700`}
              style={{ transitionDelay: `${i * 150}ms`, opacity: pillarsInView ? 1 : 0, transform: pillarsInView ? "scale(1)" : "scale(0.85)" }}>
              <div className="text-5xl mb-4">{icon}</div>
              <div className="font-display text-2xl font-bold text-white mb-2">{pillar}</div>
              <div className="text-xs font-mono tracking-widest text-slate-500 mb-4">{paper}</div>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Combined impact */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="text-xs text-slate-500 font-mono tracking-widest mb-8 text-center">COMBINED THESIS IMPACT</div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: "3", label: "Research papers", color: "text-white" },
              { val: "≥98%", label: "Accuracy across all", color: "text-emerald-400" },
              { val: "3", label: "Abstraction levels", color: "text-cyan-400" },
              { val: "XAI", label: "in every paper", color: "text-violet-400" },
            ].map(({ val, label, color }) => (
              <div key={label}>
                <div className={`font-display text-4xl font-bold ${color} mb-2`}>{val}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 8. CLOSING ─────────────────────────────────────────────── */}
      <Section>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/8 via-violet-500/5 to-teal-500/8 p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-6">The Bigger Goal</h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            AI agents now write the code. But<strong className="text-white"> who verifies the quality?</strong>
          </p>
          <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto mb-10">
            This thesis builds the automated verification layer — measuring readability at the level of a{" "}
            <strong className="text-cyan-300">single identifier name</strong>, a{" "}
            <strong className="text-violet-300">code block</strong>, and the{" "}
            <strong className="text-teal-300">developer or agent</strong> that produced it.
            Software quality is not a subjective judgment. It is <strong className="text-white">measurable,
            explainable, and predictable</strong> — regardless of whether a human or an AI wrote the code.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/papers/iraf-xadl/animated" className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-6 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors">
              Paper 1 Explainer
            </Link>
            <Link to="/papers/paper-2/animated" className="rounded-full bg-violet-500/20 border border-violet-500/40 px-6 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors">
              Paper 2 Explainer
            </Link>
            <Link to="/papers/paper-3/animated" className="rounded-full bg-teal-500/20 border border-teal-500/40 px-6 py-3 text-sm font-semibold text-teal-300 hover:bg-teal-500/30 transition-colors">
              Paper 3 Explainer
            </Link>
            <Link to="/thesis-integration" className="rounded-full bg-white/5 border border-white/15 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Thesis Integration →
            </Link>
          </div>
        </div>
      </Section>

    </div>
  );
}
