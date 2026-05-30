import pandas as pd
import re
import json
import spacy

with open("readability/scoring/naming_style_config.json", "r") as f:
    config = json.load(f)

forbidden_patterns = [re.compile(pat) for pat in config.get("forbidden_patterns", [])]
project_terms_dict = config.get("project_terms", {})
exceptions = config.get("exceptions", {})
length_limits = config.get("length_limits", {})
enforcement_flags = config.get("enforcement_flags", {})

nlp = spacy.load("en_core_web_sm")

def first_token_pos(word):
    doc = nlp(word)
    if len(doc) == 0:
        return ""
    return doc[0].pos_

def is_exception(name):
    if name in exceptions.get("identifiers", []):
        return True
    for pat in exceptions.get("patterns", []):
        if re.match(pat, name):
            return True
    return False

def naming_conformance_score(identifier, language="python", id_type="variable", project=None):
    name = str(identifier)
    if is_exception(name):
        return 1.0  # Exception: always gets full score

    project = str(project).strip().lower() if project else None

    # Get project overrides if any
    project_override = config.get("project_overrides", {}).get(project, {}).get(id_type, {})
    lang_rules = project_override if project_override else config.get(language, {}).get(id_type, {})
    regex = lang_rules.get("regex", None)
    weights = lang_rules.get("weights", {"regex": 0.4, "forbidden": 0.2, "project": 0.1, "pos": 0.2, "length": 0.1})

    penalties = 0.0

    # 1. Regex style match
    if regex and not re.match(regex, name):
        penalties += weights.get("regex", 0.4)

    # 2. Forbidden patterns
    forbidden_list = config.get("forbidden_patterns", [])
    if project in config.get("project_overrides", {}):
        forbidden_list += config["project_overrides"][project].get("forbidden_patterns", [])
    if enforcement_flags.get("forbidden_pattern_check_enabled", True):
        for pat in forbidden_list:
            if re.match(pat, name):
                penalties += weights.get("forbidden", 0.2)
                break

    # 3. Allowed/forbidden abbreviations
    if enforcement_flags.get("abbreviation_check_enabled", True):
        for abb in config.get("forbidden_abbreviations", []):
            if abb in name.lower():
                penalties += 0.1
        if config.get("allowed_abbreviations"):
            # Optional: can enforce only allowed abbreviations (if you want stricter)
            pass

    # 4. Allowed prefixes/suffixes
    allowed_prefixes = config.get("allowed_prefixes", {}).get(language, {}).get(id_type, [])
    if allowed_prefixes and not any(name.startswith(prefix) for prefix in allowed_prefixes):
        penalties += 0.1

    allowed_suffixes = config.get("allowed_suffixes", {}).get(language, {}).get(id_type, [])
    if allowed_suffixes and not any(name.endswith(suffix) for suffix in allowed_suffixes):
        penalties += 0.1

    # 5. Project-specific terms (suffix/keyword)
    if project:
        project_terms = project_terms_dict.get(project, [])
        if project_terms and not any(term in name.lower() for term in project_terms):
            penalties += weights.get("project", 0.1)

    # 6. Part-of-speech (function/variable)
    if enforcement_flags.get("pos_check_enabled", True):
        if id_type.lower() in ["function", "method"]:
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

    # 7. Length check
    if enforcement_flags.get("length_check_enabled", True):
        lim = length_limits.get(id_type, {})
        min_len, max_len = lim.get("min", 1), lim.get("max", 40)
        if not (min_len <= len(name) <= max_len):
            penalties += weights.get("length", 0.1)

    # Final score
    score = max(0.0, 1.0 - penalties)
    return round(score, 2)

# Example usage
df = pd.read_csv("readability/scoring/dataset/bad_identifiers_100k_MC.csv")
df["NC"] = df.apply(
    lambda row: naming_conformance_score(
        row["Identifier Name"],
        language=str(row.get("Language", "python")).strip().lower(),
        id_type=str(row.get("Identifier Type", "variable")).strip().lower(),
        project=str(row.get("Project", "")).strip().lower()
    ),
    axis=1
)
df.to_csv("readability/scoring/dataset/bad_identifiers_100k_MC_NC.csv", index=False)
print("Done. Output saved as bad_identifiers_100k_NC.csv")
