import { GlassCard } from "../common/GlassCard";

type PresentationModeProps = {
  summary: string;
};

export function PresentationMode({ summary }: PresentationModeProps) {
  return (
    <GlassCard className="border-cyan-300/20" >
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Presentation Mode</p>
      <p className="mt-3 text-base leading-7 text-slate-200">{summary}</p>
    </GlassCard>
  );
}
