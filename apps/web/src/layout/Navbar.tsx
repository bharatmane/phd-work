import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navLinks } from "../data/site";

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slateglass/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" fill="none" className="h-9 w-9 shrink-0">
            <rect width="32" height="32" rx="8" fill="#0b1220" />
            <circle cx="9" cy="9" r="2.6" fill="#22d3ee" />
            <circle cx="23" cy="9" r="2.6" fill="#a78bfa" />
            <circle cx="9" cy="23" r="2.6" fill="#a78bfa" />
            <circle cx="23" cy="23" r="2.6" fill="#22d3ee" />
            <circle cx="16" cy="16" r="3.2" fill="#67e8f9" />
            <path d="M9 9 L16 16 M23 9 L16 16 M9 23 L16 16 M23 23 L16 16" stroke="#67e8f9" strokeWidth="1.4" strokeLinecap="round" opacity={0.85} />
          </svg>
          <div>
            <p className="font-display text-xl text-white">PhD Research Platform</p>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">
              Program Comprehension and Explainable AI
            </p>
          </div>
        </div>
        <nav className="hidden flex-nowrap items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            if (link.children) {
              const isOpen = openMenu === link.label;
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(link.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenu(isOpen ? null : link.label)}
                    className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
                  >
                    {link.label}
                    <svg className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="absolute right-0 top-full z-50 pt-2">
                      <div className="min-w-[160px] rounded-2xl border border-white/10 bg-slateglass/95 p-2 shadow-glow backdrop-blur-xl">
                        {link.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setOpenMenu(null)}
                            className={({ isActive }) =>
                              `block rounded-xl px-4 py-2 text-sm transition ${
                                isActive
                                  ? "bg-white/14 text-white"
                                  : "text-slate-300 hover:bg-white/8 hover:text-white"
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return link.label === "Live Demo" ? (
              <NavLink
                key={link.to}
                to={link.to}
                className="whitespace-nowrap rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3 py-2
                           text-sm font-semibold text-cyan-300 transition
                           hover:bg-cyan-400/30 hover:text-cyan-200"
              >
                ⚡ {link.label}
              </NavLink>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-white/14 text-white"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
