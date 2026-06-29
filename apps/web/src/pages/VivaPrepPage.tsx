import { PasswordGate } from "../components/common/PasswordGate";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Badge } from "../components/common/Badge";

const categories = [
  {
    name: "Novelty & positioning",
    color: "cyan",
    items: [
      {
        q: "What's the single novel contribution of the thesis?",
        a: "A unified, explainable comprehension framework spanning three levels of granularity — identifier, snippet, developer. Most prior work treats readability at one level and trades accuracy for interpretability; this thesis delivers both, and validates the same cognitive parameters across levels.",
      },
      {
        q: "Isn't this just applying CodeBERT three times?",
        a: "No — CodeBERT is the shared embedding backbone, but each level has a purpose-built classifier (SA-BiLSTM / GCN-DBN-BiTCN ensemble / SSNN) and a matched explainability method. The contribution is the cross-level validation of cognitive readability parameters and the explainability layer, not the embedding itself.",
      },
      {
        q: "What's genuinely novel here versus recombination of existing published techniques?",
        a: "Each individual component (CodeBERT, BiLSTM, GCN, SHAP, LIME, SNNs) exists in the literature. The novelty is the combination no prior work has attempted: purpose-built ten-parameter readability features fused with contextual embeddings, validated by two independent explainers at two independent levels, plus the first application of SSNN+BAHB+AMBOA to developer experience classification.",
      },
    ],
  },
  {
    name: "Methodology rigor",
    color: "violet",
    items: [
      {
        q: "Are the accuracies (98%+) suspiciously high — overfitting risk?",
        a: "They're on balanced, peer-reviewed benchmark datasets with held-out 70/30 evaluation, reported separately for train and test splits, and consistent across two journals' independent review. The acknowledged limitation is dataset scale, not leakage.",
      },
      {
        q: "How do you know there's no train/test leakage?",
        a: "Splits are performed before any feature computation or embedding generation, stratified by class, and identical splits are reused across all baseline comparisons for fairness. Train and test metrics are both reported (e.g. P1 Python: 98.13% train vs 97.36% test) — the gap is small and in the expected direction.",
      },
      {
        q: "Why spiking neural networks (P3) — gimmick or justified?",
        a: "SSNN gives biologically-plausible temporal encoding at a fraction of the compute — 8.27s vs 15–17s for CNN/AlexNet — while beating them on accuracy. For developer-activity data, which is inherently temporal, the speed/accuracy trade-off is the contribution, not a novelty-for-novelty's-sake choice.",
      },
      {
        q: "Bio-inspired optimizers (BAHB/AMBOA) — aren't these arbitrary?",
        a: "They're ablated against standard alternatives in the paper; BAHB feature selection reduces the feature set (26→18) without accuracy loss, and AMBOA's hyperparameter tuning is benchmarked against grid search. Happy to walk the committee through the ablation table.",
      },
    ],
  },
  {
    name: "Explainability",
    color: "rose",
    items: [
      {
        q: "SHAP and LIME are post-hoc approximations — do they reflect the model's true reasoning?",
        a: "They're local-fidelity approximations, yes — that's a known limitation of any post-hoc explainer. Their value here is agreement: independent methods (SHAP in P1, LIME in P2) converge on the same dominant parameters (MC, NC, PRED), which raises confidence beyond what any single explainer could provide alone.",
      },
    ],
  },
  {
    name: "Scope, data & generalizability",
    color: "cyan",
    items: [
      {
        q: "Only Python and C++ — how does this generalize?",
        a: "Correct, and it's stated as an explicit limitation, not glossed over. The AST extraction pipeline is language-pluggable via Tree-Sitter grammars, so Java/JS/TS extension is concrete future work — an engineering extension, not a research redesign.",
      },
      {
        q: "P3's dataset is small and imbalanced (703 developers, 72% Unknown class) — is that a problem?",
        a: "Yes, and it's acknowledged directly in the synopsis's limitations section. Recall on minority classes (BOT, NSE) is correspondingly weaker than precision. Mitigation proposed: oversampling or expanded data collection — not a redesign of the method.",
      },
    ],
  },
  {
    name: "Coherence of the thesis",
    color: "violet",
    items: [
      {
        q: "Does Paper 4 (AI-generated code) actually belong in a thesis about human program comprehension?",
        a: "It's the natural extension, not a detour. As authorship shifts from humans to LLMs, the same comprehension framework becomes a tool to audit machine output. The Deceptive Readability Index shows readability no longer implies correctness for AI code — which is precisely why explainable comprehension metrics matter going forward.",
      },
      {
        q: "Is reproducibility a concern — could another researcher replicate the pipeline?",
        a: "All three core studies use publicly available benchmark datasets (Kaggle, Zenodo) and report hyperparameters explicitly (layers, learning rates, dropout, optimiser settings). The deployed FastAPI demo also serves as a live, inspectable artefact of the IRAF-XADL pipeline.",
      },
    ],
  },
];

function CategoryBadge({ color, children }: { color: string; children: string }) {
  const map: Record<string, string> = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    rose: "border-rose-300/25 bg-rose-300/10 text-rose-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${map[color] ?? map.cyan}`}>
      {children}
    </span>
  );
}

function VivaPrepContent() {
  let counter = 0;
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 space-y-12">
      <div>
        <Badge>Viva / RAC prep</Badge>
        <h1 className="mt-4 font-display text-3xl text-white md:text-4xl leading-snug">
          The dirty dozen — toughest questions and crisp answers
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300 max-w-3xl">
          Twelve questions a doctoral committee or reviewer is most likely to press on, grouped by theme, with the
          answer to lead with. Drawn from and kept in sync with <code className="text-cyan-300">docs/review/RAC_Progress_Review_Prep.md</code>.
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat.name}>
          <div className="flex items-center gap-3">
            <CategoryBadge color={cat.color}>{cat.name}</CategoryBadge>
          </div>
          <div className="mt-4 space-y-4">
            {cat.items.map((item) => {
              counter += 1;
              return (
                <GlassCard key={item.q}>
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs text-slate-300">
                      {counter}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.q}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      ))}

      <GlassCard className="text-sm leading-7 text-slate-300">
        <SectionHeader eyebrow="Close" title="One-line close" description="" />
        <p className="mt-4 italic">
          "The framework is built, validated across three levels of program comprehension, published across three
          papers in a Scopus-indexed journal (ETASR), and already extending into the AI-code era via a fourth paper
          under submission to IEEE Access — I'm asking the committee to confirm scope so I can move to submission."
        </p>
      </GlassCard>
    </div>
  );
}

export function VivaPrepPage() {
  return (
    <PasswordGate storageKey="viva_prep_auth">
      <VivaPrepContent />
    </PasswordGate>
  );
}
