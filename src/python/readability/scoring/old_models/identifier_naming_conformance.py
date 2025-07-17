import pandas as pd
import re
import json
import spacy

# Load config file
with open("naming_style_config.json", "r") as f:
    config = json.load(f)

forbidden_patterns = [re.compile(pat) for pat in config.get("forbidden_patterns", [])]
project_terms_dict = config.get("project_terms", {})

# Load spaCy English model for POS tagging (if needed)
nlp = spacy.load("en_core_web_sm")

def first_token_pos(word):
    doc = nlp(word)
    if len(doc) == 0:
        return ""
    return doc[0].pos_  # "VERB", "NOUN", etc.

def naming_conformance_score(identifier, language="python", id_type="variable", project=None):
    name = str(identifier)
    lang_rules = config.get(language, {}).get(id_type, {})
    regex = lang_rules.get("regex", None)
    weights = lang_rules.get("weights", {"regex":0.5, "forbidden":0.2, "project":0.1, "pos":0.2})
    penalties = 0.0

    # 1. Regex style match
    if regex and not re.match(regex, name):
        penalties += weights.get("regex", 0.5)

    # 2. Forbidden patterns
    for pat in forbidden_patterns:
        if pat.match(name):
            penalties += weights.get("forbidden", 0.2)
            break

    # 3. Project-specific terms (suffix, keyword etc.)
    if project:
        project_terms = project_terms_dict.get(str(project).lower(), [])
        if project_terms and not any(term in name.lower() for term in project_terms):
            penalties += weights.get("project", 0.1)

    # 4. Part-of-speech (optional, for function/variable)
    if id_type.lower() in ["function", "method"]:
        # Function/method name should start with verb
        tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
        if tokens:
            first_pos = first_token_pos(tokens[0])
            if first_pos != "VERB":
                penalties += weights.get("pos", 0.2)
    elif id_type.lower() == "variable":
        tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
        if tokens:
            first_pos = first_token_pos(tokens[0])
            if first_pos not in {"NOUN", "ADJ"}:
                penalties += weights.get("pos", 0.2)

    # Final score
    score = max(0.0, 1.0 - penalties)
    return round(score, 2)

# Load your identifiers CSV
df = pd.read_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC_ST_LN_MC.csv.csv")  # (add MC before this step)

# Add NC score
df["NC"] = df.apply(
    lambda row: naming_conformance_score(
        row["Identifier Name"],
        language=str(row.get("Language", "python")).strip().lower(),
        id_type=str(row.get("Identifier Type", "variable")).strip().lower(),
        project=str(row.get("Project", "")).strip().lower()
    ),
    axis=1
)

df.to_csv("readability/scoring/dataset/consolidated_identifiers_all_with_SC_ST_LN_MC_NC.csv", index=False)
print("Done. Output saved as consolidated_identifiers_all_with_SC_ST_LN_MC_NC.csv")
