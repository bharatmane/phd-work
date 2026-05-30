import { readabilityParameters } from "../../data/methodology";
import { GlassCard } from "../common/GlassCard";

export function ReadabilityFeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {readabilityParameters.map((parameter) => (
        <GlassCard key={parameter.code} className="h-full">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">{parameter.code}</p>
          <h3 className="mt-3 font-display text-xl text-white">{parameter.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{parameter.detail}</p>
        </GlassCard>
      ))}
    </div>
  );
}
