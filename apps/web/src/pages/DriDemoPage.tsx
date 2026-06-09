import { useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/* ── Example snippets from the paper ──────────────────────────────────── */
const EXAMPLES = [
  {
    id: "binary-search",
    label: "Binary Search (off-by-one)",
    tag: "High DRI",
    tagColor: "text-rose-400 border-rose-500/40 bg-rose-500/10",
    correct: false,
    correctLabel: "INCORRECT — IndexError on first probe",
    correctColor: "text-rose-300 bg-rose-500/10 border-rose-500/30",
    explanation: "right_boundary = len(sorted_list) should be len(sorted_list) - 1. All identifiers are highly readable English words, so the model will score this HIGH — but it crashes immediately.",
    code: `def binary_search(sorted_list: list, target: int) -> int:
    """Find index of target in sorted_list, return -1 if not found."""
    left_boundary = 0
    right_boundary = len(sorted_list)        # BUG: should be len - 1
    while left_boundary <= right_boundary:
        middle_index = (left_boundary + right_boundary) // 2
        if sorted_list[middle_index] == target:
            return middle_index
        elif sorted_list[middle_index] < target:
            left_boundary = middle_index + 1
        else:
            right_boundary = middle_index - 1
    return -1`,
    passRatio: 0.0,
  },
  {
    id: "median",
    label: "Median Calculator (wrong for even)",
    tag: "High DRI",
    tagColor: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    correct: false,
    correctLabel: "INCORRECT — returns wrong value for even-length input",
    correctColor: "text-orange-300 bg-orange-500/10 border-orange-500/30",
    explanation: "For even-length lists the median should be the average of the two middle elements. The function silently returns the upper-middle value. Beautiful names, wrong logic.",
    code: `def calculate_median(number_list: list[float]) -> float:
    """Return the median value from an unsorted list of numbers."""
    sorted_numbers = sorted(number_list)
    middle_position = len(sorted_numbers) // 2
    return sorted_numbers[middle_position]   # BUG: wrong for even-length`,
    passRatio: 0.26,
  },
  {
    id: "word-freq",
    label: "Word Frequency (hallucinated API)",
    tag: "Critical DRI",
    tagColor: "text-red-400 border-red-500/40 bg-red-500/10",
    correct: false,
    correctLabel: "INCORRECT — AttributeError: str has no method lower_and_strip()",
    correctColor: "text-red-300 bg-red-500/10 border-red-500/30",
    explanation: "lower_and_strip() and split_on_whitespace() do not exist in Python. The identifiers are among the most descriptive possible — text_content, normalized_text, word_tokens, frequency_mapping — making this a textbook deceptive readability case.",
    code: `def count_word_frequencies(text_content: str) -> dict[str, int]:
    """Count how many times each word appears in the provided text."""
    normalized_text = text_content.lower_and_strip()    # BUG: doesn't exist
    word_tokens = normalized_text.split_on_whitespace() # BUG: doesn't exist
    frequency_mapping = {}
    for individual_word in word_tokens:
        frequency_mapping[individual_word] = \\
            frequency_mapping.get(individual_word, 0) + 1
    return frequency_mapping`,
    passRatio: 0.0,
  },
  {
    id: "correct-example",
    label: "Max Value Finder (correct)",
    tag: "Safe (DRI = 0)",
    tagColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    correct: true,
    correctLabel: "CORRECT — passes all test cases",
    correctColor: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    explanation: "This is what safe AI-generated code looks like: high readability AND correct. DRI = 0 because pass_ratio = 1.0.",
    code: `def find_maximum_value(number_list: list[float]) -> float:
    """Return the largest value from a non-empty list of numbers."""
    maximum_value = number_list[0]
    for current_number in number_list:
        if current_number > maximum_value:
            maximum_value = current_number
    return maximum_value`,
    passRatio: 1.0,
  },
];

/* ── DRI Gauge ─────────────────────────────────────────────────────────── */
function DriGauge({ dri, revealed }: { dri: number; revealed: boolean }) {
  const tier =
    dri >= 0.6 ? { label: "CRITICAL", color: "#f87171", bg: "bg-red-500/15 border-red-500/40" }
    : dri >= 0.3 ? { label: "MODERATE", color: "#fb923c", bg: "bg-orange-500/15 border-orange-500/40" }
    : dri > 0   ? { label: "LOW",      color: "#fbbf24", bg: "bg-amber-500/15 border-amber-500/40" }
    :             { label: "SAFE",     color: "#34d399", bg: "bg-emerald-500/15 border-emerald-500/40" };

  const pct = Math.round(dri * 100);

  return (
    <div className={`rounded-2xl border p-6 ${tier.bg} transition-all duration-700`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">
          Deceptive Readability Index
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ color: tier.color, borderColor: tier.color + "66", backgroundColor: tier.color + "22" }}>
          {tier.label}
        </span>
      </div>
      {revealed ? (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono text-5xl font-bold" style={{ color: tier.color }}>
              {dri.toFixed(2)}
            </span>
            <span className="text-slate-500 text-sm">/ 1.00</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, backgroundColor: tier.color }}
            />
          </div>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            DRI = P(High readability) × (1 − pass_ratio)
          </p>
        </>
      ) : (
        <div className="h-14 flex items-center justify-center">
          <span className="text-slate-600 text-sm italic">Reveal correctness to compute DRI</span>
        </div>
      )}
    </div>
  );
}

/* ── Feature Bar ───────────────────────────────────────────────────────── */
function FeatureBar({ name, value }: { name: string; value: number }) {
  const colors: Record<string, string> = {
    MC: "#22d3ee", NC: "#a78bfa", OL: "#34d399", DR: "#fbbf24", PR: "#f472b6",
    LF: "#60a5fa", CC: "#4ade80", SA: "#fb923c", CLS: "#e879f9", PRED: "#38bdf8",
  };
  const color = colors[name] ?? "#94a3b8";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-mono text-slate-300">{name}</span>
        <span className="text-slate-500">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export function DriDemoPage() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0].id);
  const [customCode, setCustomCode] = useState("");
  const [isCustom, setIsCustom]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<any>(null);
  const [error, setError]           = useState<string | null>(null);
  const [revealed, setRevealed]     = useState(false);

  const example = EXAMPLES.find(e => e.id === selectedId)!;
  const codeToScore = isCustom ? customCode : example.code;

  const handleSelectExample = (id: string) => {
    setSelectedId(id);
    setIsCustom(false);
    setResult(null);
    setRevealed(false);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!codeToScore.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setRevealed(false);

    const passRatio = isCustom ? null : example.passRatio;

    try {
      const resp = await fetch(`${API}/dri`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeToScore,
          language: "python",
          pass_ratio: passRatio,
        }),
      });
      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      const data = await resp.json();
      setResult(data);
      if (passRatio !== null) setRevealed(true);
    } catch (e: any) {
      setError(e.message ?? "Failed to reach API. Is it running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const readabilityColor =
    result?.readability_label === "High"   ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
    : result?.readability_label === "Medium" ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
    : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 space-y-14">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="text-center">
        <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold tracking-widest text-indigo-300 uppercase mb-5">
          Paper 4 — Live Demo
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          Deceptive Readability Index
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-rose-400 to-amber-400 mt-2">
            When Readable Is Not Correct
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-base leading-relaxed">
          LLMs generate stylistically polished code regardless of semantic correctness.
          This demo shows how the IRAF-XADL readability score <em>fails to distinguish
          readable-but-wrong code</em> from readable-and-correct code — and how the
          DRI metric captures that risk.
        </p>
      </div>

      {/* ── DRI formula card ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-7 text-center">
        <p className="text-slate-400 text-xs font-mono tracking-widest uppercase mb-4">Definition</p>
        <div className="font-mono text-2xl md:text-3xl text-white font-bold">
          DRI(c) ={" "}
          <span className="text-indigo-300">P<sub>High</sub>(c)</span>
          <span className="text-slate-500"> × </span>
          <span className="text-rose-300">(1 − pass_ratio(c))</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 text-xs text-slate-400">
          {[
            ["DRI = 0",       "Unreadable OR correct — no deception",          "text-emerald-400"],
            ["0 < DRI < 0.6", "Moderate risk — readable, partly failing",       "text-amber-400"],
            ["DRI ≥ 0.6",     "Critical — readable but substantially wrong",    "text-red-400"],
          ].map(([label, desc, c]) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/4 p-3">
              <div className={`font-mono font-semibold mb-1 ${c}`}>{label}</div>
              <div>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Example picker ─────────────────────────────────────────── */}
      <div>
        <p className="text-slate-500 text-xs font-mono tracking-widest uppercase mb-4">
          Select an example from the paper
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXAMPLES.map(ex => (
            <button
              key={ex.id}
              onClick={() => handleSelectExample(ex.id)}
              className={`text-left rounded-xl border p-4 transition-all duration-200 ${
                !isCustom && selectedId === ex.id
                  ? "border-indigo-500/60 bg-indigo-500/10"
                  : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/6"
              }`}
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ex.tagColor} mb-2 inline-block`}>
                {ex.tag}
              </span>
              <p className="text-white text-sm font-medium leading-snug mt-1">{ex.label}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => { setIsCustom(true); setResult(null); setRevealed(false); }}
          className={`mt-3 text-sm rounded-xl border px-4 py-2 transition-all ${
            isCustom
              ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
              : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300"
          }`}
        >
          + Paste your own code
        </button>
      </div>

      {/* ── Code panel ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1424] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            {isCustom ? "Custom code" : example.label}
          </span>
          <span className="text-xs text-slate-600 font-mono">Python</span>
        </div>
        {isCustom ? (
          <textarea
            className="w-full bg-transparent text-slate-300 font-mono text-sm p-5 resize-none outline-none min-h-48"
            placeholder="Paste Python code here..."
            value={customCode}
            onChange={e => setCustomCode(e.target.value)}
            rows={12}
          />
        ) : (
          <pre className="text-slate-300 font-mono text-sm p-5 overflow-x-auto leading-relaxed">
            <code>{example.code}</code>
          </pre>
        )}
      </div>

      {/* ── Analyze button ─────────────────────────────────────────── */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleAnalyze}
          disabled={loading || !codeToScore.trim()}
          className="rounded-full bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-semibold px-8 py-3 transition-all text-sm shadow-lg shadow-indigo-500/20"
        >
          {loading ? "Scoring…" : "Analyse with IRAF-XADL"}
        </button>
        {result && !isCustom && !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="rounded-full border border-white/20 hover:bg-white/8 text-slate-300 font-semibold px-8 py-3 transition-all text-sm"
          >
            Reveal correctness →
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300 text-sm font-mono">
          {error}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">

          {/* Readability verdict row */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className={`rounded-2xl border p-6 ${readabilityColor}`}>
              <p className="text-xs font-mono tracking-widest uppercase mb-2 opacity-70">
                Readability Label
              </p>
              <p className="font-display text-4xl font-bold">{result.readability_label}</p>
              <p className="text-sm mt-2 opacity-70">{(result.readability_confidence * 100).toFixed(1)}% confidence</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <p className="text-xs font-mono tracking-widest uppercase mb-3 text-slate-500">
                Probability breakdown
              </p>
              {["High", "Medium", "Low"].map(label => {
                const v = result[`p_${label.toLowerCase()}`] ?? 0;
                return (
                  <div key={label} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-mono">{label}</span>
                      <span className="text-slate-500">{(v * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-indigo-400 transition-all duration-700"
                           style={{ width: `${v * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <DriGauge
              dri={result.dri ?? result.p_high}
              revealed={revealed || isCustom}
            />
          </div>

          {/* Correctness reveal (example mode only) */}
          {revealed && !isCustom && (
            <div className={`rounded-2xl border p-5 ${example.correctColor}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{example.correct ? "✓" : "✗"}</span>
                <div>
                  <p className="font-semibold text-sm">{example.correctLabel}</p>
                  <p className="text-xs opacity-70 mt-1">{example.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feature grid */}
          {result.features && Object.keys(result.features).length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <p className="text-xs font-mono tracking-widest uppercase mb-5 text-slate-500">
                10 IRAF-XADL Cognitive Parameters (mean across identifiers)
              </p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(result.features).map(([k, v]) => (
                  <FeatureBar key={k} name={k} value={Number(v)} />
                ))}
              </div>
              {result.dri !== null && result.dri !== undefined && (
                <div className="mt-6 pt-5 border-t border-white/8 text-sm text-slate-400 leading-relaxed">
                  <strong className="text-white">Insight</strong>: This code scores{" "}
                  <span className="text-indigo-300 font-semibold">
                    {result.readability_label} readability ({(result.readability_confidence * 100).toFixed(0)}%)
                  </span>
                  {revealed && !isCustom && !example.correct && (
                    <> yet fails {((1 - example.passRatio) * 100).toFixed(0)}% of test cases — producing a DRI of{" "}
                    <span className="text-rose-300 font-semibold">{result.dri?.toFixed(2)}</span>.
                    High MC and LF scores give developers a false signal of quality.</>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Explanation */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
            <p className="text-xs font-mono tracking-widest uppercase mb-3 text-slate-500">
              Model Explanation
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
          </div>
        </div>
      )}

      {/* ── Research context ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8">
        <p className="text-xs font-mono tracking-widest uppercase mb-4 text-indigo-400">Research Context</p>
        <h3 className="text-white font-semibold text-lg mb-3">
          Paper 4 — Under submission to IEEE Access
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-5">
          This demo implements the measurement instrument from our study of{" "}
          <strong className="text-white">~2,710 LLM-generated Python solutions</strong> from
          HumanEval+ and MBPP+ across five LLM architectures. The key finding: incorrect LLM-generated
          code scores statistically equivalent or higher readability than correct code — confirming that
          readability is a <em>poor predictor</em> of functional correctness in AI-generated code.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            ["DRI", "Novel composite metric", "indigo"],
            ["2,710", "Code samples analysed", "rose"],
            ["5", "LLM architectures tested", "amber"],
          ].map(([stat, label, c]) => (
            <div key={stat} className={`rounded-xl border border-${c}-500/20 bg-${c}-500/5 p-4`}>
              <div className={`font-display text-3xl font-bold text-${c}-400 mb-1`}>{stat}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
