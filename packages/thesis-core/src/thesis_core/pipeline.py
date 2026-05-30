from .config import PipelineConfig
from .features.readability_features import build_readability_features
from .models.iraf_xadl import classify_identifier
from .preprocessing.normalize import normalize_identifier
from .types import IdentifierRecord, PipelinePrediction


class ResearchPipeline:
    """Minimal orchestration layer for the next thesis codebase iteration."""

    def __init__(self, config: PipelineConfig | None = None) -> None:
        self.config = config or PipelineConfig()

    def predict(self, record: IdentifierRecord) -> PipelinePrediction:
        normalized = normalize_identifier(record.identifier, self.config.preprocessing)
        record.normalized_tokens = normalized
        features = build_readability_features(normalized)
        return classify_identifier(record, features)
