type BadgeProps = {
  children: string;
};

export function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">
      {children}
    </span>
  );
}
