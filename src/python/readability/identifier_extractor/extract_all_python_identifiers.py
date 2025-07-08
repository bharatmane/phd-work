import os
import re
import csv

def extract_identifiers_from_py_file(filepath):
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        code = f.read()

    identifiers = []
    # Class names
    for match in re.finditer(r'^class\s+([A-Z][A-Za-z0-9_]*)\s*[\(:]', code, re.MULTILINE):
        identifiers.append(("class", match.group(1)))
    # Function/method names
    for match in re.finditer(r'^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', code, re.MULTILINE):
        identifiers.append(("function", match.group(1)))
    # Variables (simple heuristic: assignments not in function/class defs)
    for match in re.finditer(r'^([a-z_][a-zA-Z0-9_]*)\s*=', code, re.MULTILINE):
        identifiers.append(("variable", match.group(1)))
    return identifiers

def scan_python_projects(project_folders, parent_dir, output_csv):
    unique_identifiers = set()
    for proj in project_folders:
        full_path = os.path.join(parent_dir, proj)
        for dirpath, _, filenames in os.walk(full_path):
            for fname in filenames:
                if fname.lower().endswith(".py"):
                    fpath = os.path.join(dirpath, fname)
                    for id_type, id_name in extract_identifiers_from_py_file(fpath):
                        unique_identifiers.add((proj, "Python", id_type, id_name))
    with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=["Project", "Language", "Identifier Type", "Identifier Name"])
        writer.writeheader()
        for proj, lang, id_type, id_name in unique_identifiers:
            writer.writerow({
                "Project": proj,
                "Language": lang,
                "Identifier Type": id_type,
                "Identifier Name": id_name
            })
    print(f"Extraction complete. Output written to {output_csv}")

if __name__ == "__main__":
    python_projects = [
        "django",
        "flask",
        "numpy",
        "pandas",
        "requests"
    ]
    PARENT_DIR = r"D:\Users\bhara\source\repos\Phd Research"
    OUTPUT_DIR = os.path.join(PARENT_DIR, "identifiers_output")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    OUTPUT_CSV = os.path.join(OUTPUT_DIR, "python_identifiers_all.csv")
    scan_python_projects(python_projects, PARENT_DIR, OUTPUT_CSV)
