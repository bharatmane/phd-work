import ast

from thesis_core.types import IdentifierRecord


def extract_python_identifiers(source: str, source_path: str = "") -> list[IdentifierRecord]:
    tree = ast.parse(source)
    identifiers: list[IdentifierRecord] = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            identifiers.append(IdentifierRecord("python", node.name, "function", source_path))
            for argument in node.args.args:
                identifiers.append(IdentifierRecord("python", argument.arg, "parameter", source_path))
        elif isinstance(node, ast.ClassDef):
            identifiers.append(IdentifierRecord("python", node.name, "class", source_path))
        elif isinstance(node, ast.Name):
            identifiers.append(IdentifierRecord("python", node.id, "variable", source_path))

    return identifiers
