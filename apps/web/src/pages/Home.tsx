import { ContributionCards } from "../components/home/ContributionCards";
import { HeroSection } from "../components/home/HeroSection";
import { ResearchJourney } from "../components/home/ResearchJourney";
import { MethodologyPipeline } from "../components/methodology/MethodologyPipeline";
import { SectionHeader } from "../components/common/SectionHeader";

export function Home() {
  return (
    <>
      <HeroSection />
      <ResearchJourney />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeader
          eyebrow="Methodology Preview"
          title="A layered path from source code identifiers to explainable prediction"
          description="The research pipeline moves from syntax-aware extraction to normalization, readability parameterization, contextual embeddings, and interpretable deep learning."
        />
        <div className="mt-10">
          <MethodologyPipeline />
        </div>
      </section>
      <ContributionCards />
    </>
  );
}
