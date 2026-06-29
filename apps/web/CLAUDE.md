# apps/web — React portfolio site

**Stack:** React 19, React Router 7, Vite 7, TypeScript 5.8 (strict), Tailwind 3.4

## Routes (App.tsx)

| Route | Page |
|-------|------|
| `/` | `pages/Home.tsx` |
| `/methodology` | `pages/Methodology.tsx` |
| `/methodology/iraf-xadl` | `pages/IrafXadlPage.tsx` |
| `/papers` | `pages/Papers.tsx` |
| `/papers/:paperId` | `pages/PaperDetail.tsx` |
| `/papers/iraf-xadl/animated` | `pages/IrafXadlAnimated.tsx` |
| `/papers/paper-2/animated` | `pages/EcrvrMvelAnimated.tsx` |
| `/papers/paper-3/animated` | `pages/EesqaDelmoaAnimated.tsx` |
| `/thesis-story` | `pages/ThesisStory.tsx` |
| `/thesis-integration` | `pages/ThesisIntegration.tsx` |
| `/thesis` | `pages/ThesisPage.tsx` (password-gated) |
| `/synopsis` | `pages/SynopsisPage.tsx` (password-gated) |
| `/viva-prep` | `pages/VivaPrepPage.tsx` (password-gated) |
| `/publications` | `pages/Publications.tsx` |
| `/about` | `pages/About.tsx` |
| `/demo` | `pages/DemoPage.tsx` (tabs: Try It / Samples / Experiments) |

Global layout wrapper: `layout/PageShell.tsx` (nav + footer around every route)

## Components

- `components/common/` — GlassCard, Badge, SectionHeader, MetricCard, PasswordGate
- `components/home/` — HeroSection, ResearchJourney, ContributionCards
- `components/methodology/` — MethodologyPipeline, ReadabilityFeatureGrid, BiLstmVisualizer, CodeBertVisualizer, ShapExplainer, PerformanceDashboard, LiveDemo, GlossaryGrid
- `components/papers/` — PaperCard, PaperDetailLayout, PresentationMode
- `layout/` — PageShell, Navbar, Footer

## Static data (src/data/)

| File | Exports |
|------|---------|
| `papers.ts` | 3 paper objects (title, status, abstract, methodology, results, venue, DOI) |
| `site.ts` | nav links, researcher profile (name, institution, supervisor) |
| `methodology.ts` | pipeline stages, readability parameters |
| `metrics.ts` | hero metrics, contribution metrics |
| `glossary.ts` | technical term definitions |

Types: `src/types.ts` — NavLink, Metric, MethodologyStage, ReadabilityParameter, Paper, GlossaryTerm

## Styling conventions

- Tailwind only; dark bg `#050913`
- Custom tokens: `aurora` (cyan), `ember` (rose), `gold` (amber), `ink`, `mist`
- Glass morphism: `backdrop-blur-xl bg-white/5 border border-white/10`
- Scroll animations: `useInView()` (IntersectionObserver, defined in ThesisStory.tsx) — toggles `opacity-0 translate-y-*`
- No global state; all local `useState` / `useEffect`

## Env vars

- `VITE_API_URL` — `http://localhost:8000` (dev) / `https://phd.dgtula.com/api` (prod)
