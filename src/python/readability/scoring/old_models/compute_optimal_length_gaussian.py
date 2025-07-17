import pandas as pd
import re
import numpy as np

def gaussian_score(value, mu, sigma):
    return np.exp(-((value - mu) ** 2) / (2 * sigma ** 2))

def optimal_length_score_combined(identifier, id_type="function"):
    name = str(identifier)
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
    l_tok = len(tokens)
    l_char = len(name)
    # Test-related heuristics
    is_test = any(x in name.lower() for x in ['test', 'suite', 'case'])

    if id_type == "class":
        mu_tok, sigma_tok = 4.5, 2.0
        mu_char, sigma_char = 30, 10
        if is_test:
            mu_char = 36
            sigma_char = 12
    elif id_type == "function":
        # more relaxed: higher mu, wider sigma
        mu_tok, sigma_tok = 5.0, 2.4
        mu_char, sigma_char = 38, 12
        if is_test:
            mu_char = 45
            sigma_char = 15
    elif id_type == "variable":
        mu_tok, sigma_tok = 3.5, 1.7
        mu_char, sigma_char = 20, 8
        if is_test:
            mu_char = 24
            sigma_char = 10
    else:
        mu_tok, sigma_tok = 3.0, 1.5
        mu_char, sigma_char = 18, 6

    ol_tok = gaussian_score(l_tok, mu_tok, sigma_tok)
    ol_char = gaussian_score(l_char, mu_char, sigma_char)
    ol = max(ol_tok, ol_char)

    # Less harsh minimum for function/test identifiers
    if id_type == "function" and is_test:
        ol = max(ol, 0.5)
    elif id_type == "function":
        ol = max(ol, 0.3)
    elif id_type == "class" and is_test:
        ol = max(ol, 0.5)
    elif id_type == "class":
        ol = max(ol, 0.3)
    else:
        ol = max(ol, 0.2)
    return round(ol, 2)

# Example for applying to your DataFrame:
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC.csv")
df["OL"] = df.apply(
    lambda row: optimal_length_score_combined(
        row["Identifier Name"],
        id_type=str(row["Identifier Type"]).strip().lower()
    ),
    axis=1
)
df.to_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC_DR_NC_OL.csv", index=False)
print("Done. Output saved as consolidated_identifiers_all_with_MC_DR_NC_OL.csv")
