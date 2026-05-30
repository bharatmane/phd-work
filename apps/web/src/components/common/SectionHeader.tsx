import type { ReactNode } from "react";
import { Badge } from "./Badge";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <Badge>{eyebrow}</Badge>
        <h2 className="mt-4 font-display text-3xl text-white md:text-5xl">{title}</h2>
        <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
