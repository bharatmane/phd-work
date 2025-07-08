# main_extract_all_identifiers.py

from extract_all_java_identifiers import scan_java_projects
from extract_all_python_identifiers import scan_python_projects
from extract_cs_identifiers import scan_csharp_projects
from extract_all_js_identifiers import scan_js_projects

def main():
    # --- Java ---
    java_projects = [
        "commons-lang", "guava", "hibernate-orm", "logging-log4j2", "spring-framework"
    ]
    parent_dir = r"D:\Users\bhara\source\repos\Phd Research"
    output_dir = os.path.join(parent_dir, "identifiers_output")
    os.makedirs(output_dir, exist_ok=True)
    scan_java_projects(java_projects, parent_dir, os.path.join(output_dir, "java_identifiers_all.csv"))

    # --- Python ---
    python_projects = ["django", "flask", "numpy", "pandas", "requests"]
    scan_python_projects(python_projects, parent_dir, os.path.join(output_dir, "python_identifiers_all.csv"))

    # --- C# ---
    csharp_projects = ["Autofac", "Dapper", "Hangfire", "IdentityServer", "NLog"]
    scan_csharp_projects(csharp_projects, parent_dir, os.path.join(output_dir, "csharp_identifiers_all.csv"))

    # --- JavaScript/TS ---
    js_projects = [
        "angular", "angular-cli", "d3", "express", "lodash", "ngx-bootstrap",
        "react", "TypeScript", "vue", "NestJS"
    ]
    scan_js_projects(js_projects, parent_dir, os.path.join(output_dir, "js_identifiers_all.csv"))

if __name__ == "__main__":
    import os
    main()
