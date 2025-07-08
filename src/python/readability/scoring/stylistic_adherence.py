import pandas as pd
import re

# Define regex patterns for naming conventions
patterns = {
    "python": {
        "variable": r"^[a-z_][a-z0-9_]*$",
        "function": r"^[a-z_][a-z0-9_]*$",
        "class": r"^[A-Z][a-zA-Z0-9]*$",
        "constant": r"^[A-Z][A-Z0-9_]*$"
    },
    "java": {
        "variable": r"^[a-z][a-zA-Z0-9]*$",
        "method": r"^[a-z][a-zA-Z0-9]*$",
        "class": r"^[A-Z][a-zA-Z0-9]*$",
        "constant": r"^[A-Z][A-Z0-9_]*$"
    },
    "javascript": {
        "variable": r"^[a-z][a-zA-Z0-9]*$",
        "function": r"^[a-z][a-zA-Z0-9]*$",
        "class": r"^[A-Z][a-zA-Z0-9]*$",
        "constant": r"^[A-Z][A-Z0-9_]*$"
    }
}

forbidden_patterns = [
    r"^m_",
    r"^sz",
    r".*(_[A-Z][a-z])",
    r".*[ -]",
    r"^\d",
]

def stylistic_score(identifier, language="python", id_type="variable"):
    checks = []
    penalties = []
    pattern = patterns.get(language, {}).get(id_type, None)
    name = str(identifier)

    # 1. Legal characters and start letter
    checks.append(name[0].isalpha() or name[0] == "_")
    penalties.append(0.1)

    # 2. No forbidden patterns
    checks.append(not any(re.match(pat, name) for pat in forbidden_patterns))
    penalties.append(0.2)

    # 3. Style regex match
    if pattern:
        checks.append(bool(re.match(pattern, name)))
        penalties.append(0.5)
    else:
        checks.append(True)
        penalties.append(0)

    total = 0.0
    for check, penalty in zip(checks, penalties):
        if not check:
            total += penalty

    if total == 0.0:
        return 1.0
    elif total <= 0.2:
        return 0.8
    elif total <= 0.5:
        return 0.5
    else:
        return 0.0

# Load your CSV
df = pd.read_csv("consolidated_identifiers.csv")

# Optionally infer language/id_type per row; here default to Python variable
# You can replace with logic or columns as needed
df["ST"] = df.apply(
    lambda row: stylistic_score(
        row["Identifier Name"],
        language=str(row["Language"]).strip().lower() if "Language" in row else "python",
        id_type=str(row["Identifier Type"]).strip().lower() if "Identifier Type" in row else "variable"
    ), axis=1
)


# Save to new CSV
df.to_csv("consolidated_identifiers_with_ST.csv", index=False)
print("Done. Output saved as consolidated_identifiers_with_ST.csv")
