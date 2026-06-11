export type NavLink = {
  label: string;
  to: string;
};

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type MethodologyStage = {
  step: string;
  title: string;
  detail: string;
};

export type ReadabilityParameter = {
  code: string;
  title: string;
  detail: string;
};

export type Paper = {
  id: string;
  title: string;
  status: "Draft" | "Draft — Under Submission" | "Submitted" | "Accepted" | "Accepted — In Proof" | "Published";
  problem: string;
  method: string;
  keyContribution: string;
  abstract: string;
  gap: string;
  objective: string;
  dataset: string;
  methodology: string[];
  results: string[];
  contribution: string;
  limitations: string[];
  futureWork: string[];
  venue: string;
  doi: string;
  citation: string;
  presentationMode: string;
  pdfUrl?: string;
};

export type GlossaryTerm = {
  term: string;
  meaning: string;
};
