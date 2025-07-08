import os
import re
import ast

def extract_identifiers(path):
    identifiers = []
    if os.path.isfile(path):
        identifiers += _extract_from_file(path)
    elif os.path.isdir(path):
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith((".py", ".js", ".cs", ".java")):
                    identifiers += _extract_from_file(os.path.join(root, f))
    return identifiers

def _extract_from_file(filepath):
    result = []
    ext = os.path.splitext(filepath)[1].lower()
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            if ext == '.py':
                result += _extract_from_python_ast(content, filepath)
            else:
                result += _extract_with_regex(content, filepath)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return result

def _extract_from_python_ast(content, filepath):
    result = []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                result.append({"file": filepath, "name": node.name, "length": len(node.name), "type": "function"})
            elif isinstance(node, ast.ClassDef):
                result.append({"file": filepath, "name": node.name, "length": len(node.name), "type": "class"})
            elif isinstance(node, ast.arg):
                result.append({"file": filepath, "name": node.arg, "length": len(node.arg), "type": "argument"})
            elif isinstance(node, ast.Name):
                result.append({"file": filepath, "name": node.id, "length": len(node.id), "type": "variable"})
    except Exception as e:
        print(f"AST parse error: {e}")
    return result

def _extract_with_regex(content, filepath):
    result = []
    matches = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', content)
    for m in set(matches):
        result.append({
            "file": filepath,
            "name": m,
            "length": len(m),
            "type": "unknown"
        })
    return result
