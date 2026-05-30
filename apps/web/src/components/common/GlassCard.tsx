import type { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/6 p-6 shadow-glow backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
