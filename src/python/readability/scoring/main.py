import pandas as pd
from generate_mc_score import meaningful_clarity_score
from domain_relevance import process_identifiers
from compute_optimal_length_piecewise import optimal_length_score_piecewise
from natural_language_readability import naming_conformance_score

INPUT_CSV = "readability/scoring/dataset/survey_readability_data_sample.csv"
OUTPUT_CSV = "readability/scoring/dataset/survey_readability_data_sample_with_scores.csv"

df = pd.read_csv(INPUT_CSV)

# Compute Meaningful Clarity (MC)
df["MC"] = df.apply(
    lambda row: meaningful_clarity_score(
        row["Identifier Name"],
        language=str(row.get("Language", "python")).strip().lower(),
        id_type=str(row.get("Identifier Type", "variable")).strip().lower(),
        project=str(row.get("Project", "")).strip().lower()
    ),
    axis=1
)

# Compute Domain Relevance (DR)
df["DR"] = df.apply(
    lambda row: process_identifiers(
        row["Identifier Name"],
        language=str(row.get("Language", "python")).strip().lower(),
        id_type=str(row.get("Identifier Type", "variable")).strip().lower(),
        project=str(row.get("Project", "")).strip().lower()
    ),
    axis=1
)

# Compute Optimal Length (OL)
df["OL"] = df.apply(
    lambda row: optimal_length_score_piecewise(
        row["Identifier Name"],
        id_type=str(row.get("Identifier Type", "variable")).strip().lower()
    ),
    axis=1
)

# Compute Naming Conformance (NC)
df["NC"] = df.apply(
    lambda row: naming_conformance_score(
        row["Identifier Name"],
        language=str(row.get("Language", "python")).strip().lower(),
        id_type=str(row.get("Identifier Type", "variable")).strip().lower(),
        project=str(row.get("Project", "")).strip().lower()
    ),
    axis=1
)

df.to_csv(OUTPUT_CSV, index=False)
print(f"Done. Output saved as {OUTPUT_CSV}")
