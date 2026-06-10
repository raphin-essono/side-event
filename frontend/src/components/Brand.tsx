import { Link } from "@tanstack/react-router";

export function Brand({ subtitle }: { subtitle?: string }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative h-9 w-9 rounded-xl bg-[var(--gradient-hero)] shadow-[var(--shadow-glow)] grid place-items-center">
        <span className="text-primary-foreground font-display font-bold text-sm">S</span>
      </div>
      <div className="leading-tight">
        <div className="font-display font-semibold tracking-tight">SING · VivaTech</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </Link>
  );
}
