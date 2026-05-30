export interface IdentifierFeatures {
  MC: number; NC: number; OL: number; DR: number; PR: number;
  LF: number; CC: number; SA: number; CLS: number; PRED: number;
}

export interface IdentifierInfo {
  name: string;
  kind: string;
  tokens: string[];
  features: IdentifierFeatures;
  attention_weight: number;
  influence: "High" | "Medium" | "Low";
}

export interface PredictResponse {
  label: "High" | "Medium" | "Low";
  confidence: number;
  probabilities: { Low: number; Medium: number; High: number };
  identifiers: IdentifierInfo[];
  structural: {
    num_of_lines: number;
    code_length: number;
    cyclomatic_complexity: number;
    indents: number;
    loop_count: number;
    line_length: number;
    identifiers: number;
  };
  explanation: string;
  identifier_quality_score: number;
  identifier_quality_label: "High" | "Medium" | "Low";
}
