import pandas as pd
import re
import enchant
from wordfreq import word_frequency
import spacy

# Initialize English dictionary and spaCy model for NLP
d = enchant.Dict("en_US")
nlp = spacy.load("en_core_web_sm")

# Load English common words (for demonstration, you can use a large word list)
with open("readability/scoring/dataset/google-10000-english.txt") as f:
    common_words = set(word.strip().lower() for word in f)

# Known common stopwords
stopwords = {"the", "of", "and", "for", "to", "from", "in", "on", "by", "with", "at"}

# Typical function/method verbs
function_verbs = {"get", "set", "update", "is", "has", "send", "open", "close", "create", "delete", "add", "remove", "compute"}

# Semantic Clarity (SC) function
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

# Natural Language Readability (NL) function
def is_pronounceable(word):
    vowels = set("aeiou")
    return any(v in word.lower() for v in vowels) or word.isupper()

def first_token_pos(word):
    doc = nlp(word)
    if len(doc) == 0:
        return ""
    return doc[0].pos_  # "VERB", "NOUN", "ADJ", etc.

def nl_score(identifier, id_type="variable"):
    name = str(identifier)
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
    tokens = [t.lower() for t in tokens if t]
    k = len(tokens)
    score = 1.0
    penalty = 0.0

    # Pronounceability penalty
    for tok in tokens:
        if not is_pronounceable(tok):
            penalty += 0.1
            break

    # Uncommon word penalty (use Google list)
    for tok in tokens:
        if tok not in common_words and len(tok) > 2 and not tok.isdigit():
            penalty += 0.1
            break

    # Stopword penalty (not at start/end, only if in middle)
    for idx, tok in enumerate(tokens[1:-1], start=1):
        if tok in stopwords:
            penalty += 0.1
            break

    # Word order penalty (using POS tagging)
    if k >= 2:
        first_pos = first_token_pos(tokens[0])
        if id_type.lower() == "function":
            if first_pos != "VERB":
                penalty += 0.1
        elif id_type.lower() == "variable":
            if first_pos not in {"NOUN", "ADJ"}:
                penalty += 0.1

    # Redundant/duplicated token penalty
    seen = set()
    for tok in tokens:
        if tok in seen:
            penalty += 0.2
            break
        seen.add(tok)

    final_score = max(0.0, score - penalty)
    return round(final_score, 2)

# Function to calculate Meaningful Clarity (MC)
def meaningful_clarity(identifier, id_type="variable"):
    # Get Semantic Clarity (SC) and Natural Language Readability (NL)
    sc = semantic_clarity(identifier)
    nl = nl_score(identifier, id_type)
    
    # Combine SC and NL to get MC (Mean or weighted average)
    mc = (sc + nl) / 2  # You can modify this to use weighted average if needed
    
    return round(mc, 2)

# --- USAGE EXAMPLE ---

# Load your CSV
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC_ST_LN.csv")

# Apply MC scorer
df["MC"] = df.apply(
    lambda row: meaningful_clarity(
        row["Identifier Name"],
        id_type=str(row["Identifier Type"]).strip().lower() if "Identifier Type" in row else "variable"
    ),
    axis=1
)

# Save to new CSV
df.to_csv("readability/scoring/dataset/consolidated_identifiers_all_with_MC.csv", index=False)
print("Done. Output saved as consolidated_identifiers_all_with_MC.csv")
