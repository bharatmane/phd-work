import ast
import json
import argparse
# For Java parsing, we'd use javalang if available
# import javalang
# For JavaScript, we might use an esprima parser or tree_sitter
# For this example, we'll stub JS/C# parsing due to external library requirements.

# Data structure to hold identifier info
class IdentifierRecord:
    def __init__(self, name, id_type, language, file):
        self.name = name
        self.id_type = id_type  # e.g., 'Class', 'Function', 'Variable', 'Constant'
        self.language = language
        self.file = file
        self.length = len(name)
        # Scores will be stored in a dict for clarity
        self.scores = {}
        self.final_score = None

    def compute_scores(self, domain_model=None, weights=None):
        """Compute all category scores for this identifier and the weighted final score."""
        tokens = tokenize_identifier(self.name)  # split name into word tokens
        # 1. Semantic Clarity Score
        self.scores['Semantic'] = score_semantic_clarity(tokens)
        # 2. Domain Relevance Score
        if domain_model:
            self.scores['Domain'] = score_domain_relevance(tokens, domain_model)
        else:
            # If no model, either skip or assign neutral score (e.g., 0.5)
            self.scores['Domain'] = 0.5
        # 3. Style Convention Score
        self.scores['Style'] = score_style_convention(self.name, self.id_type, self.language)
        # 4. Length Appropriateness Score
        self.scores['Length'] = score_length(self.name, self.id_type)
        # 5. Abbreviation Usage Score
        self.scores['Abbreviation'] = score_abbreviation(tokens)
        # 6. Natural Language Readability Score
        self.scores['Readability'] = score_natural_readability(tokens, self.id_type)
        # Compute final weighted score
        if weights is None:
            # Default equal weights for six categories
            weights = {'Semantic':1, 'Domain':1, 'Style':1, 'Length':1, 'Abbreviation':1, 'Readability':1}
        total_weight = sum(weights.values())
        total = 0.0
        for cat, w in weights.items():
            total += w * self.scores.get(cat, 0)
        # Normalize to 0-1 scale
        self.final_score = total / total_weight if total_weight > 0 else 0.0

def tokenize_identifier(name):
    """
    Split an identifier name into constituent tokens based on casing and separators.
    e.g. "numUsersActive" -> ["num","users","active"]; "MAX_COUNT" -> ["MAX","COUNT"].
    """
    # We insert a separator before capital letters (for CamelCase) and split on non-alphanumeric chars.
    import re
    # Add a space before capitals (except if at start) and before numbers if they are part of name
    name_spaced = re.sub(r'(?<!^)(?=[A-Z0-9])', ' ', name)
    # Split on non-alphanumeric (underscore will produce empty tokens which we filter out)
    tokens = re.split(r'[^A-Za-z0-9]+', name_spaced)
    tokens = [t for t in tokens if t]  # remove empty strings
    # Normalize tokens to lowercase for analysis
    tokens = [t.lower() for t in tokens]
    return tokens

# Below are placeholder scoring functions. In a full implementation, these would use
# dictionaries, models, and more complex logic as described above.

def score_semantic_clarity(tokens):
    """Score 0-1 how meaningful the tokens are (are they real words or common terms?)."""
    if not tokens:
        return 0.0
    score = 0.0
    for t in tokens:
        # Very naive approach: if token is longer than 1 char and found in a basic English word list or common tech words.
        if is_english_word(t) or is_common_term(t):
            score += 1
        elif len(t) <= 2:
            # likely an abbreviation or very short token that's not a word
            score += 0  # no points
        else:
            # unknown longer token, partial credit
            score += 0.5
    # Normalize by token count to max 1.0
    return score / len(tokens)

def score_domain_relevance(tokens, domain_model):
    """Use the domain model (could be a set of domain terms or a model) to score domain relevance 0-1."""
    if not tokens:
        return 0.0
    # If domain_model is a set of terms:
    if isinstance(domain_model, set):
        count = sum(1 for t in tokens if t in domain_model)
        return count / len(tokens)
    # If domain_model is a more complex model (e.g., a classifier with predict_proba):
    try:
        return domain_model.predict_proba([" ".join(tokens)])[0][1]  # probability of being domain-relevant
    except Exception:
        # default to neutral if model usage fails
        return 0.5

def score_style_convention(name, id_type, language):
    """Score 0-1 if the identifier follows naming conventions of its language for its type."""
    # We'll implement basic checks for each language:
    if language.lower() == "python":
        if id_type == "Class":
            # Python classes should be CamelCase (PascalCase)
            # Check if name is CamelCase (first char uppercase, contains no underscores)
            if name[0].isupper() and "_" not in name:
                return 1.0
            else:
                return 0.0
        else:  # functions, variables
            # Should be lowercase with underscores (snake_case), and not CamelCase
            if name.lower() == name and ("_" in name or len(name) < 20):  # allow single-word lower names too
                return 1.0
            else:
                return 0.0
    elif language.lower() == "java":
        if id_type == "Class":
            # Java classes PascalCase
            if name[0].isupper() and "_" not in name:
                return 1.0
            else:
                return 0.0
        elif id_type in ("Function","Method"):
            # Java methods camelCase (lowercase first letter, no spaces)
            if name[0].islower() and "_" not in name:
                return 1.0
            else:
                return 0.0
        elif id_type == "Constant":
            # Constants in Java: ALL_UPPER_CASE with underscores
            if name.upper() == name and "_" in name:
                return 1.0
            else:
                # Also allow PascalCase if that's used for constants? Usually not, so:
                return 0.0
        else:
            # Variables (assuming camelCase like methods)
            if name[0].islower() and "_" not in name:
                return 1.0
            else:
                return 0.0
    elif language.lower() in ("javascript", "js"):
        # JavaScript is less strict, but generally:
        if id_type == "Class":
            # JS classes (constructor functions) often PascalCase
            return 1.0 if name[0].isupper() else 0.0
        else:
            # Variables/functions typically camelCase in JS
            return 1.0 if name[0].islower() else 0.0
    elif language.lower() in ("c#", "csharp"):
        # C# naming:
        if id_type == "Class" or id_type == "Interface" or id_type == "Method":
            # PascalCase for classes, interfaces (interfaces start with I), methods
            if name[0].isupper():
                return 1.0
            else:
                return 0.0
        elif id_type in ("Variable", "Parameter"):
            # camelCase for locals/parameters
            if name[0].islower():
                return 1.0
            else:
                return 0.0
        elif id_type == "Constant":
            # Constants in .NET are PascalCase by convention (sometimes all caps for readonly statics is discouraged)
            if name[0].isupper() and "_" not in name:
                return 1.0
            else:
                return 0.0
        elif id_type == "Field":
            # Private fields often _camelCase
            if name.startswith("_") and len(name) > 1 and name[1].islower():
                return 1.0
            else:
                return 0.0
    # Default: if unknown, return 0.5 as neutral
    return 0.5

def score_length(name, id_type):
    """Score 0-1 for length appropriateness. Uses heuristic optimal ranges."""
    n = len(name)
    # Define some heuristic optimal length ranges:
    if id_type == "Class":
        optimal_min, optimal_max = 3, 30   # classes can have longer descriptive names
    else:
        optimal_min, optimal_max = 3, 20   # variables/functions ideally shorter
    if n < optimal_min:
        return max(0.0, (n / optimal_min) * 0.5)  # very short -> low score (except n==2 maybe slight)
    if n > optimal_max:
        # If too long, score declines. If n is double optimal_max, score ~0.
        if n >= 2*optimal_max:
            return 0.0
        else:
            # linearly decrease from 1 at optimal_max to 0 at 2*optimal_max
            return max(0.0, 1 - (n - optimal_max) / float(optimal_max))
    # If in optimal range, score between 0.8 and 1 (we can give perfect if comfortably within)
    return 1.0

def score_abbreviation(tokens):
    """Score 0-1: high if few/no abbreviations. Penalize unrecognized short tokens."""
    if not tokens:
        return 1.0
    bad_count = 0
    for t in tokens:
        # If token is very short and not a common English word (and not a single-letter allowed like i, j in context):
        if len(t) <= 2:
            # single letters and two-letter tokens likely abbreviations (except common ones like id, ok, etc.)
            if t not in {"id", "ok", "os", "db"}:  # allow some known short tokens
                bad_count += 1
        else:
            # If token is longer but all consonants or weird pattern, consider it an abbreviation (like "nbr" or "mgr").
            # Heuristic: if no vowel in token and not a known acronym -> abbreviation flag.
            vowels = set("aeiou")
            if not any(v in vowels for v in t):
                if t not in {"xml", "html", "http", "https", "sql"}:  # known acronyms
                    bad_count += 1
    # Calculate score: start from 1, subtract penalty for each bad abbreviation (heavier penalty if multiple).
    # For simplicity: if any bad abbreviation, score = 0. If none, score = 1. (Could refine to gradual scale.)
    return 1.0 if bad_count == 0 else 0.0

def score_natural_readability(tokens, id_type):
    """Score 0-1 how easy it is to read the tokens as a phrase."""
    if not tokens:
        return 0.0
    phrase = " ".join(tokens)
    score = 1.0
    # Simple heuristics:
    # Penalize if any token is a weird mix of letters/digits like 'file2handle' (digit in middle might reduce readability).
    import re
    if re.search(r'[A-Za-z][0-9]|[0-9][A-Za-z]', "".join(tokens)):
        score -= 0.2
    # Penalize if the phrase is not grammatical (very hard to check without NLP, but we can check ordering by type):
    # e.g., for a function (id_type Method), ideally first token is a verb.
    if id_type in ("Function", "Method"):
        first = tokens[0]
        # A simple list of common verbs:
        common_verbs = {"get","set","compute","calculate","update","process","handle","build","convert","is","has"}
        if first not in common_verbs:
            score -= 0.2  # not starting with verb might indicate less clear intention (though not always)
    # Pronounceability: penalize if any token has no vowels (already did in abbreviation somewhat).
    for t in tokens:
        vowels = set("aeiou")
        if len(t) > 2 and not any(v in vowels for v in t):
            score -= 0.1  # each hard-to-pronounce token reduces score
    # Bound the score between 0 and 1
    if score < 0:
        score = 0.0
    if score > 1:
        score = 1.0
    return score

# Auxiliary helpers for semantic clarity scoring (dictionary checks).
# In practice, use a real dictionary or word frequency list.
ENGLISH_WORDS = {"total","cost","number","count","file","path","name","customer","account","balance","rate","user","active","data","process","value"}
TECH_TERMS = {"num","init","temp","obj","mgr","calc","sync","cfg","err"}  # some common abbreviations or tech terms
def is_english_word(token):
    return token in ENGLISH_WORDS
def is_common_term(token):
    return token in TECH_TERMS

# Parsing functions for each language:
def parse_python_file(filepath):
    """Parse Python file and yield IdentifierRecord for each definition found."""
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        print(f"[WARN] Failed to parse {filepath}: {e}")
        return []
    id_list = []
    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            id_list.append(IdentifierRecord(node.name, "Class", "Python", filepath))
        elif isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
            # Function name
            id_list.append(IdentifierRecord(node.name, "Function", "Python", filepath))
            # Arguments
            for arg in node.args.args:
                if hasattr(arg, 'arg'):
                    id_list.append(IdentifierRecord(arg.arg, "Parameter", "Python", filepath))
        elif isinstance(node, ast.Assign):
            # Assignment targets - could be multiple
            for target in node.targets:
                if isinstance(target, ast.Name):
                    id_list.append(IdentifierRecord(target.id, "Variable", "Python", filepath))
                # (Could handle tuple targets, attribute targets if needed)
        # We might also consider ast.Name nodes in Store context, but ast.Assign covers many.
    return id_list

def parse_java_file(filepath):
    """Parse Java file and yield IdentifierRecord for each definition (class, method, field, local variable)."""
    id_list = []
    try:
        import javalang
    except ImportError:
        print("[WARN] javalang library not installed; cannot parse Java file.")
        return id_list
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    try:
        tree = javalang.parse.parse(source)
    except Exception as e:
        print(f"[WARN] Failed to parse {filepath}: {e}")
        return id_list
    # javalang parse returns a CompilationUnit with types (classes).
    for _, node in tree.filter(javalang.tree.ClassDeclaration):
        id_list.append(IdentifierRecord(node.name, "Class", "Java", filepath))
        # class members:
        for member in node.body:
            # Field declarations
            if isinstance(member, javalang.tree.FieldDeclaration):
                for decl in member.declarators:
                    id_list.append(IdentifierRecord(decl.name, "Variable" if not member.modifiers or 'final' not in member.modifiers else "Constant", "Java", filepath))
            # Method declarations
            if isinstance(member, javalang.tree.MethodDeclaration):
                id_list.append(IdentifierRecord(member.name, "Method", "Java", filepath))
                # Parameters
                for param in member.parameters:
                    id_list.append(IdentifierRecord(param.name, "Parameter", "Java", filepath))
    return id_list

def parse_js_file(filepath):
    """Parse JavaScript file and yield IdentifierRecord. (Stubbed or using esprima if available)"""
    id_list = []
    try:
        import esprima
    except ImportError:
        print("[WARN] esprima library not installed; using basic regex for JS.")
        # Basic fallback: regex for function and var names (not fully accurate)
        with open(filepath, "r", encoding="utf-8") as f:
            source = f.read()
        import re
        # function declarations
        for match in re.finditer(r'\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(', source):
            name = match.group(1)
            id_list.append(IdentifierRecord(name, "Function", "JavaScript", filepath))
        # var/let/const declarations (only catch simple cases of single declaration)
        for match in re.finditer(r'\b(var|let|const)\s+([A-Za-z_$][A-Za-z0-9_$]*)', source):
            name = match.group(2)
            id_list.append(IdentifierRecord(name, "Variable", "JavaScript", filepath))
        # class declarations
        for match in re.finditer(r'\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)', source):
            name = match.group(1)
            id_list.append(IdentifierRecord(name, "Class", "JavaScript", filepath))
        return id_list
    # If esprima is installed, use it for full AST
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    try:
        script = esprima.parseScript(source, options={"tolerant": True})
    except Exception as e:
        print(f"[WARN] Failed to parse {filepath}: {e}")
        return id_list
    # Traverse Esprima AST (ecma AST format)
    def traverse(node):
        node_type = node.type
        if node_type == "FunctionDeclaration":
            id_list.append(IdentifierRecord(node.id.name, "Function", "JavaScript", filepath))
            # params
            for param in node.params:
                if hasattr(param, 'name'):
                    id_list.append(IdentifierRecord(param.name, "Parameter", "JavaScript", filepath))
        elif node_type == "VariableDeclarator":
            if hasattr(node.id, 'name'):
                # Distinguish var in top-level vs inside function? We'll just call all "Variable"
                id_list.append(IdentifierRecord(node.id.name, "Variable", "JavaScript", filepath))
        elif node_type == "ClassDeclaration":
            id_list.append(IdentifierRecord(node.id.name, "Class", "JavaScript", filepath))
        # Recurse into child nodes
        for key, value in node.__dict__.items():
            if isinstance(value, list):
                for item in value:
                    if hasattr(item, 'type'):
                        traverse(item)
            elif hasattr(value, 'type'):
                traverse(value)
    traverse(script)
    return id_list

def parse_csharp_file(filepath):
    """Parse C# file. (For full implementation, integrate with Roslyn or a C# parser. Here, basic heuristic.)"""
    id_list = []
    with open(filepath, "r", encoding="utf-8") as f:
        source = f.read()
    import re
    # Simple regex-based extraction (not perfect, but for demonstration):
    # class names
    for match in re.finditer(r'\b(class|struct|enum|interface)\s+([A-Za-z_][A-Za-z0-9_]*)', source):
        name = match.group(2)
        type_name = "Class" if match.group(1) == "class" else match.group(1).capitalize()
        # interface naming: typically starts with I
        id_list.append(IdentifierRecord(name, type_name, "C#", filepath))
    # method names (public/protected/private returnType Name(...)
    for match in re.finditer(r'\b(public|private|protected|internal|static|virtual|override|\s)+\s*[\w\<\>\[\]]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(', source):
        # This regex matches a return type (simplified) followed by a name and '('
        name = match.group(2)
        # Exclude keywords that sneaked in as name (e.g., if return type was missing and match caught a keyword)
        if name in {"if","for","while","switch","foreach"}:
            continue
        id_list.append(IdentifierRecord(name, "Method", "C#", filepath))
    # variable declarations (within methods or as fields)
    for match in re.finditer(r'\b(int|float|double|var|string|bool|char|decimal|object|dynamic|long|byte)\s+([A-Za-z_][A-Za-z0-9_]*)', source):
        # This will also catch parameter declarations unfortunately, but let's assume it's fine for demo
        name = match.group(2)
        id_list.append(IdentifierRecord(name, "Variable", "C#", filepath))
    return id_list

def parse_file(filepath):
    """Dispatch to appropriate parser based on file extension."""
    if filepath.endswith(".py"):
        return parse_python_file(filepath)
    elif filepath.endswith(".java"):
        return parse_java_file(filepath)
    elif filepath.endswith(".js") or filepath.endswith(".jsx") or filepath.endswith(".ts"):
        # treat .ts similar to .js for name extraction
        return parse_js_file(filepath)
    elif filepath.endswith(".cs"):
        return parse_csharp_file(filepath)
    else:
        return []  # unsupported file

def main():
    parser = argparse.ArgumentParser(description="Identifier Readability Analyzer")
    parser.add_argument("path", help="Source file or directory to analyze")
    parser.add_argument("--format", choices=["csv","json"], default="csv", help="Output format")
    parser.add_argument("--output", "-o", help="Output file path (if not provided, prints to stdout)")
    parser.add_argument("--domain-model", "-m", help="Path to domain model file (optional)")
    args = parser.parse_args()
    # Load domain model if provided (this could be a pickle file containing a set or a trained model)
    domain_model = None
    if args.domain_model:
        try:
            import pickle
            with open(args.domain_model, "rb") as mf:
                domain_model = pickle.load(mf)
        except Exception as e:
            print(f"[WARN] Could not load domain model from {args.domain_model}: {e}")
    # Gather all target files
    import os
    file_paths = []
    if os.path.isdir(args.path):
        # Walk directory
        for root, dirs, files in os.walk(args.path):
            for fname in files:
                if fname.endswith((".py", ".java", ".js", ".jsx", ".ts", ".cs")):
                    file_paths.append(os.path.join(root, fname))
    elif os.path.isfile(args.path):
        file_paths.append(args.path)
    else:
        print("Error: path is not a file or directory")
        return
    results = []
    for path in file_paths:
        ids = parse_file(path)
        for id_rec in ids:
            id_rec.compute_scores(domain_model=domain_model)
            results.append(id_rec)
    # Output results in requested format
    if args.format == "json":
        # Convert results to list of dicts
        data = []
        for rec in results:
            entry = {
                "file": rec.file,
                "name": rec.name,
                "type": rec.id_type,
                "length": rec.length,
                "scores": rec.scores,
                "finalScore": rec.final_score
            }
            data.append(entry)
        output_str = json.dumps(data, indent=4)
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(output_str)
        else:
            print(output_str)
    else:  # CSV format
        import csv
        # Prepare CSV rows
        header = ["File","Identifier","Type","Length","SemanticScore","DomainScore","StyleScore",
                  "LengthScore","AbbrevScore","ReadabilityScore","FinalScore"]
        rows = []
        for rec in results:
            rows.append([
                rec.file, rec.name, rec.id_type, rec.length,
                f"{rec.scores.get('Semantic',0):.2f}",
                f"{rec.scores.get('Domain',0):.2f}",
                f"{rec.scores.get('Style',0):.2f}",
                f"{rec.scores.get('Length',0):.2f}",
                f"{rec.scores.get('Abbreviation',0):.2f}",
                f"{rec.scores.get('Readability',0):.2f}",
                f"{rec.final_score:.2f}"
            ])
        if args.output:
            with open(args.output, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(header)
                writer.writerows(rows)
        else:
            # Print to stdout
            writer = csv.writer(sys.stdout)
            writer.writerow(header)
            writer.writerows(rows)

if __name__ == "__main__":
    main()
