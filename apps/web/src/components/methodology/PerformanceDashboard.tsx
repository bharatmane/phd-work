import { performanceByLanguage } from "../../data/methodology";
import { GlassCard } from "../common/GlassCard";

export function PerformanceDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {performanceByLanguage.map((row) => (
        <GlassCard key={row.language}>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">{row.language}</p>
          <h3 className="mt-3 font-display text-3xl text-white">{row.accuracy} accuracy</h3>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-slate-300">
            <div>
              <p className="text-slate-400">Precision</p>
              <p className="mt-1 text-white">{row.precision}</p>
            </div>
            <div>
              <p className="text-slate-400">Recall</p>
              <p className="mt-1 text-white">{row.recall}</p>
            </div>
            <div>
              <p className="text-slate-400">F1-score</p>
              <p className="mt-1 text-white">{row.f1}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
