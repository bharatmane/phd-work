FROM python:3.11-slim

WORKDIR /app

# Install deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY src/ ./src/
COPY data/ ./data/
COPY api.py .

# Checkpoint is NOT in the image — mount it from the host:
#   docker run -v /path/on/vps/iraf_xadl_augmented.pt:/app/artifacts/iraf_xadl_augmented.pt ...
RUN mkdir -p artifacts

EXPOSE 8000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
