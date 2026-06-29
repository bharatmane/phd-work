import { p3Samples, type P3Sample } from "../data/p3Samples";

const JOB_COLOR: Record<P3Sample["job"], { text: string; bg: string; border: string }> = {
  SSE: { text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-400/30" },
  SE: { text: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-400/30" },
  SA: { text: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-400/30" },
  NSE: { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-400/30" },
  BOT: { text: "text-rose-300", bg: "bg-rose-500/15", border: "border-rose-400/30" },
  UNKNOW: { text: "text-slate-300", bg: "bg-slate-500/15", border: "border-slate-400/30" },
};

const METRICS: { key: keyof P3Sample; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "NoC", label: "Commits" },
  { key: "CE", label: "Commit edits" },
  { key: "AddLOC", label: "Lines added" },
  { key: "DelLOC", label: "Lines deleted" },
  { key: "NoMGM", label: "Merge commits" },
  { key: "DiP", label: "Days in project" },
  { key: "ICT", label: "Inter-commit time (h)" },
];

function DeveloperCard({ sample }: { sample: P3Sample }) {
  const c = JOB_COLOR[sample.job];
  return (
    <div className={`rounded-2xl border ${c.border} bg-white/3 p-5`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
          Ground truth: {sample.jobLabel}
        </span>
        <span className="text-xs font-mono text-slate-500">{sample.project}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {METRICS.map((m) => (
          <div key={m.key} className="flex justify-between border-b border-white/5 py-1">
            <span className="text-slate-400">{m.label}</span>
            <span className="text-white font-mono">
              {typeof sample[m.key] === "number" ? (sample[m.key] as number).toLocaleString() : sample[m.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Paper3SamplesPage() {
  const classes = ["SSE", "SE", "SA", "NSE", "BOT", "UNKNOW"] as const;
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 space-y-10">
      <div className="text-center">
        <span className="inline-block rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-teal-300 uppercase mb-5">
          Paper 3 — Methodology Walkthrough
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          EESQA-DELMOA
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 mt-2">
            Developer experience classification
          </span>
        </h1>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm leading-7 text-slate-300">
        <p className="text-xs font-mono tracking-widest uppercase mb-2 text-amber-400">What this is — and isn't</p>
        <p>
          The twelve developer profiles below are real, anonymized records from{" "}
          <a
            href="https://zenodo.org/records/7011334"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            Perez, Urtado &amp; Vauttier (2023)
          </a>{" "}
          — the actual dataset EESQA-DELMOA was trained and evaluated on (703 profiles, 6 classes). The class shown
          is the dataset's <strong className="text-white">ground-truth label</strong>, not a live model prediction:
          the trained BAHB+SSNN+AMBOA classifier isn't deployed in this portfolio. For actual model performance, see
          the published results: <strong className="text-white">98.74% accuracy</strong> in{" "}
          <strong className="text-white">8.27 seconds</strong> on held-out test data.
        </p>
      </div>

      {classes.map((cls) => (
        <div key={cls}>
          <h2 className={`font-display text-xl mb-4 ${JOB_COLOR[cls].text}`}>
            {p3Samples.find((s) => s.job === cls)?.jobLabel}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {p3Samples.filter((s) => s.job === cls).map((s, i) => (
              <DeveloperCard key={`${cls}-${i}`} sample={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
