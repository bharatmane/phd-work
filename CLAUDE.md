# CLAUDE.md

PhD research platform — automated, explainable code readability via CodeBERT + BiLSTM + SHAP.
Three papers (identifier → block → developer level). Deployed at https://phd.dgtula.com.

## Repo layout

```
apps/web/          React 19 + Vite portfolio site → see apps/web/CLAUDE.md
apps/api/          FastAPI + PyTorch prediction API → see apps/api/CLAUDE.md
packages/thesis-core/   importable Python package (setuptools, 3.11+)
src/python/readability/ older analysis/scoring/graph scripts (not deployed)
src/thesis-docs/   scripts for generating thesis document components (DOCX)
docs/synopsis/     thesis synopsis — Synopsis_Draft_v1.md + .docx
docs/papers/       paper working DOCXs (paper1/2/3 + study-guide)
docs/annexures/    university templates (Annexure 9/10/17/18)
docs/raw/          raw paper text and literature review notes
legacy/            archived earlier workspace — do not edit
figures/           chart outputs and CSVs
Jenkinsfile        CI: build web → rsync VPS, docker build API
package.json       npm workspaces (web only; API is standalone Python)
```

## Quick lookup

| Task | Where |
|------|-------|
| Page content / copy | `apps/web/src/pages/` |
| Navigation | `apps/web/src/layout/Navbar.tsx` + `src/data/site.ts` |
| Paper data | `apps/web/src/data/papers.ts` |
| Reusable UI components | `apps/web/src/components/common/` |
| Colors / theme | `apps/web/tailwind.config.cjs` + `src/index.css` |
| API endpoints | `apps/api/api.py` |
| ML model / features | `apps/api/src/model.py`, `features.py`, `preprocess.py` |
| Retrain model | `apps/api/train.py` |
| Analysis scripts | `src/python/readability/` |
| Research CSVs | `legacy/phd-workspace/data/processed/` or `apps/api/data/` |
| Thesis synopsis (MD + DOCX) | `docs/synopsis/` |
| Paper working documents | `docs/papers/` |
| University templates / annexures | `docs/annexures/` |
| Raw paper text / lit review | `docs/raw/` |
| DOCX generation scripts | `src/thesis-docs/` |
| API LLM context + caveats | `apps/api/CONTEXT_FOR_NEW_CHAT.md` |

## Dev commands

```bash
npm run dev        # Vite dev server for web (from repo root)
npm run build      # tsc + vite build → apps/web/dist/
python apps/api/api.py        # FastAPI on :8000
python apps/api/demo.py       # quick end-to-end sanity check
```
