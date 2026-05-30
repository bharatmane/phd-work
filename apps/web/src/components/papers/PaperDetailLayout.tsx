import type { ReactNode } from "react";
import { GlassCard } from "../common/GlassCard";

type PaperDetailLayoutProps = {
  title: string;
  children: ReactNode;
};

export function PaperDetailLayout({ title, children }: PaperDetailLayoutProps) {
  return (
    <GlassCard>
      <h3 className="font-display text-2xl text-white">{title}</h3>
      <div className="mt-4 text-sm leading-7 text-slate-300">{children}</div>
    </GlassCard>
  );
}
