# thesis-core

`thesis-core` is the clean source area for code that supports the thesis methodology, experiments, and future tooling.

## Scope

- identifier extraction
- preprocessing and normalization
- readability feature construction
- experiment orchestration
- explainability support

## Structure

```text
packages/thesis-core/
  pyproject.toml
  src/thesis_core/
    config.py
    pipeline.py
    types.py
    identifier_extraction/
    preprocessing/
    features/
    models/
    explainability/
```

## Relationship to Legacy

Earlier materials remain preserved in `legacy/phd-workspace/`. This package is the new, cleaner code home for the thesis.
