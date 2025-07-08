import os
import re
import csv

def extract_identifiers_from_cs_file(filepath):
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        code = f.read()

    identifiers = []
    # Class names
    for match in re.finditer(r'\b(class|struct|interface)\s+([A-Z][A-Za-z0-9_]*)', code):
        identifiers.append(("class", match.group(2)))
    # Method/function names
    for match in re.finditer(
        r'\b(?:public|private|protected|internal|static|virtual|override|async|\s)*\s*'
        r'(?:[\w<>\[\],]+\s+)+([A-Za-z_][A-Za-z0-9_]*)\s*\(', code):
        name = match.group(1)
        if not name[0].isupper():
            continue
        identifiers.append(("function", name))
    # Variable names
    for match in re.finditer(
        r'(?:public|private|protected|internal|static|readonly|\s)*'
        r'(?:[\w<>\[\],]+\s+)+([a-z_][A-Za-z0-9_]*)\s*(?==|;)', code):
        identifiers.append(("variable", match.group(1)))
    return identifiers

def scan_csharp_projects(project_folders, parent_dir, output_csv):
    unique_identifiers = set()
    for proj in project_folders:
        full_path = os.path.join(parent_dir, proj)
        for dirpath, _, filenames in os.walk(full_path):
            for fname in filenames:
                if fname.lower().endswith(".cs"):
                    fpath = os.path.join(dirpath, fname)
                    for id_type, id_name in extract_identifiers_from_cs_file(fpath):
                        unique_identifiers.add((proj, "C#", id_type, id_name))
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
    csharp_projects = [
        "Autofac",
        "Dapper",
        "Hangfire",
        "IdentityServer",
        "NLog"
    ]
    PARENT_DIR = r"D:\Users\bhara\source\repos\Phd Research"
    OUTPUT_CSV = "csharp_identifiers_all.csv"
    scan_csharp_projects(csharp_projects, PARENT_DIR, OUTPUT_CSV)
