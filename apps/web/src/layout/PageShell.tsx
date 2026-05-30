import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-mesh text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-8 top-24 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-56 w-56 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-300/5 blur-3xl" />
      </div>
      <div className="relative">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
