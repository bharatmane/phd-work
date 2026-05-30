import { useLocation, useNavigate } from "react-router-dom";
import { LiveDemo } from "../components/methodology/LiveDemo";
import { SamplesPage } from "./SamplesPage";
import { ExperimentsPage } from "./ExperimentsPage";

const TABS = [
  { id: "try",         label: "⚡ Try It",        path: "/demo"        },
  { id: "samples",     label: "Code Samples",     path: "/demo/samples" },
  { id: "experiments", label: "Experiment Log",   path: "/demo/experiments" },
];

function TabBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = TABS.find((t) => pathname.startsWith(t.path) && t.path !== "/demo")
    ?? TABS[0];

  return (
    <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit">
      {TABS.map((tab) => {
        const isActive = tab.id === active.id;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all ${
              isActive
                ? "bg-cyan-400/20 border border-cyan-400/40 text-cyan-300"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function DemoPage() {
  const { pathname } = useLocation();
  const isSamples     = pathname.startsWith("/demo/samples");
  const isExperiments = pathname.startsWith("/demo/experiments");

  return (
    <div>
      {/* Tab bar — always visible at top */}
      <div className="sticky top-16 z-40 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <TabBar />
        </div>
      </div>

      {/* Tab content */}
      {isSamples ? (
        <SamplesPage />
      ) : isExperiments ? (
        <ExperimentsPage />
      ) : (
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.4em] text-cyan-100/70 mb-3">
              IRAF-XADL · Live Model
            </p>
            <h1 className="font-display text-4xl text-white md:text-5xl">
              Test any Python snippet for readability
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 max-w-2xl">
              Paste your code below. The SA-BiLSTM model — trained on 1,564 LeetCode
              solutions with CodeBERT embeddings — classifies identifier readability and
              shows which identifiers drove the verdict via self-attention weights.
            </p>
          </div>
          <LiveDemo />
        </div>
      )}
    </div>
  );
}
