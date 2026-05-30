import { GlassCard } from "../common/GlassCard";

export function CodeBertVisualizer() {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Embedding Layer</p>
      <h3 className="mt-3 font-display text-2xl text-white">CodeBERT semantic projection</h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {["customer", "invoice", "parser", "score"].map((token, index) => (
          <div key={token} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white">{token}</p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="h-8 flex-1 rounded-full bg-cyan-300/20"
                  style={{ opacity: 0.4 + ((bar + index) % 5) * 0.12 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300">
        The embedding stage captures code-aware semantic relationships before sequential reasoning begins.
      </p>
    </GlassCard>
  );
}
