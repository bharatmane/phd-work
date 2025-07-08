def prepare_training_file(vocab_path, output_path):
    with open(vocab_path, 'r', encoding='utf-8') as vf, open(output_path, 'w', encoding='utf-8') as out:
        for line in vf:
            term = line.strip()
            if term and not term.startswith("#"):
                out.write(term + " ")  # space separated terms
