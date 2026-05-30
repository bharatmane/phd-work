import { Link } from "react-router-dom";
import { heroMetrics } from "../../data/metrics";
import { MetricCard } from "../common/MetricCard";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.45em] text-cyan-100/75">PhD Research Portfolio · Bharat Babaso Mane</p>
          <h1 className="mt-6 font-display text-5xl leading-tight text-white md:text-7xl">
            When AI Writes the Code, Can It Also Judge Its Quality?
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            As AI agents generate more software, the ability to <strong className="text-white">measure, explain, and verify code quality</strong> automatically
            becomes critical. This thesis builds explainable deep learning tools that assess readability at every level —
            from a single identifier name to the developer behind the codebase.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/thesis-story"
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              The Research Story
            </Link>
            <Link
              to="/papers"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Papers
            </Link>
          </div>
        </div>
        <div className="grid gap-4 self-start">
          {heroMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}
