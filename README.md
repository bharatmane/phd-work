# PhD Research Platform

This repository is organized around two active deliverables:

- `apps/web` - the public-facing PhD research website
- `packages/thesis-core` - source code that supports the thesis methodology and experiments

The earlier workspace has been preserved without rewriting history in:

- `legacy/phd-workspace`

## Repository Layout

```text
apps/
  web/                  Vite + React + TypeScript + Tailwind portfolio site
packages/
  thesis-core/          Python package for thesis-supporting code
legacy/
  phd-workspace/        Archived earlier workspace and materials
```

## Website

The website is designed to present:

- the overall PhD theme
- methodology pages including IRAF-XADL
- papers and publication status
- thesis integration narrative
- researcher profile and research context

## Thesis Code

`packages/thesis-core` is the clean source area for the next iteration of the research codebase. It is structured so the thesis-supporting logic can evolve independently from the public website.

## Legacy Materials

The archived workspace contains prior papers, figures, datasets, and earlier source artifacts. It is intentionally kept separate so new website and code work can proceed without mixing concerns.
