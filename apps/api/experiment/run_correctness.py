"""
Step 2 — Execute each LLM solution against EvalPlus test cases and record
pass_ratio per sample.

Usage:
    python run_correctness.py --data data/evalplus --output data/correctness.jsonl

Output JSONL schema per line:
    {
      "model":      "codellama-34b-python",
      "benchmark":  "humaneval",
      "task_id":    "HumanEval/0",
      "code":       "def has_close_elements(...): ...",
      "pass_ratio": 0.0,   # fraction of test cases passed
      "correct":    false  # pass_ratio == 1.0
    }
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from tqdm import tqdm


def load_problems(jsonl_path: Path) -> dict[str, dict]:
    """Load benchmark problems keyed by task_id."""
    problems = {}
    with open(jsonl_path, encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            problems[row["task_id"]] = row
    return problems


def load_solutions(solutions_dir: Path, model_name: str, benchmark: str) -> list[dict]:
    """
    Load pre-generated solutions for a model from the EvalPlus release format.
    Tries common file patterns from the release ZIPs.
    """
    model_dir = solutions_dir / model_name
    candidates = [
        model_dir / f"{benchmark}.jsonl",
        model_dir / f"samples.jsonl",
        model_dir / f"{benchmark}_samples.jsonl",
    ]
    # Also try subdirectory patterns
    for sub in model_dir.glob("**/*.jsonl"):
        candidates.append(sub)

    for path in candidates:
        if path.exists():
            records = []
            with open(path, encoding="utf-8") as f:
                for line in f:
                    row = json.loads(line)
                    records.append(row)
            if records:
                print(f"    Loaded {len(records)} solutions from {path.relative_to(solutions_dir.parent)}")
                return records
    return []


def run_tests_sandboxed(code: str, test_code: str, timeout: int = 10) -> tuple[int, int]:
    """
    Execute solution + test cases in a subprocess sandbox.
    Returns (tests_passed, tests_total).
    """
    # Wrap each assert in try/except so we can count partial passes
    test_lines = test_code.strip().splitlines()
    wrapped_asserts = []
    passed_var = "__passed__ = 0\n__total__ = 0\n"
    for line in test_lines:
        stripped = line.strip()
        if stripped.startswith("assert "):
            indent = len(line) - len(line.lstrip())
            pad = " " * indent
            wrapped_asserts.append(
                f"{pad}__total__ += 1\n"
                f"{pad}try:\n"
                f"{pad}    {stripped}\n"
                f"{pad}    __passed__ += 1\n"
                f"{pad}except Exception:\n"
                f"{pad}    pass\n"
            )
        else:
            wrapped_asserts.append(line + "\n")

    full_script = (
        passed_var
        + code
        + "\n"
        + "".join(wrapped_asserts)
        + "\nprint(f'{__passed__}/{__total__}')\n"
    )

    with tempfile.NamedTemporaryFile(mode="w", suffix=".py",
                                     delete=False, encoding="utf-8") as tmp:
        tmp.write(full_script)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True, text=True, timeout=timeout
        )
        last_line = result.stdout.strip().splitlines()[-1] if result.stdout.strip() else "0/0"
        passed, total = map(int, last_line.split("/"))
        return passed, total
    except (subprocess.TimeoutExpired, ValueError, IndexError):
        return 0, 0
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def get_test_code(problem: dict) -> str:
    """Extract runnable test code from a problem record."""
    # EvalPlus format: 'test' field contains check function, entry_point gives function name
    test = problem.get("test", "")
    entry = problem.get("entry_point", "")
    if test and entry:
        return test + f"\ncheck({entry})\n"
    # MBPP format: 'test_list' is a list of assert strings
    test_list = problem.get("test_list", [])
    if test_list:
        return "\n".join(test_list) + "\n"
    return ""


def process_model(
    model_name: str,
    benchmark: str,
    problems: dict,
    solutions_dir: Path,
    output_path: Path,
    timeout: int = 10,
) -> int:
    """Process all solutions for one model/benchmark pair. Returns record count."""
    solutions = load_solutions(solutions_dir, model_name, benchmark)
    if not solutions:
        print(f"  [warn] No solutions found for {model_name}/{benchmark}, skipping")
        return 0

    count = 0
    with open(output_path, "a", encoding="utf-8") as out_f:
        for sol in tqdm(solutions, desc=f"{model_name[:20]}/{benchmark}", leave=False):
            task_id = sol.get("task_id", "")
            # EvalPlus solutions may have a 'completion' or 'solution' key
            code = sol.get("completion", sol.get("solution", sol.get("code", "")))
            if not task_id or not code:
                continue

            problem = problems.get(task_id)
            if not problem:
                continue

            # Build full function: prompt + completion (HumanEval format)
            prompt = problem.get("prompt", "")
            full_code = prompt + code if prompt else code

            test_code = get_test_code(problem)
            if not test_code:
                continue

            passed, total = run_tests_sandboxed(full_code, test_code, timeout)
            pass_ratio = round(passed / max(total, 1), 4)

            record = {
                "model":      model_name,
                "benchmark":  benchmark,
                "task_id":    task_id,
                "code":       full_code.strip(),
                "passed":     passed,
                "total":      total,
                "pass_ratio": pass_ratio,
                "correct":    pass_ratio == 1.0,
            }
            out_f.write(json.dumps(record) + "\n")
            count += 1

    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Run EvalPlus correctness evaluation")
    parser.add_argument("--data", default="data/evalplus")
    parser.add_argument("--output", default="data/correctness.jsonl")
    parser.add_argument("--timeout", type=int, default=10)
    parser.add_argument("--benchmarks", nargs="+", default=["humaneval", "mbpp"])
    args = parser.parse_args()

    data_dir   = Path(args.data)
    sol_dir    = data_dir / "solutions"
    out_path   = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    problem_files = {
        "humaneval": data_dir / "humaneval_plus.jsonl",
        "mbpp":      data_dir / "mbpp_plus.jsonl",
    }

    models = [d.name for d in sol_dir.iterdir() if d.is_dir()] if sol_dir.exists() else []
    if not models:
        print(f"No solution directories found in {sol_dir}")
        sys.exit(1)

    total = 0
    for benchmark in args.benchmarks:
        pfile = problem_files.get(benchmark)
        if not pfile or not pfile.exists():
            print(f"[warn] Problem file not found for {benchmark}: {pfile}")
            continue
        problems = load_problems(pfile)
        print(f"\n=== {benchmark.upper()} — {len(problems)} problems ===")
        for model in models:
            n = process_model(model, benchmark, problems, sol_dir, out_path, args.timeout)
            print(f"  {model}: {n} records written")
            total += n

    print(f"\nTotal records: {total}")
    print(f"Output: {out_path}")
    print(f"\nNext: python score_readability.py --input {out_path}")


if __name__ == "__main__":
    main()
