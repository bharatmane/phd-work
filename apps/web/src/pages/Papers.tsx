import { PaperCard } from "../components/papers/PaperCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { papers } from "../data/papers";

export function Papers() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="Papers"
        title="A research journey expressed as three connected papers"
        description="Each paper addresses a different layer of the broader thesis problem while contributing to a coherent framework around identifier readability and program comprehension."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
