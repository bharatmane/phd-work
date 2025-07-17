import math
import pickle

ACCEPTED_CHARS = 'abcdefghijklmnopqrstuvwxyz '
POS = {char: idx for idx, char in enumerate(ACCEPTED_CHARS)}

def normalize(text):
    return [c.lower() for c in text if c.lower() in ACCEPTED_CHARS]

def ngram2(seq):
    filtered = normalize(seq)
    for i in range(len(filtered) - 1):
        yield filtered[i], filtered[i+1]

def avg_transition_prob(text, mat):
    log_prob = 0.0
    count = 0
    for a, b in ngram2(text):
        log_prob += mat[POS[a]][POS[b]]
        count += 1
    if count == 0:
        return 0.0
    return math.exp(log_prob / count)

def train(good_file, bad_file, model_file):
    k = len(ACCEPTED_CHARS)
    counts = [[10 for _ in range(k)] for _ in range(k)]  # Laplace smoothing

    with open(good_file, encoding='utf-8') as f:
        for line in f:
            for a, b in ngram2(line.strip()):
                counts[POS[a]][POS[b]] += 1

    # log probabilities
    for i, row in enumerate(counts):
        total = float(sum(row))
        for j in range(k):
            row[j] = math.log(row[j] / total)

    # Find the probability of each line
    with open(good_file, encoding='utf-8') as fg:
        good_lines = [line.strip() for line in fg if line.strip()]
    with open(bad_file, encoding='utf-8') as fb:
        bad_lines = [line.strip() for line in fb if line.strip()]

    good_probs = [avg_transition_prob(l, counts) for l in good_lines]
    bad_probs = [avg_transition_prob(l, counts) for l in bad_lines]

    min_good = min(good_probs)
    max_bad = max(bad_probs)
    print(f"min_good: {min_good:.5f}, max_bad: {max_bad:.5f}")

    # Find overlapping bad lines
    overlaps = []
    for l, prob in zip(bad_lines, bad_probs):
        if prob >= min_good:
            overlaps.append((l, prob))

    if overlaps:
        print("\nThe following 'bad' lines are too similar to 'good':")
        for l, prob in overlaps:
            print(f"[prob={prob:.5f}] {l}")
    else:
        print("No overlaps found!")

    assert min_good > max_bad, "Overlap in good/bad probs! Improve training data."

    # Threshold and save model as before
    thresh = (min_good + max_bad) / 2
    pickle.dump({'mat': counts, 'thresh': thresh}, open(model_file, 'wb'))

if __name__ == "__main__":
    train(
        'readability/scoring/dataset/google-10000-english.txt',
        'readability/scoring/dataset/bad_clean.txt',
        'gib_model.pki'
    )
