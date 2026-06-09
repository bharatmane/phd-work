import { PaperCard } from "../components/papers/PaperCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { papers } from "../data/papers";

export function Papers() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Papers"
        title="A research journey expressed as four connected papers"
        description="Each paper addresses a different layer of the broader thesis problem. Papers 1–3 form the published core; Paper 4 is a pivot into the AI-generated code quality era — currently under submission to IEEE Access."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
