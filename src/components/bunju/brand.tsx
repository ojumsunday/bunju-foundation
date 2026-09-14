import { Link } from "@tanstack/react-router";

export function BunjuBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Bunju home">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-xl font-semibold text-primary-foreground shadow-lg shadow-primary/20">
        B
      </span>
      {!compact && (
        <span>
          <span className="block text-sm font-semibold leading-none">Bunju</span>
          <span className="mt-1 block font-mono text-[9px] uppercase text-muted-foreground">
            Proof network
          </span>
        </span>
      )}
    </Link>
  );
}