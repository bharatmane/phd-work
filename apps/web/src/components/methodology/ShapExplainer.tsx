import { GlassCard } from "../common/GlassCard";

const shapBars = [
  { label: "Meaningful Clarity", value: "0.92" },
  { label: "Domain Relevance", value: "0.81" },
  { label: "Optimal Length", value: "0.67" },
  { label: "Pronounceability", value: "0.58" },
];

export function ShapExplainer() {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Explainability</p>
      <h3 className="mt-3 font-display text-2xl text-white">SHAP contribution view</h3>
      <div className="mt-6 space-y-4">
        {shapBars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
              <span>{bar.label}</span>
              <span>{bar.value}</span>
            </div>
            <div className="h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-rose-300"
                style={{ width: `${Number(bar.value) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300">
        SHAP surfaces why a name is predicted as readable or unreadable, making the model defensible in academic and practical settings.
      </p>
    </GlassCard>
  );
}
