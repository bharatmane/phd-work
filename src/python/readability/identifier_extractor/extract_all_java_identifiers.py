import os
import re
import csv

def extract_identifiers_from_java_file(filepath):
    with open(filepath, encoding="utf-8", errors="ignore") as f:
        code = f.read()

    identifiers = []
    # Class, interface, enum names
    for match in re.finditer(r'\b(class|interface|enum)\s+([A-Z][A-Za-z0-9_]*)', code):
        identifiers.append(("class", match.group(2)))
    # Method names (exclude keywords)
    for match in re.finditer(
        r'(?:public|protected|private|static|final|native|synchronized|abstract|\s)*'
        r'(?:[\w<>\[\],]+\s+)+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(', code):
        name = match.group(1)
        if name not in {"if", "for", "while", "switch", "catch", "class", "interface", "enum"}:
            identifiers.append(("function", name))
    # Variable/field names
    for match in re.finditer(
        r'(?:public|protected|private|static|final|\s)*'
        r'(?:[\w<>\[\],]+\s+)+([a-z_][a-zA-Z0-9_]*)\s*(?==|;)', code):
        identifiers.append(("variable", match.group(1)))
    return identifiers

def scan_java_projects(project_folders, parent_dir, output_csv):
    unique_identifiers = set()
    for proj in project_folders:
        full_path = os.path.join(parent_dir, proj)
        for dirpath, _, filenames in os.walk(full_path):
            for fname in filenames:
                if fname.lower().endswith(".java"):
                    fpath = os.path.join(dirpath, fname)
                    for id_type, id_name in extract_identifiers_from_java_file(fpath):
                        unique_identifiers.add((proj, "Java", id_type, id_name))
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
    java_projects = [
        "commons-lang",
        "guava",
        "hibernate-orm",
        "logging-log4j2",
        "spring-framework"
    ]
    PARENT_DIR = r"D:\Users\bhara\source\repos\Phd Research"
    OUTPUT_CSV = "java_identifiers_all.csv"
    scan_java_projects(java_projects, PARENT_DIR, OUTPUT_CSV)
