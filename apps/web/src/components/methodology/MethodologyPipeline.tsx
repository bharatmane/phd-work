import { methodologyStages } from "../../data/methodology";
import { GlassCard } from "../common/GlassCard";

export function MethodologyPipeline() {
  return (
    <div className="grid gap-5">
      {methodologyStages.map((stage, index) => (
        <div key={stage.step} className="relative pl-10">
          {index < methodologyStages.length - 1 ? (
            <div className="absolute left-4 top-12 h-full w-px bg-gradient-to-b from-cyan-300/70 to-white/0 animate-pulse-line" />
          ) : null}
          <div className="absolute left-0 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 text-xs font-semibold text-cyan-100">
            {stage.step}
          </div>
          <GlassCard>
            <h3 className="font-display text-2xl text-white">{stage.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{stage.detail}</p>
          </GlassCard>
        </div>
      ))}
    </div>
  );
}
