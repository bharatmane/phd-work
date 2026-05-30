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
          <h3 className="font-display text-3xl text-white">{researcherProfile.name}</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">{researcherProfile.department}</p>
          <p className="text-sm leading-7 text-slate-300">{researcherProfile.university}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">Supervisor: {researcherProfile.supervisor}</p>
          <p className="mt-4 text-sm leading-7 text-slate-300">Contact: {researcherProfile.contact}</p>
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
