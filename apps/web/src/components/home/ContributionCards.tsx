import { contributionMetrics } from "../../data/metrics";
import { GlassCard } from "../common/GlassCard";
import { SectionHeader } from "../common/SectionHeader";

const contributionCards = [
  {
    title: "AI writes the code — but who checks the quality?",
    body: "GitHub Copilot, Cursor, and Claude generate millions of lines daily. But AI-generated code still needs to be readable, maintainable, and understandable by humans. This thesis builds the automated tools to verify that quality — at the identifier level, the function level, and the developer level.",
  },
  {
    title: "Explainability is not optional",
    body: "A model that says 'this code is unreadable' is not enough. Every prediction in this thesis is explained — SHAP traces which identifier features drove the result, LIME shows what made a snippet score Low, and AMBOA reveals which developer signals mattered most.",
  },
  {
    title: "From code quality to human expertise",
    body: "Paper 3 extends the thesis to classify the developer behind the code — including detecting BOT and automated accounts. As AI agents contribute to codebases, distinguishing human expertise from automated generation becomes a critical software engineering challenge.",
  },
];

export function ContributionCards() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeader
        eyebrow="Key Contributions"
        title="Software quality in the age of AI-generated code"
        description="As AI agents write more software, the need to automatically measure, explain, and verify code quality becomes more urgent — not less. This thesis builds that verification layer."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-6">
          {contributionCards.map((card) => (
            <GlassCard key={card.title}>
              <h3 className="font-display text-2xl text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
            </GlassCard>
          ))}
        </div>
        <div className="grid gap-6">
          {contributionMetrics.map((metric) => (
            <GlassCard key={metric.label}>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
              <p className="mt-4 font-display text-3xl text-white">{metric.value}</p>
              <p className="mt-3 text-sm text-slate-300">{metric.detail}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
