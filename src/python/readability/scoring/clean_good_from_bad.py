import pandas as pd

BAD_IDS = "readability/scoring/dataset/bad_identifiers_100k.csv"
WORDS_PATH = "readability/scoring/dataset/google-10000-english.txt"
OUTFILE = "readability/scoring/dataset/bad_identifiers_100k_cleaned.csv"

# Load list of good English words
with open(WORDS_PATH) as f:
    good_words = set(word.strip().lower() for word in f)

# Read your file
df = pd.read_csv(BAD_IDS)

# Assume identifier column is called 'Identifier Name', update if not
id_col = 'Identifier Name'
if id_col not in df.columns:
    raise Exception("Can't find 'Identifier Name' column.")

# Clean: remove duplicates (case-insensitive), keeping first occurrence
df['lower_name'] = df[id_col].str.lower()
df = df.drop_duplicates(subset=['lower_name'])

# Remove "good" English words
df = df[~df['lower_name'].isin(good_words)]

# Drop helper column
df = df.drop(columns=['lower_name'])

# Save
df.to_csv(OUTFILE, index=False)
print(f"Cleaned file saved as {OUTFILE}. Total rows: {len(df)}")
