import { Link } from "react-router-dom";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { MethodologyPipeline } from "../components/methodology/MethodologyPipeline";
import { technicalConcepts } from "../data/methodology";

export function Methodology() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Methodology Overview"
        title="From research problem framing to explainable modeling"
        description="This page presents the end-to-end thesis methodology across the paper sequence, emphasizing why identifier readability matters and how each stage feeds the next."
        actions={
          <Link to="/methodology/iraf-xadl" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950">
            Open IRAF-XADL
          </Link>
        }
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <MethodologyPipeline />
        <div className="grid gap-6">
          <GlassCard>
            <h3 className="font-display text-2xl text-white">Research problem</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Source code identifiers shape how developers form mental models. Weak names slow comprehension, increase cognitive friction, and weaken software maintainability.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-2xl text-white">Why identifier readability matters</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Identifier names carry semantic and contextual meaning. Better readability improves navigation, comprehension, maintenance, and team communication.
            </p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-display text-2xl text-white">Technical focus</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {technicalConcepts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
