from collections import Counter


def build_readability_features(tokens: list[str]) -> dict[str, float]:
    length = max(len(tokens), 1)
    joined = "".join(tokens)
    unique_ratio = len(set(tokens)) / length
    vowel_ratio = sum(1 for char in joined if char in "aeiou") / max(len(joined), 1)

    counts = Counter(tokens)
    repetition_penalty = max(counts.values()) / length

    return {
        "MC": min(unique_ratio + 0.2, 1.0),
        "NC": 1.0 if all(token.islower() for token in tokens) else 0.5,
        "OL": 1.0 if 1 <= len(joined) <= 24 else 0.4,
        "DR": min(0.4 + unique_ratio, 1.0),
        "PR": min(vowel_ratio * 2, 1.0),
        "LF": 0.7 if joined.isascii() else 0.4,
        "CC": min(1.0 - (repetition_penalty - 0.2), 1.0),
        "SA": 0.8 if len(tokens) <= 4 else 0.5,
        "CLS": max(0.1, 1.0 - (len(joined) / 40)),
        "PRED": min(0.5 + unique_ratio / 2, 1.0),
    }
