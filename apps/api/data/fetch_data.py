"""Optional dataset fetcher.

Pulls source files from a configurable list of public GitHub repositories
and auto-labels each into High / Medium / Low using a readability heuristic
based on (a) average identifier length, (b) line length, (c) comment density,
(d) ratio of single-character names.

Usage:
    python data/fetch_data.py --language python --target-count 500 \
                              --out data/big_python.csv
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import sys
import time
import zipfile
from pathlib import Path
from urllib.request import Request, urlopen


# Default repos. Add your own to taste.
DEFAULT_REPOS = {
    "python": [
        "https://github.com/psf/requests/archive/refs/heads/main.zip",
        "https://github.com/psf/black/archive/refs/heads/main.zip",
        "https://github.com/pallets/flask/archive/refs/heads/main.zip",
    ],
    "cpp": [
        "https://github.com/nlohmann/json/archive/refs/heads/develop.zip",
        "https://github.com/google/googletest/archive/refs/heads/main.zip",
        "https://github.com/fmtlib/fmt/archive/refs/heads/master.zip",
    ],
}
EXT = {"python": ".py", "cpp": (".cpp", ".cc", ".h", ".hpp")}


def download_zip(url: str, timeout: int = 60) -> bytes:
    print(f"  downloading {url}")
    req = Request(url, headers={"User-Agent": "IRAF-XADL-demo/0.1"})
    with urlopen(req, timeout=timeout) as r:
        return r.read()


def iter_source_files(zip_bytes: bytes, exts: tuple[str, ...] | str):
    if isinstance(exts, str):
        exts = (exts,)
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            if not info.filename.endswith(exts):
                continue
            try:
                data = zf.read(info)
            except Exception:
                continue
            try:
                yield info.filename, data.decode("utf-8", errors="ignore")
            except Exception:
                continue


_IDENT_RE = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]{0,40}\b")
_KEYWORDS = {
    "if", "else", "for", "while", "return", "def", "class", "import",
    "from", "as", "in", "is", "and", "or", "not", "try", "except", "with",
    "int", "float", "double", "char", "bool", "void", "auto", "const",
    "namespace", "using", "struct", "public", "private", "protected",
    "include", "true", "false", "nullptr", "None", "True", "False",
}


def score_snippet(code: str) -> str:
    """Return Low / Medium / High based on simple readability heuristics."""
    lines = [ln for ln in code.splitlines() if ln.strip()]
    if not lines:
        return "Low"
    ids = [t for t in _IDENT_RE.findall(code) if t not in _KEYWORDS]
    if not ids:
        return "Low"
    avg_id_len = sum(len(t) for t in ids) / len(ids)
    avg_line_len = sum(len(ln) for ln in lines) / len(lines)
    single_char_ratio = sum(1 for t in ids if len(t) == 1) / len(ids)
    comment_lines = sum(1 for ln in lines if ln.lstrip().startswith(("#", "//", "/*", "*")))
    comment_ratio = comment_lines / len(lines)
    # readability heuristic — purely demo-grade
    score = 0
    score += 1 if avg_id_len >= 5 else 0
    score += 1 if avg_line_len <= 100 else 0
    score += 1 if single_char_ratio < 0.05 else 0
    score += 1 if comment_ratio >= 0.05 else 0
    if score >= 3:
        return "High"
    if score == 2:
        return "Medium"
    return "Low"


def slice_into_snippets(code: str, language: str) -> list[str]:
    """Split a source file into per-function / per-class snippets."""
    if language == "python":
        pattern = re.compile(r"^(?:class|def)\s+\w+.*?(?=^(?:class|def)\s+\w+|\Z)",
                              re.M | re.S)
    else:  # cpp
        pattern = re.compile(
            r"(?:[\w:*&<>,\s]+?)\s+\w+\s*\([^;{}]*\)\s*(?:const)?\s*\{[\s\S]*?\n\}",
            re.M)
    return [m.group(0).strip() for m in pattern.finditer(code) if m.group(0).strip()]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--language", choices=["python", "cpp"], required=True)
    p.add_argument("--target-count", type=int, default=300)
    p.add_argument("--out", required=True)
    p.add_argument("--repos", nargs="*", help="Override DEFAULT_REPOS")
    args = p.parse_args()

    repos = args.repos or DEFAULT_REPOS[args.language]
    exts = EXT[args.language]

    rows: list[dict[str, str]] = []
    per_label_cap = args.target_count // 3 + 5
    counts = {"Low": 0, "Medium": 0, "High": 0}

    for url in repos:
        if sum(counts.values()) >= args.target_count:
            break
        try:
            zb = download_zip(url)
        except Exception as exc:
            print(f"  ! failed: {exc}", file=sys.stderr)
            continue
        for filename, code in iter_source_files(zb, exts):
            snippets = slice_into_snippets(code, args.language)
            for snip in snippets:
                if len(snip) < 80 or len(snip) > 1200:
                    continue
                label = score_snippet(snip)
                if counts[label] >= per_label_cap:
                    continue
                rows.append({"code": snip, "readability_level": label})
                counts[label] += 1
                if sum(counts.values()) >= args.target_count:
                    break
            if sum(counts.values()) >= args.target_count:
                break
        time.sleep(0.5)

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["code", "readability_level"])
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {len(rows)} rows -> {args.out}")
    print(f"Label counts: {counts}")


if __name__ == "__main__":
    main()
