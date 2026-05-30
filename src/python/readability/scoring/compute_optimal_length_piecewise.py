import pandas as pd
import re

def optimal_length_score_piecewise(identifier, id_type="function"):
    name = str(identifier)
    l_char = len(name)
    # Test-related heuristics
    is_test = any(x in name.lower() for x in ['test', 'suite', 'case'])

    # Plateau boundaries (tune as needed)
    if id_type == "class":
        min_good, max_good = 7, 28
        if is_test:
            min_good, max_good = 8, 36
    elif id_type == "function":
        min_good, max_good = 8, 30
        if is_test:
            min_good, max_good = 10, 40
    elif id_type == "variable":
        min_good, max_good = 6, 20
        if is_test:
            min_good, max_good = 7, 25
    else:
        min_good, max_good = 7, 25

    # Too short: linear penalty, never below 0.1
    if l_char < min_good:
        score = max(0.1, (l_char - 1) / (min_good - 1))
    # Too long: gentle linear drop, never below 0.1
    elif l_char > max_good:
        over = l_char - max_good
        penalty = max(0.1, 1 - over / 12.0)  # 12 chars "grace" period
        score = penalty
    else:
        score = 1.0

    # Optionally: If you want test functions/classes never to go below 0.5, add here
    if is_test and id_type in ("function", "class"):
        score = max(score, 0.5)

    return round(score, 2)

# Apply to DataFrame
df = pd.read_csv("readability/scoring/dataset/bad_identifiers_100k_MC_NC.csv")

# Add 'len' column for identifier length
df["len"] = df["Identifier Name"].astype(str).apply(len)

# Calculate OL as before
df["OL"] = df.apply(
    lambda row: optimal_length_score_piecewise(
        row["Identifier Name"],
        id_type=str(row["Identifier Type"]).strip().lower()
    ),
    axis=1
)

df.to_csv("readability/scoring/dataset/bad_identifiers_100k_MC_NC_OL.csv", index=False)
print("Done. Output saved as bad_identifiers_100k_MC_NC_OL.csv")
