import type { Metric } from "../types";

export const heroMetrics: Metric[] = [
  {
    label: "Model Accuracy",
    value: "≥ 98%",
    detail: "Achieved across all three papers on independent benchmark datasets.",
  },
  {
    label: "Abstraction Levels",
    value: "3",
    detail: "Identifier · Code block · Developer — one unified quality story.",
  },
  {
    label: "XAI in every paper",
    value: "SHAP + LIME",
    detail: "Every prediction is explained — not just accurate.",
  },
];

export const contributionMetrics: Metric[] = [
  {
    label: "AI-era relevance",
    value: "Quality Gates",
    detail: "As AI agents write code, automated readability assessment becomes the essential verification layer.",
  },
  {
    label: "BOT detection",
    value: "Paper 3",
    detail: "Classifies human vs automated code contributors — directly applicable to AI-generated codebases.",
  },
  {
    label: "Published",
    value: "ETASR 2026",
    detail: "Papers 1, 2, and 3 published in ETASR — Vol.16 No.3 and No.4. Scopus indexing for Paper 3 is pending.",
  },
];
