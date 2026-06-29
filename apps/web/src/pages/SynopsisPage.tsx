import { PasswordGate } from "../components/common/PasswordGate";
import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Badge } from "../components/common/Badge";

const THESIS_TITLE =
  "Evaluating Program Comprehension through Explainable Deep Learning: " +
  "A Multi-Level Framework for Identifier Readability, Code Snippet Analysis, and Developer Experience Classification";

const objectives = [
  "To assess identifier readability in Python and C++ source code by extracting ten naming quality features through AST-based parsing, combining them with CodeBERT embeddings in a Self-Attention BiLSTM classifier, and using SHAP to explain what drives each prediction.",
  "To predict code snippet readability by building an ensemble of three structurally different classifiers — GCN, DBN, and Bi-TCN — combined through weighted majority voting, with LIME explanations showing which parts of the code influenced the result.",
  "To classify developer experience level from observable activity features by selecting the most relevant features using bio-inspired optimisation, training a Simplified Spiking Neural Network, and evaluating the system against published baselines on accuracy and execution time.",
];

const literatureSurvey = [
  {
    id: "3.1",
    title: "Identifier Readability and Code Quality",
    body: "Lawrie et al. (2007) established that longer, descriptive identifiers improve comprehension speed; Hofmeister et al. (2017) showed descriptive names enable 19% faster bug detection across 72 professional developers; Schankin et al. (2011) used eye-tracking to confirm developers fixate longer on cryptic identifiers. Butler et al. (2010, 2019) catalogued naming antipatterns correlating with higher defect density, and Arnaoudova et al. (2016) formalised a taxonomy of linguistic antipatterns. Transformer models such as CodeBERT (Feng et al., 2020) provide contextual code representations, but had not been combined with an attention-augmented recurrent classifier and linguistically grounded features for identifier readability prior to this thesis. SHAP (Lundberg & Lee, 2017) provides the attribution framework used to distribute credit across the ten readability parameters introduced here.",
  },
  {
    id: "3.2",
    title: "Code Readability Prediction",
    body: "Buse and Weimer (2010) created the first human-annotated readability dataset; Scalabrino et al. (2016, 2018, 2019) extended this with semantic textual features and a crowd-sourced understandability classifier. Mi et al. (2025) applied graph convolutional networks to code dependency structures, reporting 92.87% accuracy on the Python dataset used in this thesis — a result the weighted ensemble in this work surpasses by more than five percentage points. Deep belief networks and bidirectional temporal convolutional networks add complementary probabilistic and sequential views; weighted majority voting over these three structurally diverse architectures, with learned per-classifier weights, remained unexplored before this thesis. LIME (Ribeiro et al., 2016) supplies the local, model-agnostic explanations for the ensemble's predictions.",
  },
  {
    id: "3.3",
    title: "Developer Experience and Software Quality",
    body: "Developer experience has mostly been studied through proxy measures — commit frequency, project tenure, bug-fix rate. Zamir et al. (2025) and Akhtar & Daviglus (2025) used handcrafted heuristics and behavioural-pattern analysis respectively, without a formal deep-learning classification framework. Perez, Urtado, and Vauttier (2023) released the 703-profile, six-class developer-experience dataset (Zenodo) used in this thesis. Spiking neural networks model temporal activity patterns natively; the Simplified Spiking Neural Network (SSNN) variant cuts execution time by 43% versus an equivalent ANN. The Bio-inspired Artificial Hummingbird Behaviour (BAHB) and Adaptive Migration Butterfly Optimisation Algorithm (AMBOA) are metaheuristics that, prior to this thesis, had not been combined with SSNN for developer experience classification.",
  },
];

const researchGap =
  "Identifier readability, code snippet readability, and developer experience have generally been studied as separate problems, mostly using handcrafted surface-level features and traditional machine learning, with limited attention to explainability or multi-level assessment. This thesis addresses that gap with a multi-level explainable framework spanning all three levels: identifier readability (CodeBERT + SA-BiLSTM + SHAP), snippet readability (CodeBERT + weighted ensemble + LIME), and developer-centric quality assessment (BAHB + SSNN + AMBOA).";

const studies = [
  {
    id: "Study 1",
    name: "IRAF-XADL",
    full: "Identifier Readability Analysis Framework using Explainable Attention-Based Deep Learning",
    color: "cyan",
    stages: [
      { name: "Stage 1 — Identifier extraction & normalisation", body: "Identifiers are extracted using language-specific AST parsers — LibCST (Python), Tree-Sitter (C++) — then lexically normalised: camelCase/snake_case splitting, digit-letter separation, lowercasing, WordNet lemmatisation, and stopword removal." },
      { name: "Stage 2 — Ten readability parameters", body: "MC (Meaningful Clarity), NC (Naming Conformance), OL (Optimal Length), DR (Domain Relevance), PR (Pronounceability), LF (Lexical Familiarity), CC (Context Consistency), SA (Scope Appropriateness), CLS (Cognitive Load Score), PRED (Predictability)." },
      { name: "Stage 3 — CodeBERT embeddings", body: "Each identifier is encoded with CodeBERT (microsoft/codebert-base, 12-layer Transformer); per-token embeddings are mean-pooled into a 768-dimensional representation." },
      { name: "Stage 4 — SA-BiLSTM classifier", body: "CodeBERT embeddings and the ten features are concatenated and fed to a 3-layer Self-Attention BiLSTM (128 hidden units, dropout 0.3) with 4-head attention (dim 128), then a 64-unit ReLU dense layer producing High / Medium / Low." },
      { name: "Stage 5 — SHAP explainability", body: "SHAP KernelExplainer computes Shapley values per feature; global summary plots and local dot plots show feature contributions per identifier." },
    ],
    figures: [
      { src: "/synopsis/fig1-iraf-xadl-framework.jpeg", caption: "Figure 1. IRAF-XADL framework: from raw Python/C++ source through identifier preprocessing, ten-parameter extraction, CodeBERT embeddings, and SA-BiLSTM classification to SHAP explainability." },
      { src: "/synopsis/fig2-shap-python.png", caption: "Figure 2. SHAP global and local explanations for the Python dataset (Study 1): Meaningful Clarity (MC) and Naming Conformance (NC) dominate across all three readability classes." },
    ],
    results: { python: "97.36%", cpp: "97.94%", baseline: "82.00% (SMO)" },
    xai: "SHAP identifies Meaningful Clarity (MC) and Naming Conformance (NC) as dominant features.",
  },
  {
    id: "Study 2",
    name: "ECRVR-MVEL",
    full: "Explainable Code Readability Classification Using Vector Representations and Majority Voting-Based Ensemble Learning",
    color: "violet",
    stages: [
      { name: "Stage 1 — Text preprocessing", body: "Tokenisation, comment/whitespace normalisation, automatic language detection (file extension, keywords, syntax), and sequence encoding to a uniform max length." },
      { name: "Stage 2 — CodeBERT embeddings", body: "The [CLS] token from CodeBERT's 12th layer yields a 768-dim snippet representation; a sliding-window strategy handles snippets exceeding the 512-token limit." },
      { name: "Stage 3 — Graph Convolutional Network", body: "Three GCN layers aggregate neighbouring node information weighted by cosine similarity, capturing structural dependencies up to three hops; global mean pooling produces a graph-level vector." },
      { name: "Stage 4 — Deep Belief Network", body: "Stacked Restricted Boltzmann Machines, trained greedily and unsupervised, extract hierarchical probabilistic representations from the code embedding space." },
      { name: "Stage 5 — Bidirectional Temporal Convolutional Network", body: "Forward and backward dilated convolutions with exponentially growing dilation and residual connections capture sequential token dependencies in both directions." },
      { name: "Stage 6 — Weighted majority voting + Nadam", body: "GCN, DBN, and Bi-TCN outputs are combined via learned per-classifier weights; Nadam (Nesterov-accelerated Adam) optimises all three." },
      { name: "Stage 7 — LIME explainability", body: "LIME perturbs the input snippet, queries the ensemble, and fits an interpretable linear surrogate whose coefficients identify the most influential tokens/features per prediction." },
    ],
    figures: [
      { src: "/synopsis/fig3-ecrvr-mvel-workflow.png", caption: "Figure 3. ECRVR-MVEL high-level workflow: input data passes through the deep learning ensemble, model interpretability (LIME), and feeds back for improvement." },
      { src: "/synopsis/fig4-lime-python.png", caption: "Figure 4. LIME explanations for Python snippet-level predictions (Study 2): MC and readability score are the dominant features, consistent with SHAP findings in Study 1." },
    ],
    results: { python: "98.15%", cpp: "98.38%", baseline: "90.11% (Neural Network)" },
    xai: "LIME confirms MC, PRED, and NC as primary snippet-level readability drivers.",
  },
  {
    id: "Study 3",
    name: "EESQA-DELMOA",
    full: "Empirical Evaluation of Software Quality Assessment through Developer Experience Level Using Metaheuristic Optimisation Algorithms",
    color: "rose",
    stages: [
      { name: "Stage 1 — Min-max normalisation", body: "26 developer activity features (commit frequency, ownership, project breadth, review participation, experience metrics) are scaled to [0,1]: x_norm = (x − x_min) / (x_max − x_min)." },
      { name: "Stage 2 — BAHB feature selection", body: "The Bio-inspired Artificial Hummingbird Behaviour algorithm selects 18 of 26 features via guided, territorial, and migration search strategies, balancing error rate and subset size." },
      { name: "Stage 3 — SSNN classification", body: "A Simplified Spiking Neural Network classifies each profile into ESE / SA / SE / NSE / BOT / UNK using leaky integrate-and-fire dynamics over a 25-step window: V_m(t) = V_m(t−1)·δ + Σ(w_i · s_i(t))." },
      { name: "Stage 4 — AMBOA hyperparameter tuning", body: "The Adaptive Migration Butterfly Optimisation Algorithm tunes learning rate, decay δ, threshold θ, and network width, with scent intensity I_b = s·P^a and a linearly decaying inertia weight ω(t) = ω_max − (ω_max − ω_min)·t/t_max." },
    ],
    figures: [
      { src: "/synopsis/fig5-eesqa-delmoa-workflow.jpeg", caption: "Figure 5. EESQA-DELMOA workflow: developer dataset passes through Min-Max normalisation, BAHB feature selection, SSNN classification, and AMBOA hyperparameter tuning." },
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
  "Lawrie, D., Morrell, C., Field, H., & Binkley, D. (2006). What's in a Name? A Study of Identifiers. Proceedings of the 14th IEEE International Conference on Program Comprehension, 3–12.",
  "Buse, R. P. L., & Weimer, W. R. (2008). A Metric for Software Readability. Proceedings of the 2008 International Symposium on Software Testing and Analysis, 121–130.",
  "Feng, Z., Guo, D., Tang, D., Duan, N., Feng, X., Gong, M., Shou, L., Qin, B., Liu, T., Jiang, D., & Zhou, M. (2020). CodeBERT: A Pre-Trained Model for Programming and Natural Language. Findings of EMNLP 2020, 1536–1547.",
  "Lundberg, S. M., & Lee, S.-I. (2017). A Unified Approach to Interpreting Model Predictions. Advances in Neural Information Processing Systems 30, 4765–4774.",
  "Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). \"Why Should I Trust You?\": Explaining the Predictions of Any Classifier. Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 1135–1144.",
  "Perez, Q., Urtado, C., & Vauttier, S. (2023). Dataset of Open-Source Software Developers Labeled by Their Experience Level. Data in Brief, 46, 108842.",
  "Mi, Q., Xiao, Z., Zhan, Y., Tao, L., & Zhang, J. (2025). Towards Explainable Code Readability Classification With Graph Neural Networks. Journal of Software: Evolution and Process, 37(9), e70048.",
  "Scalabrino, S., Bavota, G., Vendome, C., Linares-Vásquez, M., Poshyvanyk, D., & Oliveto, R. (2019). Automatically Assessing Code Understandability. IEEE Transactions on Software Engineering, 45(10), 1012–1031.",
  "Tokumoto, S., Kusumoto, S., & Imai, R. (2025). Development and Evaluation of a Deep Learning-Based Model for Source Code Quality Classification Using Industrial Data. Journal of Software Engineering Practice, 6(1), 1–19.",
  "Salamea, M. J., & Farré, C. (2019). Influence of Developer Factors on Code Quality: A Data Study. Proceedings of the 2019 IEEE 19th International Conference on Software Quality, Reliability and Security Companion, 120–125.",
  "Yadav, A., Singh, S. K., & Suri, J. S. (2019). Ranking of Software Developers Based on Expertise Score for Bug Triaging. Information and Software Technology, 112, 1–17.",
  "Garousi, V., Tarhan, A., Pfahl, D., Coşkunçay, A., & Demirörs, O. (2019). Correlation of Critical Success Factors with Success of Software Projects: An Empirical Investigation. Software Quality Journal, 27, 429–493.",
];

const publications = [
  {
    title: "Evaluating Identifier Readability Using CodeBERT Embeddings and Self-Attention Bi-LSTM with Explainable Modeling",
    venue: "ETASR, Vol. 16, No. 3, pp. 36731–36737, Jun. 2026",
    status: "Published",
  },
  {
    title: "Explainable Artificial Intelligence with Hybrid Ensemble Learning based Automated Code Comprehension Prediction",
    venue: "ETASR, Vol. 16, No. 4, pp. 37326–37331, Aug. 2026",
    status: "Published",
  },
  {
    title: "Feature Optimization with Simplified Spiking Neural Network for Developer-Centric Software Quality Assessment",
    venue: "ETASR, 2026 (in production)",
    status: "Accepted",
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
        <a
          href="/synopsis/Synopsis-Final.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors"
        >
          Download full synopsis (PDF) ↓
        </a>
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
          <p>Code is read far more often than it is written. A developer working on an established codebase may spend the majority of their working time reading — tracing control flow, identifying the purpose of a function, inferring the intent behind a variable name. This activity, program comprehension, is the cognitive foundation on which all maintenance, debugging, and extension work rests.</p>
          <p>The quality of source code is multidimensional. At the finest grain, it resides in the names chosen for individual identifiers. At a broader grain, quality is visible in the structure of a code snippet. At the broadest grain, quality reflects the experience and discipline of the developer who wrote the code. Each level has historically been studied in isolation.</p>
          <div>
            <h3 className="font-semibold text-white">Background</h3>
            <p className="mt-2">Identifier naming has been studied since the 1970s; Lawrie et al. (2006) and Binkley et al. (2009) showed better identifier names reduce comprehension time. Code readability at the snippet level has attracted attention since Buse and Weimer (2010) introduced their annotated dataset. Developer experience as a predictor of software quality has been explored through proxy measures — commit count, project tenure, bug-fix rate — but few studies directly classify experience level from code and link it to quality outcomes.</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Problem statement</h3>
            <p className="mt-2">Automated tools for assessing source code quality have remained narrow in scope. Most measure surface properties — line length, indentation, operator count — while ignoring the semantic content experienced developers actually attend to, particularly identifier naming quality. No existing system assesses code comprehensibility at more than one level of abstraction, and none provides interpretable explanations alongside its predictions. This thesis addresses the absence of a unified, explainable framework evaluating program comprehension at the identifier, code snippet, and developer experience levels within a single coherent methodology.</p>
          </div>
        </GlassCard>
      </section>

      {/* 3. Literature Survey */}
      <section>
        <SectionHeader eyebrow="3" title="Literature survey" description="Organized by the three levels addressed in the thesis." />
        <div className="mt-6 space-y-4">
          {literatureSurvey.map((l) => (
            <GlassCard key={l.id}>
              <p className="text-xs font-mono text-cyan-400">{l.id}</p>
              <h4 className="mt-1 text-sm font-semibold text-white">{l.title}</h4>
              <p className="mt-2 text-xs leading-6 text-slate-400">{l.body}</p>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="mt-4 text-sm leading-7 text-slate-300">
          <p><strong className="text-white">Summary of research gap:</strong> {researchGap}</p>
        </GlassCard>
      </section>

      {/* 4. Scope */}
      <section>
        <SectionHeader eyebrow="4" title="Scope of the thesis" description="" />
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

      {/* 5. Objectives */}
      <section>
        <SectionHeader eyebrow="5" title="Objectives" description="" />
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

      {/* 6. Research Methodology */}
      <section>
        <SectionHeader eyebrow="6" title="Research methodology" description="Three studies, each targeting a different level of the program comprehension hierarchy." />
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
                <ol className="space-y-3">
                  {s.stages.map((stage, i) => (
                    <li key={i} className="text-xs text-slate-300">
                      <span className="font-semibold text-slate-200">{stage.name}.</span>{" "}
                      <span className="text-slate-400">{stage.body}</span>
                    </li>
                  ))}
                </ol>
                <div className="rounded-xl bg-white/5 p-4 text-xs space-y-2 min-w-[180px] self-start">
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
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {s.figures.map((fig) => (
                  <figure key={fig.src} className="rounded-xl bg-white/5 p-3">
                    <img src={fig.src} alt={fig.caption} className="w-full rounded-lg bg-white" />
                    <figcaption className="mt-2 text-[11px] leading-5 text-slate-500">{fig.caption}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-400 italic">{s.xai}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 7. Contributions */}
      <section>
        <SectionHeader eyebrow="7" title="Major contributions" description="" />
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

      {/* 8. Results */}
      <section>
        <SectionHeader eyebrow="8" title="Results and discussion" description="" />

        <GlassCard className="mt-6 text-sm leading-7 text-slate-300">
          <p className="text-xs uppercase tracking-widest text-cyan-400">8.1 Dataset description</p>
          <p className="mt-2">Studies 1 and 2 use the <em>Code Snippets: Insights and Readability</em> dataset (Kaggle). Python: 560 High, 560 Medium, 561 Low (1,681 total). C++: 502 High, 500 Medium, 502 Low (1,504 total).</p>
          <p className="mt-2">Study 3 uses the developer-experience dataset published by Perez, Urtado, and Vauttier (2023) on Zenodo: 703 profiles across six classes — ESE (69), SA (29), SE (73), NSE (17), BOT (10), UNK (505). 26 features are available; 18 are selected by BAHB.</p>
        </GlassCard>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { label: "IRAF-XADL Python", val: "97.36%", sub: "test acc. (98.13% train) · vs 82.00% SMO" },
            { label: "IRAF-XADL C++", val: "97.94%", sub: "test acc. (98.42% train) · vs 79.33% MLP" },
            { label: "ECRVR-MVEL Python", val: "98.15%", sub: "vs 90.11% Neural Network" },
            { label: "ECRVR-MVEL C++", val: "98.38%", sub: "vs 94.58% Naïve Bayes" },
            { label: "EESQA-DELMOA", val: "98.74%", sub: "test acc. (98.10% train) · vs 94.78% CNN" },
            { label: "Execution Time", val: "8.27s", sub: "vs 14.57–17.33s for all baselines" },
          ].map((m) => (
            <GlassCard key={m.label} className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest">{m.label}</p>
              <p className="mt-2 text-3xl font-bold text-cyan-300">{m.val}</p>
              <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
            </GlassCard>
          ))}
        </div>

        <figure className="mt-4 rounded-xl bg-white/5 p-3">
          <img src="/synopsis/fig6-eesqa-delmoa-comparison.png" alt="Figure 6. EESQA-DELMOA versus baseline methods" className="w-full max-w-2xl mx-auto rounded-lg bg-white" />
          <figcaption className="mt-2 text-center text-[11px] leading-5 text-slate-500">Figure 6. EESQA-DELMOA versus baseline methods: accuracy, precision, recall, and F1-score. EESQA-DELMOA reaches 98.74% accuracy, outperforming all compared methods.</figcaption>
        </figure>

        <GlassCard className="mt-4 text-sm leading-7 text-slate-300 space-y-3">
          <p><strong className="text-white">8.5 Cross-study observations.</strong> SHAP (Study 1) and LIME (Study 2) independently identify Meaningful Clarity (MC) and Naming Conformance (NC) as primary readability drivers — across two independent explainability methods, two levels of analysis, two classifiers, and two programming languages. This is the first cross-method, cross-level XAI validation in the code readability literature.</p>
          <p>The accuracy progression from identifiers (97.36%) to snippets (98.15%) to developer profiles (98.74%) does not imply the developer level is the easiest problem — the datasets and task definitions differ. It does confirm that deep learning methods with appropriate architecture choices and explainability integration are effective across all three levels.</p>
        </GlassCard>
      </section>

      {/* 9. Conclusions */}
      <section>
        <SectionHeader eyebrow="9" title="Summary and conclusions" description="" />
        <GlassCard className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
          <p>This thesis set out to address a fundamental limitation of existing automated code quality tools: their restriction to a single level of analysis, and their lack of interpretable outputs. Three studies were conducted, each targeting a different level of the program comprehension hierarchy.</p>
          <p>Study 1 (IRAF-XADL) demonstrated that identifier readability can be assessed with 97%+ accuracy using a rich feature set with CodeBERT embeddings. SHAP analysis revealed that Meaningful Clarity and Naming Conformance are dominant — a practically useful finding for naming guidelines. Study 2 (ECRVR-MVEL) showed that ensemble diversity consistently outperforms individual classifiers; LIME confirmed the same features generalize to snippet level. Study 3 (EESQA-DELMOA) showed developer experience can be classified in 8.27 seconds — practical for CI/CD and team management.</p>
          <p>Together, the three studies establish that program comprehension can be assessed automatically, accurately, and interpretably at every level of the software development artefact hierarchy.</p>
          <p><strong className="text-white">Limitations and future directions.</strong> The framework is limited to Python and C++ for code-level studies; extension to Java/JavaScript is straightforward given available AST parsers. The developer-experience dataset is imbalanced (Unknown accounts for 72% of instances); oversampling or further data collection would likely improve minority-class recall. Fine-tuning CodeBERT rather than using it as a frozen feature extractor is expected to improve performance further, at increased training cost. Integrating all three levels into a unified pipeline — where identifier-level scores feed snippet-level assessment, which in turn informs developer-level profiling — is the most natural extension of this work.</p>
        </GlassCard>
      </section>

      {/* 10. References */}
      <section>
        <SectionHeader eyebrow="10" title="List of references" description="" />
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

      {/* 11. Publications */}
      <section>
        <SectionHeader eyebrow="11" title="List of publications" description="" />
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
