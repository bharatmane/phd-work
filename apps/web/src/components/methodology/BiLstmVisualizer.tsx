import { GlassCard } from "../common/GlassCard";

const cells = ["Forward pass", "Attention focus", "Backward pass", "Softmax class"];

export function BiLstmVisualizer() {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">Classifier</p>
      <h3 className="mt-3 font-display text-2xl text-white">Self-Attention BiLSTM reasoning path</h3>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{cell}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-300">
        Bidirectional sequence modeling preserves left and right context while attention highlights the most influential signals.
      </p>
    </GlassCard>
  );
}
