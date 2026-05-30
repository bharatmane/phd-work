from thesis_core.types import PipelinePrediction


def summarize_prediction(prediction: PipelinePrediction) -> str:
    ordered = sorted(prediction.contributing_factors.items(), key=lambda item: item[1], reverse=True)
    top_factors = ", ".join(f"{name}={value:.2f}" for name, value in ordered[:3])
    return f"{prediction.identifier} -> {prediction.readability_label} ({prediction.confidence:.2f}); top factors: {top_factors}"
