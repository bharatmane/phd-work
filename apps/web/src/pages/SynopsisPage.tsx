import { PasswordGate } from "../components/common/PasswordGate";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Badge } from "../components/common/Badge";

const THESIS_TITLE =
  "Explainable Deep Learning for Multi-Level Program Comprehension: " +
  "Identifier Readability, Code Snippet Analysis, and Developer Experience Classification";

const objectives = [
  "Design a syntax-aware identifier preprocessing pipeline using LibCST (Python) and Tree-Sitter (C++) and compute ten linguistically grounded readability parameters from each identifier.",
  "Develop IRAF-XADL — a CodeBERT + Self-Attention BiLSTM classifier with SHAP explainability for identifier-level readability assessment.",
  "Construct ECRVR-MVEL — a weighted majority voting ensemble of GCN, DBN, and Bi-TCN classifiers with LIME explanations for snippet-level readability prediction.",
  "Develop EESQA-DELMOA — a developer experience classification system using BAHB feature selection, SSNN classification, and AMBOA hyperparameter tuning.",
  "Evaluate all three models on publicly available benchmark datasets against state-of-the-art baselines across five metrics.",
];

const studies = [
  {
    id: "Study 1",
    name: "IRAF-XADL",
    full: "Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning",
    color: "cyan",
    steps: [
      "AST-based identifier extraction (LibCST / Tree-Sitter)",
      "Ten readability parameters: MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED",
      "CodeBERT contextual embeddings (768-dim, frozen)",
      "Self-Attention BiLSTM classifier (3 layers, 4 heads)",
      "AdamW optimisation (lr=0.001, wd=0.01)",
      "SHAP KernelExplainer for feature attribution",
    ],
    results: { python: "97.36%", cpp: "97.94%", baseline: "82.00% (SMO)" },
    xai: "SHAP identifies Meaningful Clarity (MC) and Naming Conformance (NC) as dominant features.",
  },
  {
    id: "Study 2",
    name: "ECRVR-MVEL",
    full: "Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning",
    color: "violet",
    steps: [
      "Text preprocessing (tokenisation, comment removal, language detection)",
      "CodeBERT [CLS] token encoding of full snippet (sliding window for >512 tokens)",
      "Graph Convolutional Network — code dependency structure",
      "Deep Belief Network — hierarchical probabilistic representation",
      "Bidirectional Temporal Convolutional Network — sequential token patterns",
      "Weighted majority voting ensemble + Nadam optimisation",
      "LIME local explanations per prediction",
    ],
    results: { python: "98.15%", cpp: "98.38%", baseline: "90.11% (Neural Network)" },
    xai: "LIME confirms MC, PRED, and NC as primary snippet-level readability drivers.",
  },
  {
    id: "Study 3",
    name: "EESQA-DELMOA",
    full: "Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms",
    color: "rose",
    steps: [
      "Min-max normalisation of 26 developer activity features",
      "BAHB feature selection: 18 of 26 features selected",
      "Simplified Spiking Neural Network (rate coding, 25 time steps, LIF dynamics)",
      "AMBOA hyperparameter tuning (maximises precision)",
    ],
    results: { accuracy: "98.74%", time: "8.27s", baseline: "94.78% (CNN)" },
    xai: "BAHB selection reveals commit ownership and project breadth as the strongest predictors.",
  },
];

const contributions = [
  {
    n: "C1",
    title: "Ten-dimensional identifier readability parameter set",
    body: "MC, NC, OL, DR, PR, LF, CC, SA, CLS, PRED — covering semantic, structural, contextual, and cognitive dimensions. First such comprehensive feature set in the literature.",
  },
  {
    n: "C2",
    title: "IRAF-XADL framework",
    body: "First system to combine AST-based extraction, CodeBERT embeddings, SA-BiLSTM, AdamW, and SHAP for identifier-level readability classification across Python and C++.",
  },
  {
    n: "C3",
    title: "ECRVR-MVEL ensemble",
    body: "First weighted majority voting ensemble of GCN, DBN, and Bi-TCN with LIME explanations for snippet-level code readability prediction.",
  },
  {
    n: "C4",
    title: "EESQA-DELMOA system",
    body: "Novel combination of SSNN, BAHB feature selection, and AMBOA tuning for six-class developer experience classification with the lowest published execution time.",
  },
  {
    n: "C5",
    title: "Multi-level explainability-first framework",
    body: "First cross-method, cross-level XAI validation: SHAP (Study 1) and LIME (Study 2) independently converge on MC and NC as primary readability drivers.",
  },
];

const references = [
  "Lawrie et al. (2007) — Effective identifier names for comprehension and memory.",
  "Buse & Weimer (2010) — Learning a metric for code readability. IEEE TSE.",
  "Feng et al. (2020) — CodeBERT: A pre-trained model for programming and natural language. EMNLP.",
  "Lundberg & Lee (2017) — A unified approach to interpreting model predictions. NeurIPS.",
  "Ribeiro et al. (2016) — 'Why should I trust you?': Explaining the predictions of any classifier. KDD.",
  "Perez, Urtado & Vauttier (2023) — Dataset of open-source software developers labeled by experience level. Data in Brief.",
  "Mi et al. (2025) — Towards explainable code readability classification with graph neural networks. JSS.",
  "Arora & Singh (2019) — Butterfly optimization algorithm. Soft Computing.",
  "Maass (1997) — Networks of spiking neurons: the third generation. Neural Networks.",
  "Butler et al. (2010) — Relating identifier naming flaws and code quality. WCRE.",
];

const publications = [
  {
    title: "Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling",
    venue: "[JOURNAL_P1]",
    status: "Accepted — In Publication",
  },
  {
    title: "Explainable Artificial Intelligence with Hybrid Ensemble Learning based Automated Code Comprehension Prediction",
    venue: "[JOURNAL_P2]",
    status: "Accepted",
  },
  {
    title: "Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment",
    venue: "Under Review",
    status: "[P3_STATUS]",
  },
];

function ColorBadge({ color, children }: { color: string; children: string }) {
  const map: Record<string, string> = {
    cyan:   "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    violet: "border-violet-300/25 bg-violet-300/10 text-violet-100",
    rose:   "border-rose-300/25 bg-rose-300/10 text-rose-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-widest ${map[color] ?? map.cyan}`}>
      {children}
    </span>
  );
}

function SynopsisContent() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 space-y-20">

      {/* Header */}
      <div>
        <Badge>Synopsis</Badge>
        <h1 className="mt-4 font-display text-3xl text-white md:text-4xl leading-snug">
          {THESIS_TITLE}
        </h1>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400 md:grid-cols-4">
          <div><span className="text-slate-500">Scholar</span><br /><span className="text-slate-200">Bharat Babaso Mane</span></div>
          <div><span className="text-slate-500">Supervisor</span><br /><span className="text-slate-200">Dr. Rathnakar Achary</span></div>
          <div><span className="text-slate-500">University</span><br /><span className="text-slate-200">Alliance University, Bengaluru</span></div>
          <div><span className="text-slate-500">Year</span><br /><span className="text-slate-200">2026</span></div>
        </div>
      </div>

      {/* 1. Abstract */}
      <section>
        <SectionHeader eyebrow="1" title="Abstract" description="" />
        <GlassCard className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>Program comprehension — the cognitive process by which software developers understand what code does, how it is structured, and who built it — underpins nearly every phase of the software development lifecycle. Maintenance, debugging, refactoring, code review, and developer onboarding all depend on a developer's ability to read and make sense of source code quickly and accurately. Industry estimates consistently place maintenance at sixty to seventy percent of total software lifecycle cost, yet automated tools for measuring and explaining code quality have remained narrow, most assessing surface characteristics while ignoring the semantic content — specifically, the naming quality of identifiers — that experienced developers attend to when judging code.</p>
          <p>This thesis addresses the problem from three complementary directions. The first study, IRAF-XADL, assesses individual identifier readability using CodeBERT embeddings and a Self-Attention BiLSTM, achieving 97.36%/97.94% accuracy on Python/C++ data. The second study, ECRVR-MVEL, predicts snippet-level readability using a weighted majority voting ensemble of GCN, DBN, and Bi-TCN classifiers, achieving 98.15%/98.38% accuracy. The third study, EESQA-DELMOA, classifies developer experience level using bio-inspired feature selection and a Simplified Spiking Neural Network, achieving 98.74% accuracy in 8.27 seconds.</p>
          <p>A cross-study analysis reveals that SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity and Naming Conformance as the dominant readability drivers — the first cross-method, cross-level XAI validation in the code readability literature.</p>
          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Keywords</p>
            <p className="mt-1 text-slate-300">Program Comprehension · Code Readability · Identifier Quality · CodeBERT · SA-BiLSTM · GCN · DBN · Bi-TCN · Spiking Neural Network · Explainable AI · SHAP · LIME · Software Quality Assessment · Developer Experience</p>
          </div>
        </GlassCard>
      </section>

      {/* 2. Introduction */}
      <section>
        <SectionHeader eyebrow="2" title="Introduction" description="" />
        <GlassCard className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>Code is read far more often than it is written. Minelli, Mocci, and Lanza (2015) found the ratio at roughly ten to one. That reading is not passive — it is active inference: reconstructing intent, data flow, and edge cases from symbols on the screen. The cognitive process underlying this activity is program comprehension, and its cost is substantial.</p>
          <p>The quality of source code is layered. At the finest grain it lives in identifier names. At a broader grain it is visible at the snippet or function level. At the broadest grain it is a property of the developer who wrote the code. Each level has been studied in isolation. What has not existed is a unified, explainable framework assessing all three levels simultaneously.</p>
          <p>This gap has grown more urgent as AI-generated code enters production. Large language models can generate syntactically correct code — but whether that code is readable is a separate question.</p>
        </GlassCard>
      </section>

      {/* 3. Scope */}
      <section>
        <SectionHeader eyebrow="3" title="Scope of the thesis" description="" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Languages", val: "Python and C++ (LibCST + Tree-Sitter parsers)" },
            { label: "Datasets", val: "Code Snippets: Insights & Readability (Kaggle) + Developer Experience (Zenodo)" },
            { label: "Explainability", val: "SHAP for identifier level · LIME for snippet level" },
            { label: "Evaluation", val: "70/30 train/test splits · Accuracy, Precision, Recall, F1, AUC" },
            { label: "Deployment", val: "FastAPI REST API — feasibility demonstrated" },
            { label: "Exclusions", val: "Java/JS, human annotation studies, AI-generated code, CodeBERT fine-tuning" },
          ].map((item) => (
            <GlassCard key={item.label}>
              <p className="text-xs uppercase tracking-widest text-cyan-400">{item.label}</p>
              <p className="mt-2 text-sm text-slate-300">{item.val}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 4. Objectives */}
      <section>
        <SectionHeader eyebrow="4" title="Objectives" description="" />
        <GlassCard className="mt-6">
          <ol className="space-y-4">
            {objectives.map((obj, i) => (
              <li key={i} className="flex gap-4 text-sm leading-7 text-slate-300">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs text-cyan-300">
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ol>
        </GlassCard>
      </section>

      {/* 5. Research Methodology */}
      <section>
        <SectionHeader eyebrow="5" title="Research methodology" description="Three studies, each targeting a different level of the program comprehension hierarchy." />
        <div className="mt-6 space-y-6">
          {studies.map((s) => (
            <GlassCard key={s.id}>
              <div className="flex items-start gap-4">
                <ColorBadge color={s.color}>{s.id}</ColorBadge>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.full}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <ol className="space-y-1.5">
                  {s.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-300">
                      <span className="text-slate-500 shrink-0">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="rounded-xl bg-white/5 p-4 text-xs space-y-2 min-w-[180px]">
                  {"python" in s.results && (
                    <>
                      <div><span className="text-slate-500">Python acc.</span><br /><span className="text-white font-mono">{s.results.python}</span></div>
                      <div><span className="text-slate-500">C++ acc.</span><br /><span className="text-white font-mono">{s.results.cpp}</span></div>
                    </>
                  )}
                  {"accuracy" in s.results && (
                    <>
                      <div><span className="text-slate-500">Accuracy</span><br /><span className="text-white font-mono">{s.results.accuracy}</span></div>
                      <div><span className="text-slate-500">Exec. time</span><br /><span className="text-white font-mono">{s.results.time}</span></div>
                    </>
                  )}
                  <div><span className="text-slate-500">Best baseline</span><br /><span className="text-slate-300 text-[11px]">{s.results.baseline}</span></div>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400 italic">{s.xai}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 6. Contributions */}
      <section>
        <SectionHeader eyebrow="6" title="Major contributions" description="" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contributions.map((c) => (
            <GlassCard key={c.n}>
              <span className="text-xs font-mono text-cyan-400">{c.n}</span>
              <h4 className="mt-2 text-sm font-semibold text-white">{c.title}</h4>
              <p className="mt-2 text-xs leading-6 text-slate-400">{c.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. Results */}
      <section>
        <SectionHeader eyebrow="7" title="Results and discussion" description="" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "IRAF-XADL Python", val: "97.36%", sub: "vs 82.00% best baseline" },
            { label: "IRAF-XADL C++", val: "97.94%", sub: "vs 80.56% best baseline" },
            { label: "ECRVR-MVEL Python", val: "98.15%", sub: "vs 90.11% Neural Network" },
            { label: "ECRVR-MVEL C++", val: "98.38%", sub: "vs 94.58% Naïve Bayes" },
            { label: "EESQA-DELMOA", val: "98.74%", sub: "vs 94.78% CNN" },
            { label: "Execution Time", val: "8.27s", sub: "Lowest of all 8 methods" },
          ].map((m) => (
            <GlassCard key={m.label} className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">{m.val}</p>
              <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="mt-4 text-sm leading-7 text-slate-300">
          <p><strong className="text-white">Cross-study XAI finding:</strong> SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity (MC) and Naming Conformance (NC) as primary readability drivers — across two independent explainability methods, two levels of analysis, two classifiers, and two programming languages. This is the first cross-method, cross-level XAI validation in the code readability literature.</p>
        </GlassCard>
      </section>

      {/* 8. Conclusions */}
      <section>
        <SectionHeader eyebrow="8" title="Summary and conclusions" description="" />
        <GlassCard className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>This thesis set out to address a fundamental limitation of existing automated code quality tools: their restriction to a single level of analysis, and their lack of interpretable outputs. Three studies were conducted, each targeting a different level of the program comprehension hierarchy.</p>
          <p>Study 1 (IRAF-XADL) demonstrated that identifier readability can be assessed with 97%+ accuracy using a rich feature set with CodeBERT embeddings. SHAP analysis revealed that Meaningful Clarity and Naming Conformance are dominant — a practically useful finding for naming guidelines. Study 2 (ECRVR-MVEL) showed that ensemble diversity consistently outperforms individual classifiers; LIME confirmed the same features generalize to snippet level. Study 3 (EESQA-DELMOA) showed developer experience can be classified in 8.27 seconds — practical for CI/CD and team management.</p>
          <p>Together, the three studies establish that program comprehension can be assessed automatically, accurately, and interpretably at every level of the software development artefact hierarchy.</p>
        </GlassCard>
      </section>

      {/* 9. References */}
      <section>
        <SectionHeader eyebrow="9" title="List of references" description="Chicago format" />
        <GlassCard className="mt-6">
          <ol className="space-y-2">
            {references.map((ref, i) => (
              <li key={i} className="flex gap-3 text-xs leading-6 text-slate-400">
                <span className="shrink-0 text-slate-600">{i + 1}.</span>
                {ref}
              </li>
            ))}
          </ol>
        </GlassCard>
      </section>

      {/* 10. Publications */}
      <section>
        <SectionHeader eyebrow="10" title="List of publications" description="" />
        <div className="mt-6 space-y-4">
          {publications.map((pub, i) => (
            <GlassCard key={i} className="flex gap-4">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xs text-cyan-300">
                P{i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{pub.title}</p>
                <p className="mt-1 text-xs text-slate-400">{pub.venue}</p>
                <span className="mt-2 inline-flex rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                  {pub.status}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

    </div>
  );
}

export function SynopsisPage() {
  return (
    <PasswordGate storageKey="synopsis_auth">
      <SynopsisContent />
    </PasswordGate>
  );
}
