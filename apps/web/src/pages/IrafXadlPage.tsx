import { SectionHeader } from "../components/common/SectionHeader";
import { BiLstmVisualizer } from "../components/methodology/BiLstmVisualizer";
import { CodeBertVisualizer } from "../components/methodology/CodeBertVisualizer";
import { GlossaryGrid } from "../components/methodology/GlossaryGrid";
import { MethodologyPipeline } from "../components/methodology/MethodologyPipeline";
import { PerformanceDashboard } from "../components/methodology/PerformanceDashboard";
import { ReadabilityFeatureGrid } from "../components/methodology/ReadabilityFeatureGrid";
import { ShapExplainer } from "../components/methodology/ShapExplainer";
import { GlassCard } from "../components/common/GlassCard";

export function IrafXadlPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="IRAF-XADL"
        title="Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling"
        description="A detailed methodology explainer covering extraction, preprocessing, feature engineering, contextual embeddings, classification, optimization, and explainability."
      />

      <div className="mt-12">
        <MethodologyPipeline />
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-display text-2xl text-white">AST-based identifier extraction</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Python identifiers are extracted with LibCST and C++ identifiers with Tree-Sitter. This keeps the extraction process structurally accurate and suitable for downstream analysis.
          </p>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display text-2xl text-white">Preprocessing and normalization</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            The pipeline applies camelCase splitting, snake_case splitting, digit-letter separation, lowercase normalization, stopword removal, and lemmatization.
          </p>
        </GlassCard>
      </div>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Readability Parameters"
          title="Ten human-centric signals"
          description="These parameters anchor the thesis in interpretable software engineering constructs rather than opaque prediction alone."
        />
        <div className="mt-8">
          <ReadabilityFeatureGrid />
        </div>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <CodeBertVisualizer />
        <BiLstmVisualizer />
      </div>

      <div className="mt-12">
        <ShapExplainer />
      </div>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Performance"
          title="Reported evaluation outcomes"
          description="The current methodology reports strong classification performance on both Python and C++ evaluation paths."
        />
        <div className="mt-8">
          <PerformanceDashboard />
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Glossary"
          title="Acronyms and technical terms"
          description="Quick references for the core terminology used throughout the methodology and presentation flow."
        />
        <div className="mt-8">
          <GlossaryGrid />
        </div>
      </section>

      <section className="mt-12" id="presentation">
        <SectionHeader
          eyebrow="Presenter Script"
          title="Suggested talk track"
          description="Start with the comprehension problem, justify structural extraction, explain how the ten factors and CodeBERT embeddings complement each other, then show why attention and SHAP matter for interpretability and confidence."
        />
      </section>
    </div>
  );
}
