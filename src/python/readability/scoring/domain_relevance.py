import pandas as pd
import re
import numpy as np
from scipy.spatial.distance import cosine
from collections import defaultdict
import nltk
from nltk.corpus import wordnet

# Download NLTK WordNet if not already downloaded
nltk.download('wordnet')

# Load GloVe vectors for similarity calculation
def load_glove_vectors(glove_file_path):
    word_vectors = {}
    with open(glove_file_path, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.split()
            word = parts[0]
            vector = np.array(parts[1:], dtype='float32')
            word_vectors[word] = vector
    return word_vectors

# Get cosine similarity between two words
def get_cosine_similarity(word1, word2, word_vectors):
    if word1 not in word_vectors or word2 not in word_vectors:
        return 0.0
    return 1 - cosine(word_vectors[word1], word_vectors[word2])

# Load the enriched domain terms CSV
def load_enriched_domain_terms(file_path):
    domain_terms = defaultdict(set)
    enriched_df = pd.read_csv(file_path)
    enriched_df = enriched_df.dropna(subset=['Project', 'Domain Term'])  # Drop NaN values

    for _, row in enriched_df.iterrows():
        domain = row['Project'].strip().lower()
        term = row['Domain Term'].strip().lower()
        domain_terms[domain].add(term)

    return domain_terms

# Expand abbreviations
def expand_abbreviation(term):
    abbreviation_map = {
        "cust": "customer", "acct": "account", "bal": "balance", "id": "identifier",
        "str": "string", "int": "integer", "bool": "boolean", "func": "function",
        "param": "parameter", "args": "arguments", "url": "uniform resource locator",
        "db": "database", "api": "application programming interface", "net": "network",
        "ui": "user interface", "config": "configuration", "msg": "message", "req": "request",
        "resp": "response", "app": "application", "log": "log", "err": "error", "res": "resource"
    }
    return abbreviation_map.get(term, term)

# Function to get synonyms of a word using WordNet
def get_synonyms(word):
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().lower())  # Add synonyms to the set
    return synonyms

# Normalize and enrich domain terms (CamelCase to readable terms)
def normalize_and_enrich(term):
    term = re.sub(r'([a-z])([A-Z])', r'\1 \2', term)  # camelCase to camel case
    term = re.sub(r'_', ' ', term)  # snake_case to snake case
    term = term.lower().strip()  # Normalize to lowercase and strip spaces
    term = expand_abbreviation(term)
    return term

# DR score calculation considering synonyms and domain terms
def dr_score_with_synonyms(identifier, repo, domain_terms, word_vectors):
    name = str(identifier)
    tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', name)
    tokens = [t.lower() for t in tokens if t]

    if len(tokens) == 0:
        return 0.0

    domain = repo.strip().lower()
    if domain not in domain_terms:
        return 0.0

    tokens_for_dr = [t for t in tokens if t not in {"get", "set", "update", "is", "has", "send", "open", "close", "create", "delete", "add", "remove", "compute"}]
    if not tokens_for_dr:
        return 0.0

    match_scores = []
    for tok in tokens_for_dr:
        # Check for direct match
        if tok in domain_terms[domain]:
            match_scores.append(1.0)
        else:
            # Check for synonym match
            synonyms = get_synonyms(tok)
            match_found = False
            for synonym in synonyms:
                if synonym in domain_terms[domain]:
                    match_scores.append(0.5)  # Partial match score for synonym
                    match_found = True
                    break

            if not match_found:
                # Calculate cosine similarity if no direct or synonym match
                similarities = [get_cosine_similarity(tok, domain_term, word_vectors) for domain_term in domain_terms[domain]]
                best_match = max(similarities, default=0.0)
                if best_match > 0.5:
                    match_scores.append(0.5)
                else:
                    match_scores.append(0.0)

    dr = sum(match_scores) / len(tokens_for_dr)
    return round(dr, 2)

# Process identifiers and calculate DR score
def process_identifiers(df, domain_terms, word_vectors):
    df["DR"] = df.apply(
        lambda row: dr_score_with_synonyms(
            row["Identifier Name"],
            repo=str(row["Project"]).strip(),
            domain_terms=domain_terms,
            word_vectors=word_vectors
        ),
        axis=1
    )
    return df

# Main function
def main():
    # File paths
    enriched_terms_file = "readability/domain_model/domain_terms/general_terms_3000.csv"
    identifiers_file = "readability/scoring/dataset/bad_identifiers_100k_MC_NC_OL.csv"
    glove_file_path = "readability/scoring/dataset/glove.6B/glove.6B.300d.txt"  # Your GloVe file path

    # Load GloVe vectors for word similarity
    word_vectors = load_glove_vectors(glove_file_path)

    # Load enriched domain terms
    domain_terms = load_enriched_domain_terms(enriched_terms_file)

    # Load identifiers CSV
    df = pd.read_csv(identifiers_file)

    # Process identifiers and calculate DR scores
    df = process_identifiers(df, domain_terms, word_vectors)

    # Save output to new CSV
    output_file = "readability/scoring/dataset/bad_identifiers_100k_MC_NC_OL_DR.csv"
    df.to_csv(output_file, index=False)

    print(f"Processing complete. Results saved to {output_file}")

# Run the main function
if __name__ == "__main__":
    main()

