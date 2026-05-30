import { NavLink } from "react-router-dom";
import { navLinks } from "../data/site";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slateglass/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div>
          <p className="font-display text-xl text-white">PhD Research Platform</p>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">
            Program Comprehension and Explainable AI
          </p>
        </div>
        <nav className="hidden flex-wrap gap-2 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? "bg-white/14 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
