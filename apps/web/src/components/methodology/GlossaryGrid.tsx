import { glossary } from "../../data/glossary";
import { GlassCard } from "../common/GlassCard";

export function GlossaryGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {glossary.map((item) => (
        <GlassCard key={item.term}>
          <h3 className="font-display text-2xl text-white">{item.term}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{item.meaning}</p>
        </GlassCard>
      ))}
    </div>
  );
}
