import { GlassCard } from "../components/common/GlassCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { researcherProfile } from "../data/site";

export function About() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <SectionHeader
        eyebrow="About"
        title="Researcher profile"
        description="A concise academic profile section for synopsis review, thesis defense, research networking, and portfolio use."
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <GlassCard>
          <div className="flex items-center gap-4">
            <img
              src={researcherProfile.photo}
              alt={researcherProfile.name}
              className="h-20 w-20 rounded-full border border-white/15 object-cover"
            />
            <h3 className="font-display text-3xl text-white">{researcherProfile.name}</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">{researcherProfile.department}</p>
          <p className="text-sm leading-7 text-slate-300">{researcherProfile.university}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">Supervisor: {researcherProfile.supervisor}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">Contact: {researcherProfile.contact}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {researcherProfile.socialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
          <a
            href="/docs/PRN_Certificate.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25 transition-colors"
          >
            PRN Certificate (2020) ↓
          </a>
        </GlassCard>
        <GlassCard>
          <h3 className="font-display text-2xl text-white">Research interests</h3>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-300 md:grid-cols-2">
            {researcherProfile.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
