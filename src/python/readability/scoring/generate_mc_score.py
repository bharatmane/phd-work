import pandas as pd
import re
import spacy
import os

# --- CONFIG ---
WORDS_PATH = "readability/scoring/dataset/google-10000-english.txt"
INPUT_CSV = "readability/scoring/dataset/bad_identifiers_100k_MC.csv.csv"
OUTPUT_CSV = "readability/scoring/dataset/bad_identifiers_100k_NC_MC.csv"

# --- NLP SETUP ---
with open(WORDS_PATH) as f:
    common_words = set(word.strip().lower() for word in f)
stopwords = {"the", "of", "and", "for", "to", "from", "in", "on", "by", "with", "at"}
nlp = spacy.load("en_core_web_sm")

def first_token_pos(word):
    doc = nlp(word)
    if len(doc) == 0:
        return ""
    return doc[0].pos_

def is_english_word(word):
    return word.lower() in common_words

def repeated_bigram(word):
    for i in range(len(word)-1):
        if word[i] == word[i+1]:
            return True
    return False

def is_probably_gibberish(token, allowed_short=None):
    from nostril import nonsense
    import re
    if allowed_short is None:
        allowed_short = {"i", "j", "k", "x", "y", "z"}
    token = str(token)
    token_l = token.lower()
    vowels = set("aeiou")
    if token_l in allowed_short:
        return False
    # Stricter for short non-English names
    if len(token) <= 8:
        if not is_english_word(token) and token_l not in allowed_short and not token.isupper():
            return True
        if token.isdigit() or not any(c.isalpha() for c in token):
            return True
        if not any(c in vowels for c in token_l):
            return True
        if len(re.findall(r"[a-zA-Z]", token)) > 2 and len(re.findall(r"\d", token)) > 2:
            return True
        if re.search(r"[a-zA-Z]+[0-9]+[a-zA-Z]+", token):
            return True
        if len(set(token_l)) == 1 and len(token) > 2:
            return True
        if re.search(r"([a-zA-Z0-9])\1{2,}", token):
            return True
        return False
    # 2. LONGER NAMES: Use Nostril + heuristics
    try:
        if nonsense(token):
            return True
    except ValueError:
        pass
    ratio = sum(1 for c in token_l if c in vowels) / max(1, len(token))
    if ratio < 0.15 or ratio > 0.85:
        return True
    if re.search(r"[bcdfghjklmnpqrstvwxyz]{5,}", token_l):
        return True
    if re.search(r"(qwe|wer|asd|sdf|dfg|fgh|ghj|hjk|jkl)", token_l):
        return True
    if len(re.findall(r"([a-zA-Z]+[0-9]+){2,}", token)) > 0:
        return True
    if len(set(token_l)) == 1 and len(token) > 2:
        return True
    return False

def meaningful_clarity_score(identifier, id_type="variable"):
    name = str(identifier)
    allowed_short = {"i", "j", "k", "x", "y", "z", "dx", "dt", "mrn", "id", "api", "uri"}
    if not name or name[0].isdigit():
        return 0.0
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
    tokens = [t for t in tokens if t]
    score = 1.0
    penalty = 0.0

    generic_words = {"obj", "object", "data", "info", "tmp", "temp", "val", "var", "stuff", "set", "element"}

    # --- Ultra-hard kill-switches ---
    # If name ≤10 and all tokens not English/allowed_short, score zero
    if (len(name) <= 10 and all(not is_english_word(t) and t.lower() not in allowed_short for t in tokens)
        and not name.isupper()):
        return 0.0
    # If >2 tokens and none are English or allowed_short
    if len(tokens) > 2 and all(not is_english_word(t) and t.lower() not in allowed_short for t in tokens):
        return 0.0
    # Gibberish by nostril/heuristics
    if is_probably_gibberish(name, allowed_short):
        return 0.0

    # --- Main penalty logic ---
    non_english_tokens = [t for t in tokens if not is_english_word(t) and t.lower() not in allowed_short]
    if len(non_english_tokens) == len(tokens):
        penalty += 0.7

    vowels = set('aeiou')
    if not any(any(v in tok.lower() for v in vowels) for tok in tokens):
        penalty += 0.4

    for t in tokens:
        if any(c.isdigit() for c in t) and any(c.isalpha() for c in t):
            penalty += 0.4     # stronger!
        if len(t) > 6 and not is_english_word(t):
            penalty += 0.2
        if repeated_bigram(t):
            penalty += 0.3     # stronger!

    # Mixed case with no English tokens gets a higher penalty now
    if (any(c.islower() for c in name) and any(c.isupper() for c in name)):
        if not any(is_english_word(tok) for tok in tokens):
            penalty += 0.7

    if name.lower() in generic_words:
        penalty += 0.2

    if len(set(tokens)) < len(tokens):
        penalty += 0.1

    if len(name) <= 2 and name.lower() not in allowed_short:
        penalty += 0.1

    if len(tokens) == 1 and not is_english_word(tokens[0]) and len(tokens[0]) > 2:
        penalty += 0.6     # stronger

    if len(tokens) > 1 and all(len(t) == 1 and t.lower() not in allowed_short for t in tokens):
        penalty += 0.3

    # NLP-based POS check
    if len(tokens) > 0 and id_type.lower() == "variable":
        first_pos = first_token_pos(tokens[0])
        if not first_pos or first_pos not in {"NOUN", "ADJ"}:
            penalty += 0.15

    if len(tokens) > 0 and id_type.lower() == "function":
        first_pos = first_token_pos(tokens[0])
        if not first_pos or first_pos != "VERB":
            penalty += 0.15

    final_score = max(0.0, round(score - penalty, 2))
    return final_score

# --- APPLY TO CSV ---
df = pd.read_csv(INPUT_CSV)
df["MC"] = df.apply(
    lambda row: meaningful_clarity_score(
        row["Identifier Name"],
        id_type=str(row["Identifier Type"]).strip().lower() if "Identifier Type" in row else "variable"
    ),
    axis=1
)
df.to_csv(OUTPUT_CSV, index=False)
print(f"Done. Output saved as {OUTPUT_CSV}")

# --- TEST CASES FOR VALIDATION ---
def test_cases():
    samples = [
        "getUserName", "count", "DataList", "Index", "tmp", "fooBarBaz",
        "UjWehqUIALmeQ", "tXElbECCpPu", "gAOiMAbaRQbidepm", "jHKFUSTSUFG",
        "123abc", "a1b2c3", "i", "j", "PIuLJipAlIgzhD", "sum", "user_count",
        "fetchDataFromAPI", "data2", "ok", "Id", "xyz", "i1", "A"
    ]
    print("Sample\tMC\tGibberish?")
    for s in samples:
        print(f"{s}\t{meaningful_clarity_score(s):.2f}\t{is_probably_gibberish(s)}")

# Uncomment to run a quick validation
# test_cases()
