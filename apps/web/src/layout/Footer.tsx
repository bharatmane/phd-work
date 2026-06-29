import { researcherProfile } from "../data/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>PhD Research Platform</p>
        <p>Identifier readability, program comprehension, deep learning, and explainable AI.</p>
        <div className="flex flex-wrap gap-4">
          {researcherProfile.socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
