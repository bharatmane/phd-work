import os
import json
import pandas as pd
import argparse
from identifier_extractor.core import extract_identifiers
from readability.scoring.old_models.aggregate import score_identifier
from domain_model.loader import DomainModel

def analyze_code(code_path, model_path, config_path, output_prefix):
    domain_model = DomainModel(model_path)
    identifiers = extract_identifiers(code_path)

    with open(config_path, 'r') as f:
        config = json.load(f)

    results = []
    for ident in identifiers:
        score = score_identifier(ident, domain_model, config)
        results.append({**ident, **score})

    # Save to JSON
    json_out = f"{output_prefix}.json"
    with open(json_out, 'w') as jf:
        json.dump(results, jf, indent=2)

    # Save to CSV
    csv_out = f"{output_prefix}.csv"
    df = pd.DataFrame(results)
    df.to_csv(csv_out, index=False)

    print(f"✅ Analysis complete. Results saved to: {json_out} and {csv_out}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze codebase identifiers for readability and domain alignment.")
    parser.add_argument("code_path", help="Source code file or directory")
    parser.add_argument("--model", default="models/domain_model.bin", help="Trained domain FastText model path")
    parser.add_argument("--config", default="config.json", help="Scoring weight configuration file")
    parser.add_argument("--output", default="results/analysis", help="Prefix for output files (CSV, JSON)")
    args = parser.parse_args()

    os.makedirs("results", exist_ok=True)
    analyze_code(args.code_path, args.model, args.config, args.output)
