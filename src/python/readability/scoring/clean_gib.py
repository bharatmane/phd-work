# Paths
bad_path = "readability/scoring/dataset/bad.txt"  # Your gibberish file
good_path = "readability/scoring/dataset/google-10000-english.txt"  # Good words file
clean_bad_path = "readability/scoring/dataset/bad_clean.txt"  # Output

# Load good words into a set
with open(good_path, encoding='utf-8') as f:
    good_words = set(line.strip().lower() for line in f if line.strip())

# Load bad words (gibberish), deduplicate and clean
seen = set()
removed_overlap = []
cleaned_bad = []

with open(bad_path, encoding='utf-8') as f:
    for line in f:
        word = line.strip().lower()
        # Skip empty or short
        if not word or len(word) <= 2:
            continue
        # Skip if already seen (deduplicate)
        if word in seen:
            continue
        seen.add(word)
        # Skip if it's in the good words set
        if word in good_words:
            removed_overlap.append(word)
            continue
        cleaned_bad.append(word)

# Write cleaned gibberish to new file
with open(clean_bad_path, "w", encoding='utf-8') as f:
    for word in cleaned_bad:
        f.write(word + "\n")

print(f"Original bad.txt lines: {len(seen)}")
print(f"Removed (present in good words): {len(removed_overlap)}")
print(f"Cleaned bad.txt lines: {len(cleaned_bad)}")
if removed_overlap:
    print("Removed because they overlap with good words:", removed_overlap)
else:
    print("No overlap found.")

print(f"Cleaned gibberish saved to: {clean_bad_path}")
