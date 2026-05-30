import { Link } from "react-router-dom";
import type { Paper } from "../../types";
import { GlassCard } from "../common/GlassCard";

type PaperCardProps = {
  paper: Paper;
};

export function PaperCard({ paper }: PaperCardProps) {
  return (
    <GlassCard className="flex h-full flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">{paper.status}</p>
        <h3 className="mt-3 font-display text-2xl text-white">{paper.title}</h3>
        <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
          <p><span className="text-slate-400">Problem:</span> {paper.problem}</p>
          <p><span className="text-slate-400">Method:</span> {paper.method}</p>
          <p><span className="text-slate-400">Contribution:</span> {paper.keyContribution}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={`/papers/${paper.id}`} className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
          View details
        </Link>
        {(paper.id === "iraf-xadl" || paper.id === "paper-2" || paper.id === "paper-3") && (
          <Link
            to={`/papers/${paper.id}/animated`}
            className="rounded-full bg-violet-500/20 border border-violet-500/40 px-5 py-2 text-sm font-semibold text-violet-300"
          >
            Animated Explainer ✦
          </Link>
        )}
        <Link to={`/papers/${paper.id}#presentation`} className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white">
          Presentation mode
        </Link>
      </div>
    </GlassCard>
  );
}
