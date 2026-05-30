"""Identifier extraction and normalisation (Paper 1, Section 3.1).

Python  → standard-library ast (robust, no external grammar).
C++     → regex-based extractor (good for the demo; swap in tree-sitter for production).

After extraction, identifiers are lexically normalised:
  - camelCase  →  ["camel", "case"]
  - snake_case →  ["snake", "case"]
  - digit/letter separation: file2Path → ["file", "2", "path"]
  - lowercase normalisation
Tokens are then cleaned: stop-word removal + lemmatisation.
"""

from __future__ import annotations

import ast
import re
from dataclasses import dataclass, field
from typing import Iterable

# ----------------------------- stop words -----------------------------
_CODE_STOPWORDS = {
    "var", "obj", "tmp", "temp", "val", "x", "y", "z", "i", "j", "k",
    "ret", "res", "result", "data", "item", "arr", "lst", "num", "ch",
    "fn", "func", "foo", "bar", "baz", "qux", "do", "the", "a", "an",
}
_ENGLISH_STOPWORDS = {
    "the", "a", "an", "of", "in", "to", "for", "on", "with", "by", "is",
    "and", "or", "not", "as", "at", "be", "are", "was", "were", "this",
    "that", "these", "those", "it", "its", "from", "into",
}

# ----------------------------- data class ------------------------------
@dataclass
class Identifier:
    """One identifier extracted from source code."""
    raw: str                 # original name as in source, e.g. "getUserName"
    kind: str                # "function" | "class" | "param" | "variable"
    tokens: list[str] = field(default_factory=list)  # ["get", "user", "name"]
    scope_size: int = 0      # lines of surrounding scope (approx., used by SA feature)

# ============================ PYTHON ===================================
class _PyIdentifierVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.ids: list[Identifier] = []
        self._scope_stack: list[int] = [10**6]  # outer = "infinite" scope

    # ---- helpers ----
    def _push_scope(self, node: ast.AST) -> int:
        # crude scope size = lines spanned
        size = (getattr(node, "end_lineno", 0) or 0) - (getattr(node, "lineno", 0) or 0)
        self._scope_stack.append(max(1, size))
        return size

    def _pop_scope(self) -> None:
        self._scope_stack.pop()

    def _scope(self) -> int:
        return self._scope_stack[-1]

    # ---- visitors ----
    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._push_scope(node)
        self.ids.append(Identifier(node.name, "function", scope_size=self._scope()))
        for arg in node.args.args:
            self.ids.append(Identifier(arg.arg, "param", scope_size=self._scope()))
        self.generic_visit(node)
        self._pop_scope()

    visit_AsyncFunctionDef = visit_FunctionDef  # treat the same

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._push_scope(node)
        self.ids.append(Identifier(node.name, "class", scope_size=self._scope()))
        self.generic_visit(node)
        self._pop_scope()

    def visit_Assign(self, node: ast.Assign) -> None:
        for target in node.targets:
            for name in _names_in_target(target):
                self.ids.append(Identifier(name, "variable", scope_size=self._scope()))
        self.generic_visit(node)

    def visit_AnnAssign(self, node: ast.AnnAssign) -> None:
        for name in _names_in_target(node.target):
            self.ids.append(Identifier(name, "variable", scope_size=self._scope()))
        self.generic_visit(node)


def _names_in_target(target: ast.AST) -> Iterable[str]:
    if isinstance(target, ast.Name):
        yield target.id
    elif isinstance(target, (ast.Tuple, ast.List)):
        for elt in target.elts:
            yield from _names_in_target(elt)


def extract_python(code: str) -> list[Identifier]:
    """Parse Python source and return its identifiers."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        # fall back to a regex pass if the snippet is incomplete
        return _extract_regex_fallback(code)
    visitor = _PyIdentifierVisitor()
    visitor.visit(tree)
    return visitor.ids


# ============================ C++ ======================================
# Pragmatic regex pass. For production, replace with tree-sitter-cpp.
_CPP_FN_RE   = re.compile(r"\b(?:[\w:*&<>,\s]+?)\s+(\w+)\s*\([^;{}]*\)\s*(?:const)?\s*\{")
_CPP_CLASS_RE = re.compile(r"\b(?:class|struct)\s+(\w+)")
_CPP_PARAM_RE = re.compile(r"\(([^)]*)\)")
_CPP_VAR_RE   = re.compile(
    r"\b(?:int|float|double|bool|char|void|auto|std::\w+|long|short|unsigned|signed)"
    r"(?:\s*<[^>]+>)?\s*\**\s*&?\s*(\w+)\s*(?:=|;|,)"
)


def extract_cpp(code: str) -> list[Identifier]:
    ids: list[Identifier] = []
    line_count = max(1, code.count("\n") + 1)

    for m in _CPP_CLASS_RE.finditer(code):
        ids.append(Identifier(m.group(1), "class", scope_size=line_count))

    for m in _CPP_FN_RE.finditer(code):
        ids.append(Identifier(m.group(1), "function", scope_size=line_count))
        params = m.group(0).split("(", 1)[1].rsplit(")", 1)[0]
        for part in params.split(","):
            part = part.strip()
            if not part:
                continue
            # last whitespace-separated token, stripped of *, &
            name = re.sub(r"[*&\[\]]", "", part.split()[-1]).strip()
            if re.fullmatch(r"[A-Za-z_]\w*", name):
                ids.append(Identifier(name, "param", scope_size=line_count))

    for m in _CPP_VAR_RE.finditer(code):
        ids.append(Identifier(m.group(1), "variable", scope_size=line_count))

    return ids


def _extract_regex_fallback(code: str) -> list[Identifier]:
    """Last-resort identifier extractor when AST parsing fails."""
    candidates = re.findall(r"\b[A-Za-z_][A-Za-z0-9_]{1,}\b", code)
    seen: set[str] = set()
    return [
        Identifier(c, "variable", scope_size=max(1, code.count("\n") + 1))
        for c in candidates if c not in seen and not seen.add(c)
    ]


# ====================== Normalisation pipeline =========================
_CAMEL_RE = re.compile(r"(?<!^)(?=[A-Z])")
_DIGIT_RE = re.compile(r"(\d+)")


def _split_token(token: str) -> list[str]:
    """camelCase + snake_case + digit/letter splitting."""
    # snake_case
    parts = token.split("_")
    # camelCase within each part
    expanded: list[str] = []
    for part in parts:
        if not part:
            continue
        expanded.extend(_CAMEL_RE.split(part))
    # digit/letter
    final: list[str] = []
    for piece in expanded:
        for sub in _DIGIT_RE.split(piece):
            if sub:
                final.append(sub.lower())
    return final


def _clean_tokens(tokens: list[str]) -> list[str]:
    """Drop stopwords; keep tokens of length >= 1; very lightweight lemmatisation."""
    cleaned: list[str] = []
    for t in tokens:
        if not t:
            continue
        if t in _CODE_STOPWORDS or t in _ENGLISH_STOPWORDS:
            continue
        # ultra-light lemmatisation: strip a trailing 's' if word is >3 chars
        if len(t) > 3 and t.endswith("s") and not t.endswith("ss"):
            t = t[:-1]
        cleaned.append(t)
    return cleaned


def normalise(identifiers: list[Identifier]) -> list[Identifier]:
    """Populate `tokens` for each Identifier in-place and return the same list."""
    for ident in identifiers:
        raw_tokens = _split_token(ident.raw)
        ident.tokens = _clean_tokens(raw_tokens)
    return identifiers


# ============================ public API ===============================
def extract_and_normalise(code: str, language: str) -> list[Identifier]:
    """Top-level: extract identifiers from `code`, normalise, return them."""
    language = language.lower()
    if language in {"py", "python"}:
        ids = extract_python(code)
    elif language in {"cpp", "c++", "cxx"}:
        ids = extract_cpp(code)
    else:
        raise ValueError(f"Unsupported language: {language}")
    return normalise(ids)


if __name__ == "__main__":  # quick self-test
    snippet = (
        "def calculate_total_price(item_prices, tax_rate):\n"
        "    subtotal = sum(item_prices)\n"
        "    return subtotal * (1 + tax_rate)\n"
    )
    for ident in extract_and_normalise(snippet, "python"):
        print(f"{ident.kind:>10}  {ident.raw:>22}  ->  {ident.tokens}")
