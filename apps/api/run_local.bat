@echo off
REM One-shot local validation for IRAF-XADL (Windows).
cd /d "%~dp0"

echo === installing dependencies ===
pip install -r requirements.txt || exit /b 1

echo.
echo === demo (untrained, fallback embedder for speed) ===
python demo.py --no-codebert --no-shap || exit /b 1

echo.
echo === quick training (5 epochs, fallback embedder) ===
python train.py --no-codebert --epochs 5 --data data/sample_python.csv --language python --save artifacts/iraf_xadl_python.pt || exit /b 1

echo.
echo === demo with trained checkpoint + SHAP ===
python demo.py --no-codebert --checkpoint artifacts/iraf_xadl_python.pt --sample 0 || exit /b 1

echo.
echo All local checks passed. To use real CodeBERT, re-run without --no-codebert.
