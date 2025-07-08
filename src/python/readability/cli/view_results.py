import pandas as pd
import argparse

def view_results(file, threshold=0.0):
    df = pd.read_json(file)
    df = df[df["total_score"] >= threshold]
    df_sorted = df.sort_values(by="total_score", ascending=False)
    print(df_sorted[["file", "name", "type", "total_score"]].to_string(index=False))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="View filtered and ranked identifier results from JSON.")
    parser.add_argument("file", help="Path to results JSON file")
    parser.add_argument("--minscore", type=float, default=0.0, help="Minimum total score to include")
    args = parser.parse_args()

    view_results(args.file, args.minscore)
