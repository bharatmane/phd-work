import os
import re
import spacy
from bs4 import BeautifulSoup
from collections import Counter
import csv

# Initialize spaCy NLP model for noun extraction
nlp = spacy.load("en_core_web_sm")

# Define the root directory where all repos and documentation folders are located
base_dir = r"C:\Users\bhara\source\repos\phd-work\src\python\modeling\raw-data"

# Define the mapping of repos to their documentation folder
repo_to_docs_folder = {
    "angular-cli": "angular.dev",
    "Autofac": "autofac.readthedocs.io",
    "commons-lang": "commons.apache.org",
    "d3": "d3",
    "Dapper": "dapper-plus.net",
    "django": "docs.djangoproject.com",
    "express": "expressjs.com",
    "flask": "flask.palletsprojects.com",
    "guava": "guava.wiki",
    "Hangfire": "docs.hangfire.io",
    "hibernate-orm": "docs.gradle.org",
    "IdentityServer": "docs.duendesoftware.com",
    "lodash": "lodash.com",
    "logging-log4j2": "logging.apache.org",
    "ngx-bootstrap": "docs.ngx-bootstrap.com",
    "NLog": "nlog.wiki",
    "numpy": "numpy.org",
    "pandas": "pandas.pydata.org",
    "react": "react.dev",
    "requests": "requests.readthedocs.io",
    "spring-framework": "docs.spring.io",
    "TypeScript": "TypeScript",
    "vue": "vuejs.org"
}

def extract_nouns_from_html(file_path):
    try:
        with open(file_path, encoding="utf-8", errors="ignore") as f:
            html = f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return []

    # Parse HTML using BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    
    # Remove unwanted sections (like footers, headers, and navigation)
    for tag in soup.find_all(["footer", "header", "nav", "aside", "script", "style"]):
        tag.decompose()
    
    text = soup.get_text()

    # Use spaCy to extract noun chunks
    doc = nlp(text)
    nouns = [chunk.text.lower() for chunk in doc.noun_chunks if len(chunk.text.split()) > 1]  # Avoid single tokens

    # Filter out non-relevant terms like "copyright", "privacy", etc.
    irrelevant_terms = ["copyright", "terms", "privacy", "rights", "usage", "next", "previous", "page"]
    nouns = [noun for noun in nouns if noun not in irrelevant_terms]

    return nouns

def create_domain_model_for_repo(repo_name, docs_folder, parent_dir=base_dir, top_n=100):
    domain_terms = Counter()

    repo_path = os.path.join(parent_dir, docs_folder)
    total_files = sum([len(files) for _, _, files in os.walk(repo_path)])

    # Progress log
    print(f"Processing repository: {repo_name}")
    print(f"Total documentation files: {total_files}")

    processed_files = 0

    # Loop through all files in the repo's docs folder
    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith((".html", ".md", ".rst")):  # Including markdown and reStructuredText files
                file_path = os.path.join(root, file)
                terms = extract_nouns_from_html(file_path)
                domain_terms.update(terms)

                # Progress log
                processed_files += 1
                if processed_files % 10 == 0:  # Log progress every 10 files
                    print(f"Processed {processed_files}/{total_files} files.")

    # Save the domain model (top N terms) as CSV (for better data structure)
    with open(f"{repo_name}_domain_terms.csv", mode='w', encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(['Term', 'Frequency'])
        for term, freq in domain_terms.most_common(top_n):
            writer.writerow([term, freq])

    print(f"Domain model for {repo_name} created. Saved to {repo_name}_domain_terms.csv.")

# --- USAGE EXAMPLE ---

# Process each repo and create its domain lexicon
for repo, docs_folder in repo_to_docs_folder.items():
    create_domain_model_for_repo(repo, docs_folder)
