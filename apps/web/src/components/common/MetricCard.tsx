import type { Metric } from "../../types";
import { GlassCard } from "./GlassCard";

type MetricCardProps = {
  metric: Metric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <GlassCard>
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
      <p className="mt-4 font-display text-4xl text-white">{metric.value}</p>
      <p className="mt-3 text-sm text-slate-300">{metric.detail}</p>
    </GlassCard>
  );
}
