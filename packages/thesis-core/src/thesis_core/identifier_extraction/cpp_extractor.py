from thesis_core.types import IdentifierRecord


def extract_cpp_identifiers(source: str, source_path: str = "") -> list[IdentifierRecord]:
    """Placeholder adapter for future Tree-Sitter integration."""

    identifiers: list[IdentifierRecord] = []
    for token in source.replace("(", " ").replace(")", " ").replace("{", " ").replace("}", " ").split():
        if token.isidentifier():
            identifiers.append(IdentifierRecord("cpp", token, "candidate", source_path))
    return identifiers
