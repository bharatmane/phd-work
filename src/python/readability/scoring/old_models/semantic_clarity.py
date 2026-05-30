import enchant
import re
import pandas as pd
from wordfreq import word_frequency
import os

d = enchant.Dict("en_US")

def semantic_clarity(identifier):
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)|\d+', str(identifier))
    tokens = [t.lower() for t in tokens]
    if not tokens:
        return 0.0
    def token_score(token):
        if d.check(token) or word_frequency(token, 'en') > 1e-5:
            return 1.0
        elif len(token) == 1 and token in {"i", "j", "x", "y"}:
            return 0.3
        elif len(token) <= 3:
            return 0.2
        else:
            return 0.0
    scores = [token_score(t) for t in tokens]
    return round(sum(scores) / len(scores), 2)

# Load your CSV from the correct location
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all.csv")

# Score each identifier
df["SC"] = df["Identifier Name"].apply(semantic_clarity)

# Save to new CSV
df.to_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC.csv", index=False)
print("Done. Output saved as scoring/dataset/consolidated_identifiers_all_with_SC.csv")
