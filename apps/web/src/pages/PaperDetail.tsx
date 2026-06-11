import { Navigate, useParams, Link } from "react-router-dom";
import { PaperDetailLayout } from "../components/papers/PaperDetailLayout";
import { PresentationMode } from "../components/papers/PresentationMode";
import { SectionHeader } from "../components/common/SectionHeader";
import { papers } from "../data/papers";

export function PaperDetail() {
  const { paperId } = useParams();
  const paper = papers.find((item) => item.id === paperId);

  if (!paper) {
    return <Navigate to="/papers" replace />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow={paper.status}
        title={paper.title}
        description={paper.keyContribution}
        actions={
          <div className="flex gap-3 flex-wrap">
            {(paper.id === "iraf-xadl" || paper.id === "paper-2" || paper.id === "paper-3") && (
              <Link to={`/papers/${paper.id}/animated`} className="rounded-full bg-violet-500/20 border border-violet-500/40 px-5 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors">
                Animated Explainer ✦
              </Link>
            )}
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors"
              >
                Download PDF ↓
              </a>
            )}
            <a href="#presentation" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white">
              Presentation mode
            </a>
          </div>
        }
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <PaperDetailLayout title="Abstract">
          <p>{paper.abstract}</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Research gap">
          <p>{paper.gap}</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Objective">
          <p>{paper.objective}</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Dataset">
          <p>{paper.dataset}</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Proposed methodology">
          <ul className="space-y-2">
            {paper.methodology.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PaperDetailLayout>
        <PaperDetailLayout title="Architecture diagram placeholder">
          <p>A dedicated diagram can be embedded here for the paper-specific architecture or workflow figure.</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Results">
          <ul className="space-y-2">
            {paper.results.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PaperDetailLayout>
        <PaperDetailLayout title="Contribution">
          <p>{paper.contribution}</p>
        </PaperDetailLayout>
        <PaperDetailLayout title="Limitations">
          <ul className="space-y-2">
            {paper.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PaperDetailLayout>
        <PaperDetailLayout title="Future work">
          <ul className="space-y-2">
            {paper.futureWork.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PaperDetailLayout>
      </div>
      <div className="mt-12" id="presentation">
        <PresentationMode summary={paper.presentationMode} />
      </div>
    </div>
  );
}
