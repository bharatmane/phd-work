def is_probably_gibberish(token):
    # Fallback for home-row/keyboard smash detection
    from nostril import nonsense
    try:
        if nonsense(token):
            return True
        # Add extra checks for "keyboard smashes"
        vowels = set("aeiou")
        ratio = sum(1 for c in token.lower() if c in vowels) / max(1, len(token))
        # e.g. very low or very high vowel/consonant ratios are suspicious
        if ratio < 0.15 or ratio > 0.85:
            return True
        # Check for long runs of consonants
        import re
        if re.search(r"[bcdfghjklmnpqrstvwxyz]{5,}", token.lower()):
            return True
    except ValueError:
        pass
    return False

print(is_probably_gibberish("esrtdyfughij"))  # Might now return True
