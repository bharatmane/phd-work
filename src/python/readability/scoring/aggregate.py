import nltk
from nltk.corpus import wordnet
from nltk import pos_tag, word_tokenize

nltk.download("punkt", quiet=True)
nltk.download("averaged_perceptron_tagger", quiet=True)
nltk.download("wordnet", quiet=True)

def is_readable_natural(name):
    # Split by camel case, underscore, etc.
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z]|$)|\d+', name)
    words = [t.lower() for t in tokens]
    known_words = sum(1 for word in words if wordnet.synsets(word))
    return known_words / len(words) if words else 0

def check_role_conformity(name, ident_type):
    tokens = word_tokenize(name)
    pos = pos_tag(tokens)
    if not pos:
        return 0.0
    tag = pos[0][1]
    if ident_type == "class" and tag.startswith("NN"):  # noun
        return 1.0
    elif ident_type == "function" and tag.startswith("VB"):  # verb
        return 1.0
    return 0.3

def score_identifier(ident, domain_model, config):
    import re
    name = ident["name"]
    ident_type = ident["type"]
    length = ident["length"]

    scores = {
        "semantic_clarity": 1.0 if "_" in name else 0.5,
        "stylistic_convention": 1.0 if name.islower() else 0.5,
        "length_appropriateness": 1.0 if 3 <= length <= 20 else 0.3,
        "natural_language_readability": round(is_readable_natural(name), 2),
        "domain_relevance": domain_model.get_similarity_score(name),
        "syntactic_role_conformity": check_role_conformity(name, ident_type)
    }

    total = 0
    for k, v in scores.items():
        weight = config["weights"].get(k, 1.0)
        total += weight * v
    scores["total_score"] = round(total, 3)
    return scores
