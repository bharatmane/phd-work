from statistics import mean

from thesis_core.types import IdentifierRecord, PipelinePrediction


def classify_identifier(record: IdentifierRecord, features: dict[str, float]) -> PipelinePrediction:
    score = mean(features.values())

    if score >= 0.75:
        label = "high"
    elif score >= 0.5:
        label = "medium"
    else:
        label = "low"

    return PipelinePrediction(
        identifier=record.identifier,
        readability_label=label,
        confidence=round(score, 4),
        contributing_factors=features,
    )
