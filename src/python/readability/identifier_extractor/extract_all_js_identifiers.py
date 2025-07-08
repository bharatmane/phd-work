import os
import re
import csv

def extract_identifiers_from_js_file(filepath):
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        code = f.read()

    identifiers = []
    # Class names
    for match in re.finditer(r'\bclass\s+([A-Z][A-Za-z0-9_]*)', code):
        identifiers.append(("class", match.group(1)))
    # Function declarations: function foo(...)
    for match in re.finditer(r'\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(', code):
        identifiers.append(("function", match.group(1)))
    # Arrow function assignments: const foo = (...) => { ... }
    for match in re.finditer(r'\b(const|let|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\(?.*?=>', code):
        identifiers.append(("function", match.group(2)))
    # Object method shorthand: foo() { ... } in a class or object
    for match in re.finditer(r'([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*{', code):
        if match.group(1) not in {"if", "for", "while", "switch", "catch", "function"}:
            identifiers.append(("function", match.group(1)))
    # Variables (let/const/var)
    for match in re.finditer(r'\b(let|const|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)', code):
        identifiers.append(("variable", match.group(2)))
    # Exported consts (export const NAME = ...)
    for match in re.finditer(r'\bexport\s+const\s+([a-zA-Z_][a-zA-Z0-9_]*)', code):
        identifiers.append(("variable", match.group(1)))
    return identifiers

def scan_js_projects(project_folders, parent_dir, output_csv):
    unique_identifiers = set()
    for proj in project_folders:
        full_path = os.path.join(parent_dir, proj)
        for dirpath, _, filenames in os.walk(full_path):
            for fname in filenames:
                if fname.lower().endswith((".js", ".jsx", ".ts", ".tsx")):
                    fpath = os.path.join(dirpath, fname)
                    for id_type, id_name in extract_identifiers_from_js_file(fpath):
                        unique_identifiers.add((proj, "JavaScript", id_type, id_name))
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

# --- Usage ---
if __name__ == "__main__":
    js_projects = [
        "angular",
        "angular-cli",
        "d3",
        "express",
        "lodash",
        "ngx-bootstrap",
        "react",
        "TypeScript",
        "vue",
        "NestJS"
    ]
    PARENT_DIR = r"D:\Users\bhara\source\repos\Phd Research"
    OUTPUT_CSV = "js_identifiers_all.csv"
    scan_js_projects(js_projects, PARENT_DIR, OUTPUT_CSV)
