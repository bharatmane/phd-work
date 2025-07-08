import os
import fasttext
from domain_model.trainer import prepare_training_file

def train_model(domain_vocab_path, model_output_path):
    training_file = "models/temp_training.txt"
    prepare_training_file(domain_vocab_path, training_file)

    model = fasttext.train_unsupervised(training_file, model='skipgram')
    model.save_model(model_output_path)
    print(f"✅ Domain model trained and saved to: {model_output_path}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Train domain language model using FastText.")
    parser.add_argument("vocab_file", help="Path to the domain vocabulary .txt file")
    parser.add_argument("--output", default="models/domain_model.bin", help="Path to save the trained model")
    args = parser.parse_args()

    os.makedirs("models", exist_ok=True)
    train_model(args.vocab_file, args.output)
