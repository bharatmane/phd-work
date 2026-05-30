from dataclasses import dataclass, field


@dataclass(slots=True)
class IdentifierRecord:
    language: str
    identifier: str
    identifier_type: str
    source_path: str = ""
    normalized_tokens: list[str] = field(default_factory=list)


@dataclass(slots=True)
class PipelinePrediction:
    identifier: str
    readability_label: str
    confidence: float
    contributing_factors: dict[str, float] = field(default_factory=dict)
