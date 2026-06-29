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

      <GlassCard className="mt-8">
        <h3 className="font-display text-xl text-white">Journal credentials — ETASR</h3>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          Engineering, Technology &amp; Applied Science Research is indexed in Scopus, Web of Science, and DOAJ,
          with a 2025 SJR of 0.350 (Q2) and CiteScore of 3.0. Article-level Scopus records for individual papers
          can lag a publication issue behind the journal's own indexing — the source itself is current.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/docs/ETASR_Scopus_Preview.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            Scopus Source Preview ↓
          </a>
          <a
            href="/docs/ETASR_SCImago_Q2.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            SCImago Q2 Ranking ↓
          </a>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6">
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
                {paper.indexNote && (
                  <p className="text-amber-300/90">
                    <span className="text-slate-400">Indexing:</span>{" "}
                    {paper.indexUrl ? (
                      <a
                        href={paper.indexUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-amber-200"
                      >
                        {paper.indexNote}
                      </a>
                    ) : (
                      paper.indexNote
                    )}
                  </p>
                )}
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
