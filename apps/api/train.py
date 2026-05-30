"""Full training entry point for IRAF-XADL.

Example:
    python train.py --epochs 50 --batch-size 32 --lr 1e-3 \
                    --data data/sample_python.csv --language python \
                    --save artifacts/iraf_xadl_python.pt
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# Allow `python train.py` from inside the project folder
sys.path.insert(0, str(Path(__file__).parent))

from src.dataset import CodeReadabilityDataset
from src.embeddings import Embedder
from src.trainer import TrainConfig, train


def main() -> None:
    p = argparse.ArgumentParser(description="Train IRAF-XADL on a CSV dataset.")
    p.add_argument("--data", default="data/sample_python.csv")
    p.add_argument("--language", default="python", choices=["python", "cpp"])
    p.add_argument("--epochs", type=int, default=100)
    p.add_argument("--batch-size", type=int, default=32)
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--weight-decay", type=float, default=0.01)
    p.add_argument("--train-split", type=float, default=0.7)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--save", default="artifacts/iraf_xadl.pt")
    p.add_argument("--no-codebert", action="store_true",
                   help="Use the hash-based fallback embedder.")
    args = p.parse_args()

    import datetime, os
    run_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_dir = Path("artifacts/runs")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"{run_id}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(message)s",
        handlers=[
            logging.StreamHandler(),                          # console
            logging.FileHandler(log_file, encoding="utf-8"), # file
        ],
    )
    logging.info("Run ID: %s | data=%s | epochs=%d | lr=%s | save=%s",
                 run_id, args.data, args.epochs, args.lr, args.save)

    print(f"Loading dataset: {args.data} ({args.language})")
    ds = CodeReadabilityDataset(args.data, args.language,
                                embedder=Embedder(use_codebert=not args.no_codebert))
    print(f"Total samples: {len(ds)}")

    cfg = TrainConfig(
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        weight_decay=args.weight_decay,
        train_split=args.train_split,
        seed=args.seed,
        save_path=args.save,
    )
    result = train(ds, cfg)
    print(f"\nDone. Best validation accuracy: {result['best_accuracy']:.4f}")
    print(f"Checkpoint: {args.save}")


if __name__ == "__main__":
    main()
