import { Link } from "react-router-dom";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";

const blocks = [
  {
    eyebrow: "The Central Problem",
    title: "AI writes the code. Humans still have to trust it.",
    body: "AI coding agents now generate the majority of boilerplate, utility functions, and even business logic. But AI-generated code is not automatically readable, maintainable, or comprehensible. This thesis argues that automated, explainable quality assessment is the essential verification layer for the AI coding era — and builds that layer across three levels of abstraction.",
    color: "border-white/10",
  },
  {
    eyebrow: "Paper 1 · Published · ETASR 2026",
    title: "IRAF-XADL — Identifier Level",
    body: "Asks: is this variable or function name readable, and why? Proposes 10 cognitive readability parameters + CodeBERT embeddings + SA-BiLSTM classification + SHAP explainability. Achieves 98.42% accuracy on C++ and 98.13% on Python. Directly applicable as a quality gate for AI-generated identifier names.",
    color: "border-cyan-500/20",
  },
  {
    eyebrow: "Paper 2 · Accepted · ETASR (In Proof)",
    title: "ECRVR-MVEL — Code Block Level",
    body: "Asks: is this entire function readable — High, Medium, or Low? Uses CodeBERT + an ensemble of GCN, DBN, and BiTCN with weighted majority voting and LIME explanations. Achieves 98.38% (C++) and 98.15% (Python). Validates Paper 1's parameters independently — LIME confirms MC and PRED as dominant readability signals.",
    color: "border-violet-500/20",
  },
  {
    eyebrow: "Paper 3 · Submitted · Target: ADRIS 2026",
    title: "EESQA-DELMOA — Developer Level",
    body: "Asks: what experience level is the developer who wrote this, and can we detect automated (BOT) contributions? Uses BAHB feature selection + SSNN classification + AMBOA optimization across 6 classes including BOT. Achieves 98.74% accuracy in 8.27 seconds. As AI agents contribute to codebases, distinguishing human expertise from automated authorship becomes critical.",
    color: "border-teal-500/20",
  },
  {
    eyebrow: "Cross-Paper Validation",
    title: "Paper 2 independently confirms Paper 1",
    body: "Paper 1 formally defines 10 readability parameters including MC (Morphological Complexity) and PRED (Predictability). Paper 2 uses a completely different method — LIME on CodeBERT vectors — yet independently identifies these same parameters as the strongest predictors. This cross-paper validation strengthens both contributions and demonstrates that the readability signals are real, not artefacts of methodology.",
    color: "border-amber-500/20",
  },
  {
    eyebrow: "Combined Thesis Contribution",
    title: "A complete quality stack for the AI coding era",
    body: "Together the three papers provide automated, explainable quality assessment at every level: the name (Paper 1), the function (Paper 2), and the author — human or AI (Paper 3). The thesis demonstrates that software quality is not a subjective judgment but a measurable, explainable, and predictable property regardless of who — or what — wrote the code.",
    color: "border-white/10",
  },
];

const pillars = [
  {
    label: "Measure",
    paper: "Paper 1",
    desc: "Define and quantify identifier readability with 10 cognitive parameters and explainable ML",
    color: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
    to: "/papers/iraf-xadl/animated",
  },
  {
    label: "Validate",
    paper: "Paper 2",
    desc: "Scale to code-block level and independently validate readability signals through ensemble XAI",
    color: "border-violet-500/30 bg-violet-500/5 text-violet-300",
    to: "/papers/paper-2/animated",
  },
  {
    label: "Guide",
    paper: "Paper 3",
    desc: "Extend to developer classification and BOT detection for intelligent project allocation",
    color: "border-teal-500/30 bg-teal-500/5 text-teal-300",
    to: "/papers/paper-3/animated",
  },
];

export function ThesisIntegration() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Thesis Integration"
        title="Three papers. Three levels. One quality stack."
        description="As AI agents write more code, automated readability assessment becomes the essential verification layer. This thesis builds that layer — from identifier names to code blocks to developer expertise."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {blocks.map((block) => (
          <GlassCard key={block.title} className={`border ${block.color}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">{block.eyebrow}</p>
            <h3 className="font-display text-xl text-white mb-3">{block.title}</h3>
            <p className="text-sm leading-7 text-slate-300">{block.body}</p>
          </GlassCard>
        ))}
      </div>

      {/* Pillar diagram */}
      <div className="mt-12">
        <GlassCard>
          <h3 className="font-display text-2xl text-white mb-2">Thesis framework: Measure · Validate · Guide</h3>
          <p className="text-slate-400 text-sm mb-8">Each paper serves a distinct role in the unified argument — and each is accessible as an animated explainer.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map(({ label, paper, desc, color, to }) => (
              <div key={label} className={`rounded-2xl border ${color} p-6 text-center flex flex-col gap-4`}>
                <div className="font-display text-3xl font-bold text-white">{label}</div>
                <div className="text-xs font-mono tracking-widest text-slate-500">{paper}</div>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{desc}</p>
                <Link to={to} className={`rounded-full border ${color} px-4 py-2 text-xs font-semibold hover:bg-white/5 transition-colors`}>
                  Animated Explainer ✦
                </Link>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI era statement */}
      <div className="mt-8">
        <GlassCard className="border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">Why this thesis matters now</p>
          <h3 className="font-display text-xl text-white mb-3">The AI coding era makes this more urgent, not less</h3>
          <p className="text-sm leading-7 text-slate-300">
            GitHub Copilot, Cursor, Claude Code, and similar agents now generate substantial portions of production software.
            AI-generated code passes compilation and tests — but it is not automatically readable or maintainable.
            The tools built in this thesis provide the automated quality verification layer that the AI coding era demands:
            checking identifier names (Paper 1), function-level readability (Paper 2), and distinguishing human
            expertise from automated authorship (Paper 3's BOT class).
            <strong className="text-white"> Software quality is measurable. This thesis proves it.</strong>
          </p>
          <Link to="/thesis-story" className="mt-5 inline-block rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors">
            See the full thesis story →
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
