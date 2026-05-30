"""The ten linguistically and cognitively grounded readability features
described in Paper 1, Section 3.2.

Each function returns a value in [0, 1] (higher = more readable on that
dimension). The exception is OptimalLength which is a soft Gaussian
centred on an optimal range. CLS combines several features into a single
cognitive-load score.

Where the paper says "X is computed", this module makes the formula
explicit and deterministic so SHAP can meaningfully attribute its
contribution.
"""

from __future__ import annotations

import math
import re
import string
from collections import Counter
from functools import lru_cache
from typing import Iterable

import numpy as np

from .preprocess import Identifier

# --------------------------------------------------------------------------
# Small built-in resources so the demo runs offline. For production work,
# swap these for NLTK / WordNet / a real domain corpus.
# --------------------------------------------------------------------------

# A compact English-vocabulary check using a frequency-ranked common-word set.
# Enough to discriminate "name" from "xq1".
_COMMON_WORDS = {
    # ~ 200 high-frequency words covering most identifier tokens
    "name", "value", "data", "list", "array", "string", "number", "count",
    "size", "length", "item", "user", "id", "email", "address", "price",
    "total", "subtotal", "tax", "rate", "amount", "quantity", "qty",
    "product", "order", "cart", "shopping", "account", "balance", "owner",
    "bank", "deposit", "withdraw", "transfer", "transaction", "record",
    "table", "row", "column", "field", "type", "kind", "level", "high",
    "low", "medium", "input", "output", "result", "response", "request",
    "message", "error", "exception", "log", "debug", "trace", "info",
    "warn", "warning", "fatal", "config", "setting", "option", "param",
    "parameter", "argument", "default", "initial", "final", "first",
    "last", "next", "previous", "current", "node", "head", "tail", "left",
    "right", "parent", "child", "root", "leaf", "tree", "graph", "edge",
    "vertex", "weight", "cost", "distance", "path", "queue", "stack",
    "buffer", "cache", "memory", "storage", "database", "query", "result",
    "schema", "model", "view", "controller", "service", "client", "server",
    "session", "token", "key", "secret", "password", "login", "logout",
    "create", "read", "update", "delete", "fetch", "get", "post", "put",
    "find", "search", "filter", "sort", "merge", "split", "join", "map",
    "reduce", "filter", "process", "calculate", "compute", "validate",
    "check", "verify", "convert", "transform", "render", "display", "show",
    "hide", "open", "close", "start", "stop", "pause", "resume", "begin",
    "end", "load", "save", "import", "export", "encode", "decode",
    "encrypt", "decrypt", "send", "receive", "publish", "subscribe",
    "listen", "handle", "manage", "track", "monitor", "report", "analyse",
    "analyze", "summary", "average", "minimum", "maximum", "mean", "median",
    "standard", "deviation", "variance", "ratio", "percent", "percentage",
    "factor", "score", "rank", "rating", "grade", "metric", "feature",
    "label", "target", "class", "category", "group", "cluster", "segment",
    "chunk", "batch", "epoch", "iteration", "step", "phase", "stage",
    "fibonacci", "palindrome", "factorial", "prime", "binary", "search",
    "reverse", "swap", "vowel", "character", "char", "word", "text",
    "line", "page", "section", "paragraph", "sentence", "letter",
    "digit", "alpha", "numeric", "lower", "upper", "title", "case",
    "linked", "sequence", "occurrence", "occurrences", "maximum",
}

# Crude domain vocabularies. Domain inferred per snippet by majority match.
_DOMAINS = {
    "finance":  {"price", "tax", "amount", "balance", "account", "deposit",
                 "withdraw", "bank", "owner", "transfer", "transaction", "rate"},
    "data":     {"data", "list", "array", "record", "row", "column",
                 "table", "field", "schema", "database", "query"},
    "web":      {"user", "email", "address", "request", "response", "session",
                 "token", "login", "logout", "client", "server", "service"},
    "compute":  {"calculate", "compute", "factorial", "fibonacci", "prime",
                 "sort", "search", "reverse", "swap", "merge", "binary"},
    "text":     {"string", "text", "word", "letter", "character", "vowel",
                 "palindrome", "case", "title", "upper", "lower"},
    "container":{"node", "head", "tail", "tree", "graph", "queue", "stack",
                 "buffer", "linked", "sequence"},
}

_VOWELS = set("aeiouy")


# ========================== feature definitions =========================
def meaningful_clarity(ident: Identifier) -> float:
    """MC — fraction of normalised tokens that are real English words."""
    if not ident.tokens:
        return 0.0
    real = sum(1 for t in ident.tokens if t in _COMMON_WORDS or _looks_wordlike(t))
    return real / len(ident.tokens)


def naming_conformance(ident: Identifier) -> float:
    """NC — does the identifier follow the language convention for its kind?

    Python:  classes → PascalCase, functions/params/vars → snake_case
    C++:     same conventions in practice
    """
    raw = ident.raw
    if ident.kind == "class":
        return 1.0 if re.fullmatch(r"[A-Z][A-Za-z0-9]*", raw) else 0.0
    # functions / params / vars
    if re.fullmatch(r"[a-z][a-z0-9_]*", raw):
        return 1.0
    # forgive trailing underscores common in C++
    if re.fullmatch(r"[a-z][a-z0-9_]*_?", raw):
        return 0.8
    # camelCase is acceptable but slightly off Python style
    if re.fullmatch(r"[a-z][A-Za-z0-9]*", raw):
        return 0.6
    return 0.2


def optimal_length(ident: Identifier, ideal_low: int = 6, ideal_high: int = 18) -> float:
    """OL — soft Gaussian peaking inside [ideal_low, ideal_high].

    Single-character names get a hard penalty. Names longer than 30 chars
    are also penalised, but more softly.
    """
    n = len(ident.raw)
    if n == 0:
        return 0.0
    if n == 1:
        return 0.05                               # one-letter — bad
    if ideal_low <= n <= ideal_high:
        return 1.0
    # Gaussian decay outside the optimum window
    centre = (ideal_low + ideal_high) / 2
    sigma  = (ideal_high - ideal_low)
    return float(math.exp(-((n - centre) ** 2) / (2 * sigma ** 2)))


def domain_relevance(ident: Identifier, snippet_domain: set[str]) -> float:
    """DR — fraction of tokens that belong to the snippet's inferred domain."""
    if not ident.tokens or not snippet_domain:
        return 0.0
    hits = sum(1 for t in ident.tokens if t in snippet_domain)
    return hits / len(ident.tokens)


def pronounceability(ident: Identifier) -> float:
    """PR — vowel ratio in the original (lowercased) identifier characters."""
    letters = [c for c in ident.raw.lower() if c.isalpha()]
    if not letters:
        return 0.0
    vowels = sum(1 for c in letters if c in _VOWELS)
    ratio = vowels / len(letters)
    # ideal vowel ratio for English is roughly 0.35–0.45 — peak there
    return float(math.exp(-((ratio - 0.4) ** 2) / (2 * 0.15 ** 2)))


def lexical_familiarity(ident: Identifier, corpus_counts: Counter | None = None) -> float:
    """LF — average corpus frequency of the tokens (normalised to 0..1).

    Uses the snippet/dataset token counter if given; falls back to the built-in
    common-word set so the function is still meaningful at demo time.
    """
    if not ident.tokens:
        return 0.0
    if corpus_counts:
        total = sum(corpus_counts.values()) or 1
        scores = [corpus_counts.get(t, 0) / total for t in ident.tokens]
        # rescale so common tokens approach 1.0
        max_score = max(scores) if scores else 0.0
        return float(min(1.0, sum(scores) / len(scores) * (10 / (max_score + 1e-6))))
    real = sum(1 for t in ident.tokens if t in _COMMON_WORDS)
    return real / len(ident.tokens)


def context_consistency(ident: Identifier, peers: list[Identifier]) -> float:
    """CC — average Jaccard similarity of this identifier's tokens with peers.

    The paper uses embedding similarity; for a deterministic, offline-safe
    proxy we use token-set Jaccard. The choice is replaceable from the
    outside via the trainer if real embeddings are desired.
    """
    if not ident.tokens or len(peers) <= 1:
        return 0.0
    my = set(ident.tokens)
    sims = []
    for other in peers:
        if other is ident:
            continue
        their = set(other.tokens)
        if not their:
            continue
        sims.append(len(my & their) / max(1, len(my | their)))
    return float(np.mean(sims)) if sims else 0.0


def scope_appropriateness(ident: Identifier) -> float:
    """SA — identifier length relative to its scope size.

    Short names are acceptable in tight scopes; long names are expected
    in wide scopes. Score is high when length matches scope demand.
    """
    n = len(ident.raw)
    s = max(1, ident.scope_size)
    if s <= 3:                                    # very tight scope
        return 1.0 if 1 <= n <= 6 else max(0.0, 1 - (n - 6) / 20)
    if s <= 10:                                   # local scope
        return 1.0 if 3 <= n <= 14 else 0.7
    # wide scope: long names expected
    return 1.0 if n >= 6 else float(n / 6)


def cognitive_load(ident: Identifier,
                   mc: float, lf: float, pr: float) -> float:
    """CLS — combined cognitive-load score (high = easy to comprehend).

    Defined in the paper as integrating familiarity, clarity, and an
    ambiguity penalty. We use the (1 - underscore-density * sigma) form
    as the ambiguity penalty.
    """
    underscores = ident.raw.count("_") / max(1, len(ident.raw))
    ambiguity_penalty = math.exp(-3 * underscores)
    return float(0.4 * mc + 0.3 * lf + 0.2 * pr + 0.1 * ambiguity_penalty)


def predictability(ident: Identifier, peers: list[Identifier]) -> float:
    """PRED — token-frequency proxy for an n-gram language model.

    Returns 1.0 if every token co-occurs with at least one peer's tokens
    (i.e. the identifier is "predictable" from its neighbours).
    """
    if not ident.tokens or len(peers) <= 1:
        return 0.0
    neighbour_tokens: Counter[str] = Counter()
    for other in peers:
        if other is ident:
            continue
        neighbour_tokens.update(other.tokens)
    if not neighbour_tokens:
        return 0.0
    hits = sum(1 for t in ident.tokens if neighbour_tokens[t] > 0)
    return hits / len(ident.tokens)


# ============================== helpers =================================
def _looks_wordlike(token: str) -> bool:
    """Heuristic: a token looks like a real word if it has >= 3 letters,
    contains a vowel, and isn't dominated by digits."""
    letters = [c for c in token if c.isalpha()]
    if len(letters) < 3:
        return False
    if not any(c in _VOWELS for c in letters):
        return False
    if sum(c.isdigit() for c in token) > len(token) / 2:
        return False
    return True


def _infer_domain(all_tokens: Iterable[str]) -> set[str]:
    """Pick the domain with the highest hit count for this snippet."""
    counts = {dom: sum(1 for t in all_tokens if t in vocab)
              for dom, vocab in _DOMAINS.items()}
    best = max(counts, key=counts.get)
    return _DOMAINS[best] if counts[best] > 0 else set()


# ========================== public computation ==========================
FEATURE_NAMES = ["MC", "NC", "OL", "DR", "PR", "LF", "CC", "SA", "CLS", "PRED"]


def compute_features(identifiers: list[Identifier],
                     corpus_counts: Counter | None = None) -> np.ndarray:
    """Return an (N, 10) matrix of feature values for N identifiers."""
    if not identifiers:
        return np.zeros((0, 10), dtype=np.float32)

    all_tokens = [t for ident in identifiers for t in ident.tokens]
    domain = _infer_domain(all_tokens)

    rows: list[list[float]] = []
    for ident in identifiers:
        mc  = meaningful_clarity(ident)
        nc  = naming_conformance(ident)
        ol  = optimal_length(ident)
        dr  = domain_relevance(ident, domain)
        pr  = pronounceability(ident)
        lf  = lexical_familiarity(ident, corpus_counts)
        cc  = context_consistency(ident, identifiers)
        sa  = scope_appropriateness(ident)
        cls_ = cognitive_load(ident, mc, lf, pr)
        pred = predictability(ident, identifiers)
        rows.append([mc, nc, ol, dr, pr, lf, cc, sa, cls_, pred])

    return np.asarray(rows, dtype=np.float32)


def snippet_feature_vector(identifiers: list[Identifier],
                           corpus_counts: Counter | None = None) -> np.ndarray:
    """Aggregate per-identifier features into one snippet-level vector
    (mean of the 10 dims). Used by the SA-BiLSTM head when running on a
    single snippet at inference time."""
    feats = compute_features(identifiers, corpus_counts)
    if feats.shape[0] == 0:
        return np.zeros(10, dtype=np.float32)
    return feats.mean(axis=0)


if __name__ == "__main__":  # self-test
    from .preprocess import extract_and_normalise
    code = (
        "def calculate_total_price(item_prices, tax_rate):\n"
        "    subtotal = sum(item_prices)\n"
        "    return subtotal * (1 + tax_rate)\n"
    )
    ids = extract_and_normalise(code, "python")
    mat = compute_features(ids)
    print("Identifier              ", "  ".join(FEATURE_NAMES))
    for ident, row in zip(ids, mat):
        print(f"{ident.raw:>22}  " + "  ".join(f"{v:.2f}" for v in row))
