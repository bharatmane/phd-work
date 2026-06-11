import { papers } from "../data/papers";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";

export function Publications() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Publications"
        title="Publication status and dissemination pipeline"
        description="A single place to maintain journal or conference targets, DOI placeholders, PDF links, and citation-ready metadata."
      />
      <div className="mt-12 grid gap-6">
        {papers.map((paper) => (
          <GlassCard key={paper.id}>
            <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr_0.5fr]">
              <div>
                <h3 className="font-display text-2xl text-white">{paper.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{paper.venue}</p>
              </div>
              <div className="text-sm leading-7 text-slate-300">
                <p><span className="text-slate-400">Status:</span> {paper.status}</p>
                <p><span className="text-slate-400">DOI:</span> {paper.doi}</p>
              </div>
              <div className="text-sm leading-7 text-slate-300">
                <p>
                  <span className="text-slate-400">PDF:</span>{" "}
                  {paper.pdfUrl ? (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                    >
                      Download
                    </a>
                  ) : (
                    "Pending"
                  )}
                </p>
                <p><span className="text-slate-400">Citation:</span> {paper.citation}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
