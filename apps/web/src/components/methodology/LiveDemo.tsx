import { useState } from "react";
import type { PredictResponse } from "../../types/irafXadl";
import { GlassCard } from "../common/GlassCard";
import { Badge } from "../common/Badge";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const SAMPLES = [
  {
    label: "✅ High — Anagram",
    tag: "High",
    code: `class Solution:
    def isAnagram(self, first_string, second_string):
        return sorted(first_string) == sorted(second_string)`,
  },
  {
    label: "✅ High — Max Value",
    tag: "High",
    code: `def find_maximum_value(number_list):
    maximum_value = number_list[0]
    for current_number in number_list:
        if current_number > maximum_value:
            maximum_value = current_number
    return maximum_value`,
  },
  {
    label: "🟡 Medium — Word Count",
    tag: "Medium",
    code: `def count_word_frequency(text):
    word_counts = {}
    words = text.lower().split()
    for w in words:
        cleaned = w.strip(".,!?")
        if cleaned in word_counts:
            word_counts[cleaned] += 1
        else:
            word_counts[cleaned] = 1
    return word_counts`,
  },
  {
    label: "🟡 Medium — Dijkstra",
    tag: "Medium",
    code: `class Graph:
    def __init__(self, num_vertices):
        self.V = num_vertices
        self.adj = [[] for _ in range(self.V)]

    def dijkstra(self, src):
        import heapq
        dist = [float('inf')] * self.V
        dist[src] = 0
        pq = [(0, src)]
        visited = [False] * self.V
        while pq:
            d, u = heapq.heappop(pq)
            if visited[u]:
                continue
            visited[u] = True
            for v, w in self.adj[u]:
                if not visited[v] and dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(pq, (dist[v], v))
        return dist`,
  },
  {
    label: "❌ Low — Cryptic names",
    tag: "Low",
    code: `def f(a, b, c):
    x = 0
    for i in range(len(a)):
        for j in range(len(b)):
            if a[i] > b[j] and c != 0:
                x += a[i] * b[j] // c
            elif a[i] == b[j]:
                x -= 1
    return x`,
  },
  {
    label: "❌ Low — Complex paths",
    tag: "Low",
    code: `class Solution:
    def distanceLimitedPathsExist(self, n, A, B):
        p = list(range(n))
        def find(x):
            while p[x] != x:
                p[x] = p[p[x]]
                x = p[x]
            return x
        def union(x, y):
            p[find(x)] = find(y)
        A.sort(key=lambda x: x[2])
        B = sorted(enumerate(B), key=lambda x: x[1][2])
        res = [False] * len(B)
        i = 0
        for j, (idx, (u, v, w)) in enumerate(B):
            while i < len(A) and A[i][2] < w:
                union(A[i][0], A[i][1])
                i += 1
            res[idx] = find(u) == find(v)
        return res`,
  },
];

const VERDICT_COLORS = {
  High:   { bg: "bg-emerald-500/20", border: "border-emerald-400/40", text: "text-emerald-300" },
  Medium: { bg: "bg-amber-500/20",   border: "border-amber-400/40",   text: "text-amber-300"   },
  Low:    { bg: "bg-rose-500/20",    border: "border-rose-400/40",    text: "text-rose-300"     },
};

const INFLUENCE_COLORS = {
  High:   "bg-emerald-500/20 text-emerald-300",
  Medium: "bg-amber-500/20   text-amber-300",
  Low:    "bg-rose-500/20    text-rose-300",
};

function FactorBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-xs text-slate-400">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs text-slate-400">{pct}%</span>
    </div>
  );
}

export function LiveDemo() {
  const prefill = sessionStorage.getItem("demo_prefill") ?? SAMPLES[0].code;
  if (sessionStorage.getItem("demo_prefill")) sessionStorage.removeItem("demo_prefill");
  const [code, setCode]       = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<PredictResponse | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function analyse() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "python" }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const vc = result ? VERDICT_COLORS[result.label] : null;

  // Structural complexity score (0–100, higher = more complex)
  const structPct = result
    ? Math.min(100, Math.round(
        (result.structural.num_of_lines / 69) * 30 +
        (result.structural.identifiers   / 69) * 35 +
        (result.structural.loop_count    / 26) * 20 +
        (result.structural.cyclomatic_complexity / 15) * 15
      ))
    : 0;
  const namingPct = result ? Math.round(result.identifier_quality_score * 100) : 0;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-white">Live Readability Demo</h3>
        <Badge>Try it</Badge>
      </div>

      {/* Sample buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => { setCode(s.code); setResult(null); }}
            className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5
                       text-slate-300 hover:bg-white/10 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Code input */}
      <textarea
        value={code}
        onChange={(e) => { setCode(e.target.value); setResult(null); }}
        rows={8}
        className="w-full rounded-xl bg-black/40 border border-white/10 p-4
                   font-mono text-sm text-slate-200 resize-y focus:outline-none
                   focus:border-cyan-400/50 transition-colors"
        placeholder="Paste any Python snippet…"
        spellCheck={false}
      />

      <button
        onClick={analyse}
        disabled={loading || !code.trim()}
        className="mt-3 w-full rounded-xl py-3 font-semibold text-sm tracking-wide
                   bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10
                   disabled:text-slate-500 text-slate-900 transition-colors"
      >
        {loading ? "Analysing…" : "Analyse Readability"}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20
                      rounded-xl px-4 py-3">
          {error} — make sure the API server is running.
        </p>
      )}

      {/* Result */}
      {result && vc && (
        <div className="mt-6 space-y-5">

          {/* Verdict */}
          <div className={`rounded-2xl border p-4 ${vc.bg} ${vc.border}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-2xl font-bold ${vc.text}`}>{result.label} Readability</span>
              <span className="text-sm text-slate-400">
                {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>

            {/* Factor bars */}
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">What drove this verdict?</p>
              <FactorBar
                label="Identifier Naming"
                pct={namingPct}
                color={namingPct >= 75 ? "bg-emerald-400" : namingPct >= 50 ? "bg-amber-400" : "bg-rose-400"}
              />
              <FactorBar
                label="Structural Complexity"
                pct={structPct}
                color={structPct >= 60 ? "bg-rose-400" : structPct >= 35 ? "bg-amber-400" : "bg-emerald-400"}
              />
            </div>

            {/* Contextual note */}
            {namingPct >= 75 && result.label === "Low" && (
              <p className="mt-3 text-xs text-slate-400 italic">
                Identifier naming is excellent — the Low verdict is driven by structural complexity
                (lines, loops, identifier count), not naming quality.
              </p>
            )}
          </div>

          {/* Explanation */}
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
          </div>

          {/* Code metrics */}
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Code Metrics</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                ["Lines",        result.structural.num_of_lines],
                ["Characters",   result.structural.code_length],
                ["Complexity",   result.structural.cyclomatic_complexity],
                ["Loops",        result.structural.loop_count],
                ["Identifiers",  result.structural.identifiers],
                ["Avg Line Len", result.structural.line_length.toFixed(1)],
              ].map(([lbl, val]) => (
                <div key={lbl as string}
                     className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <div className="text-lg font-bold text-cyan-300">{val}</div>
                  <div className="text-xs text-slate-500 mt-1">{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Identifier table */}
          {result.identifiers.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
                Identifier Breakdown
              </p>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      {["Identifier","Kind","Tokens","Influence","Attn","MC","NC","OL","PR","CLS"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-slate-400
                                               whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.identifiers.map((id, i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2 font-mono font-semibold text-white">{id.name}</td>
                        <td className="px-3 py-2 text-slate-400">{id.kind}</td>
                        <td className="px-3 py-2 text-slate-500">{id.tokens.join(", ")}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                                          ${INFLUENCE_COLORS[id.influence]}`}>
                            {id.influence}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {Math.round(id.attention_weight * 100)}%
                        </td>
                        {(["MC","NC","OL","PR","CLS"] as const).map(f => (
                          <td key={f} className={`px-3 py-2 font-mono
                            ${id.features[f] >= 0.75 ? "text-emerald-400"
                            : id.features[f] >= 0.5  ? "text-amber-400"
                            : "text-rose-400"}`}>
                            {id.features[f].toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                MC=Meaningful Clarity · NC=Naming Conformance · OL=Optimal Length ·
                PR=Pronounceability · CLS=Cognitive Load Score
              </p>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
