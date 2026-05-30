import { Link } from "react-router-dom";
import { papers } from "../../data/papers";
import { GlassCard } from "../common/GlassCard";
import { SectionHeader } from "../common/SectionHeader";

export function ResearchJourney() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <SectionHeader
        eyebrow="Three-Paper Thesis Journey"
        title="A connected research narrative rather than isolated artifacts"
        description="The thesis grows from theoretical framing, to explainable modeling, to intervention-ready guidance for naming quality and program comprehension."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {papers.map((paper, index) => (
          <GlassCard key={paper.id} className="flex h-full flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Paper {index + 1}</p>
              <h3 className="mt-3 font-display text-2xl text-white">{paper.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{paper.keyContribution}</p>
            </div>
            <Link className="mt-8 text-sm font-semibold text-cyan-200" to={`/papers/${paper.id}`}>
              View details
            </Link>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
