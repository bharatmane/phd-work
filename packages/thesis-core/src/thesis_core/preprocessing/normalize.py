import re

from thesis_core.config import PreprocessingConfig

STOPWORDS = {"the", "a", "an", "temp", "value"}


def normalize_identifier(identifier: str, config: PreprocessingConfig) -> list[str]:
    working = identifier

    if config.split_camel_case:
        working = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", working)
    if config.split_snake_case:
        working = working.replace("_", " ")
    if config.split_digits:
        working = re.sub(r"([A-Za-z])(\d)", r"\1 \2", working)
        working = re.sub(r"(\d)([A-Za-z])", r"\1 \2", working)

    tokens = [token for token in working.split() if token]

    if config.lowercase:
        tokens = [token.lower() for token in tokens]
    if config.remove_stopwords:
        tokens = [token for token in tokens if token not in STOPWORDS]

    return tokens
