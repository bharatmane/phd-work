import { useState } from "react";
import { p2Samples, type P2Sample } from "../data/p2Samples";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const FEATURE_LABELS: Record<keyof P2Sample["features"], string> = {
  num_of_lines_norm: "Lines",
  code_length_norm: "Code length",
  cyclomatic_complexity_norm: "Cyclomatic complexity",
  indents_norm: "Indentation depth",
  loop_count_norm: "Loop count",
  line_length_norm: "Line length",
  identifiers_norm: "Identifier count",
};

const LEVEL_COLOR: Record<"High" | "Medium" | "Low", { text: string; bg: string; border: string }> = {
  High: { text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-400/30" },
  Medium: { text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-400/30" },
  Low: { text: "text-rose-300", bg: "bg-rose-500/15", border: "border-rose-400/30" },
};

type SnippetPredictResponse = {
  label: "High" | "Medium" | "Low";
  confidence: number;
  probabilities: Record<string, number>;
  branch_probabilities: Record<string, Record<string, number>>;
  ensemble_weights: Record<string, number>;
  structural: Record<string, number>;
  methodology_note: string;
};

const DEFAULT_CODE = `class Solution:
    def maxDistance(self, colors):
        n = len(colors)
        for i in range(n - 1, 0, -1):
            for j in range(n - i):
                if colors[j] != colors[j + i]:
                    return i`;

const BREVITY_BIAS_PAIR = [
  {
    label: "Trivial one-liner — expect High",
    code: `class Solution:
    def isAnagram(self, s, t):
        return Counter(s) == Counter(t)`,
  },
  {
    label: "Real, well-written, longer — watch it score Low",
    code: `import time
from functools import wraps

def retry(retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """Decorator to retry a function with exponential backoff on failure."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            for attempt in range(1, retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == retries:
                        raise e
                    print(f"Attempt {attempt} failed: {e}. Retrying...")
                    time.sleep(current_delay)
                    current_delay *= backoff
        return wrapper
    return decorator`,
  },
];

function ProbBar({ label, value }: { label: string; value: number }) {
  const c = LEVEL_COLOR[label as "High" | "Medium" | "Low"];
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className={`font-mono ${c.text}`}>{label}</span>
        <span className="text-slate-500">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5">
        <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function TryItPanel() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnippetPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const resp = await fetch(`${API}/predict-snippet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      setResult(await resp.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach API. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const labelColor = result ? LEVEL_COLOR[result.label] : LEVEL_COLOR.Medium;

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
      <p className="text-xs font-mono tracking-widest uppercase mb-4 text-violet-300">Try your own Python snippet — live</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {BREVITY_BIAS_PAIR.map((sample) => (
          <button
            key={sample.label}
            onClick={() => { setCode(sample.code); setResult(null); setError(null); }}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <textarea
        className="w-full rounded-xl bg-black/40 text-slate-300 font-mono text-sm p-4 resize-none outline-none min-h-40 border border-white/10 focus:border-violet-400/50"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleAnalyze}
          disabled={loading || !code.trim()}
          className="rounded-full bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold px-6 py-2.5 transition-all text-sm"
        >
          {loading ? "Scoring…" : "Analyse with ECRVR-MVEL"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-300 text-sm font-mono">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className={`rounded-xl border p-5 ${labelColor.border} ${labelColor.bg}`}>
              <p className="text-xs font-mono tracking-widest uppercase mb-2 text-slate-400">Ensemble verdict</p>
              <p className={`font-display text-3xl font-bold ${labelColor.text}`}>{result.label}</p>
              <p className="text-sm mt-1 text-slate-400">{(result.confidence * 100).toFixed(1)}% confidence</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-mono tracking-widest uppercase mb-3 text-slate-400">Probability breakdown</p>
              {(["High", "Medium", "Low"] as const).map((l) => (
                <ProbBar key={l} label={l} value={result.probabilities[l] ?? 0} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-mono tracking-widest uppercase mb-3 text-slate-400">
              Per-branch votes (weighted {(result.ensemble_weights.gcn * 100).toFixed(0)}% GCN /{" "}
              {(result.ensemble_weights.dbn * 100).toFixed(0)}% DBN / {(result.ensemble_weights.bitcn * 100).toFixed(0)}% Bi-TCN)
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {(["gcn", "dbn", "bitcn"] as const).map((branch) => (
                <div key={branch}>
                  <p className="text-xs text-slate-500 uppercase mb-2">{branch}</p>
                  {(["High", "Medium", "Low"] as const).map((l) => (
                    <ProbBar key={l} label={l} value={result.branch_probabilities[branch]?.[l] ?? 0} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-mono tracking-widest uppercase mb-3 text-slate-400">Structural features (raw)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {Object.entries(result.structural).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 py-1">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-white font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-6 italic">{result.methodology_note}</p>
        </div>
      )}
    </div>
  );
}

function SampleCard({ sample }: { sample: P2Sample }) {
  const c = LEVEL_COLOR[sample.level];
  return (
    <div className={`rounded-2xl border ${c.border} bg-white/3 p-5`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
          Ground truth: {sample.level}
        </span>
        <span className="text-xs font-mono text-slate-500">{sample.name}</span>
      </div>
      <pre className="rounded-xl bg-black/40 p-3 text-xs text-slate-300 font-mono overflow-x-auto">
        {sample.code}
      </pre>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
        {Object.entries(sample.features).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{FEATURE_LABELS[key as keyof P2Sample["features"]]}</span>
              <span className="text-slate-500 font-mono">{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${value * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Paper2SamplesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 space-y-10">
      <div className="text-center">
        <span className="inline-block rounded-full border border-violet-500/40 bg-violet-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-violet-300 uppercase mb-5">
          Paper 2 — Live Model + Methodology Walkthrough
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          ECRVR-MVEL
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 mt-2">
            Snippet-level readability classification
          </span>
        </h1>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm leading-7 text-slate-300">
        <p className="text-xs font-mono tracking-widest uppercase mb-2 text-amber-400">What this is — and isn't</p>
        <p>
          The "Try it" panel below calls a real, freshly-trained GCN+DBN+BiTCN weighted-voting ensemble (Python only,
          v1) — but it is a <strong className="text-white">simplified reimplementation</strong> of ECRVR-MVEL, not the
          exact published model, and its own held-out test accuracy is reported directly in the result, not the
          paper's published <strong className="text-white">98.15% (Python) / 98.38% (C++)</strong>. One documented
          simplification: the DBN branch is trained end-to-end by backprop rather than CD-pretrained RBM layers. No
          LIME explanations yet — instead you get real per-branch probabilities and the learned ensemble weights. The
          gallery below remains real dataset samples with ground-truth labels, for comparison.
        </p>
      </div>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm leading-7 text-slate-300">
        <p className="text-xs font-mono tracking-widest uppercase mb-2 text-rose-400">A "Low" verdict isn't "bad code"</p>
        <p>
          The training data (short LeetCode-style solutions) strongly equates <strong className="text-white">brevity</strong> with
          readability — one-liners get labeled High almost regardless of naming quality, while longer, well-structured code
          (clear docstrings, type hints, decorators, retry/backoff logic, etc.) skews Medium or Low purely on structural
          complexity, even when a human would call it clean code. The same bias is documented for Paper 1's identifier
          model in <code className="text-cyan-300">apps/api/DEMO_SAMPLES.md</code>. Try the two contrasting samples below
          the live panel to see it directly: a trivial one-liner scores High, a longer well-written decorator scores Low.
        </p>
      </div>

      <TryItPanel />

      {(["High", "Medium", "Low"] as const).map((level) => (
        <div key={level}>
          <h2 className={`font-display text-xl mb-4 ${LEVEL_COLOR[level].text}`}>{level} readability — dataset samples</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {p2Samples.filter((s) => s.level === level).map((s) => (
              <SampleCard key={s.name} sample={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
