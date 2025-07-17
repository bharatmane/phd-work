import pandas as pd
import re

def length_appropriateness(identifier, id_type="variable"):
    name = str(identifier)
    char_len = len(name)
    # Tokenize: split camelCase, PascalCase, snake_case, kebab-case
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
    tokens += re.findall(r'_[a-zA-Z0-9]+', name)  # for snake_case pieces
    tokens = [t.strip("_").lower() for t in tokens if t.strip("_")]
    k = len(tokens)
    
    # Character length scoring
    L_min = 3
    L_max = 20
    if char_len < L_min:
        s_lenchars = char_len / L_min
    elif L_min <= char_len <= L_max:
        s_lenchars = 1.0
    elif char_len > L_max:
        penalty = (L_max + 5 - char_len) / 5
        s_lenchars = max(0.0, penalty)  # Zero out if <= 0
    else:
        s_lenchars = 1.0

    # Token length scoring: rules can be adapted by identifier type
    if id_type.lower() == "function":
        # Functions are often 2-4 tokens (verb + noun(s))
        if k == 0:
            s_lentokens = 0.5
        elif 2 <= k <= 4:
            s_lentokens = 1.0
        elif k == 5:
            s_lentokens = 0.5
        elif k >= 6:
            s_lentokens = 0.2
        else:  # k == 1
            s_lentokens = 0.8
    else:
        # Variables/classes: 1-3 tokens best
        if k == 0:
            s_lentokens = 0.5
        elif 1 <= k <= 3:
            s_lentokens = 1.0
        elif k == 4:
            s_lentokens = 0.8
        elif k == 5:
            s_lentokens = 0.5
        elif k >= 6:
            s_lentokens = 0.2
        else:
            s_lentokens = 1.0

    # Final length score: take minimum of both
    LN = min(s_lenchars, s_lentokens)
    return round(LN, 2)

# --- USAGE ---

# Load your data
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC_ST.csv")

# Compute Length Appropriateness
df["LN"] = df.apply(
    lambda row: length_appropriateness(
        row["Identifier Name"],
        id_type=str(row["Identifier Type"]).strip().lower() if "Identifier Type" in row else "variable"
    ),
    axis=1
)

# Save result
df.to_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC_ST_LN.csv", index=False)
print("Done. Output saved as consolidated_identifiers_all_with_SC_ST_LN.csv")
