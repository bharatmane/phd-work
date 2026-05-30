import type { MethodologyStage, ReadabilityParameter } from "../types";

export const methodologyStages: MethodologyStage[] = [
  {
    step: "01",
    title: "Source Code Dataset",
    detail: "Curated Python and C++ source corpora form the basis for controlled identifier readability analysis.",
  },
  {
    step: "02",
    title: "AST-based Identifier Extraction",
    detail: "Identifiers are extracted structurally from syntax trees rather than from naive token streams.",
  },
  {
    step: "03",
    title: "Preprocessing and Normalization",
    detail: "camelCase splitting, snake_case splitting, digit separation, lowercase normalization, stopword removal, and lemmatization prepare identifiers for analysis.",
  },
  {
    step: "04",
    title: "Ten Readability Parameters",
    detail: "Human-centered factors capture clarity, style, context, and mental effort beyond raw token length.",
  },
  {
    step: "05",
    title: "CodeBERT Embeddings",
    detail: "Contextual embeddings represent identifier semantics and code-informed language patterns.",
  },
  {
    step: "06",
    title: "Self-Attention BiLSTM Classification",
    detail: "Bidirectional sequence modeling plus attention estimates High, Medium, and Low readability classes.",
  },
  {
    step: "07",
    title: "AdamW + SHAP",
    detail: "Optimization stabilizes training while SHAP explains which signals drove the classifier output.",
  },
];

export const readabilityParameters: ReadabilityParameter[] = [
  { code: "MC", title: "Meaningful Clarity", detail: "Whether an identifier communicates intent clearly." },
  { code: "NC", title: "Naming Conformance", detail: "Alignment with accepted naming conventions." },
  { code: "OL", title: "Optimal Length", detail: "Balance between brevity and expressiveness." },
  { code: "DR", title: "Domain Relevance", detail: "Use of domain-appropriate terminology." },
  { code: "PR", title: "Pronounceability", detail: "Ease of vocalization and discussion." },
  { code: "LF", title: "Lexical Familiarity", detail: "Use of recognizable vocabulary." },
  { code: "CC", title: "Context Consistency", detail: "Fit with surrounding naming patterns." },
  { code: "SA", title: "Scope Appropriateness", detail: "Suitability for local or broader context." },
  { code: "CLS", title: "Cognitive Load Score", detail: "Estimated effort required to interpret the name." },
  { code: "PRED", title: "Predictability", detail: "How expected the name is for the represented concept." },
];

export const performanceByLanguage = [
  { language: "Python", accuracy: "98.13%", precision: "97.22%", recall: "97.20%", f1: "97.21%" },
  { language: "C++", accuracy: "98.42%", precision: "97.62%", recall: "97.61%", f1: "97.61%" },
];

export const technicalConcepts = [
  "LibCST-based parsing for Python identifiers",
  "Tree-Sitter-based parsing for C++ identifiers",
  "Softmax prediction across High, Medium, and Low readability labels",
  "CodeBERT for contextual semantic representation",
  "Self-attention for highlighting influential tokens and features",
  "Explainable modeling through SHAP contribution analysis",
];
