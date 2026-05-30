"""Core package for thesis-supporting research code."""

from .pipeline import ResearchPipeline
from .types import IdentifierRecord, PipelinePrediction

__all__ = ["IdentifierRecord", "PipelinePrediction", "ResearchPipeline"]
