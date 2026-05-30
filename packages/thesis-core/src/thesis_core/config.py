from dataclasses import dataclass, field


@dataclass(slots=True)
class PreprocessingConfig:
    lowercase: bool = True
    remove_stopwords: bool = True
    split_camel_case: bool = True
    split_snake_case: bool = True
    split_digits: bool = True
    lemmatize: bool = False


@dataclass(slots=True)
class PipelineConfig:
    languages: list[str] = field(default_factory=lambda: ["python", "cpp"])
    readability_labels: list[str] = field(default_factory=lambda: ["low", "medium", "high"])
    preprocessing: PreprocessingConfig = field(default_factory=PreprocessingConfig)
