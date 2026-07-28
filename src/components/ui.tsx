import Link from "next/link";
import { WarningIcon } from "@/components/icons";

// Aviso de "modo vitrina" (datos de ejemplo, Supabase sin conectar).
export function DemoBanner() {
  return (
    <div className="rounded-xl bg-warn-bg ring-1 ring-warn-line px-4 py-3 flex items-start gap-3">
      <WarningIcon className="size-4 text-warn shrink-0 mt-0.5" />
      <p className="text-sm text-ink-soft leading-snug">
        <span className="font-medium text-ink">Modo demostración.</span> Estás
        viendo datos de ejemplo. Conecta Supabase (ver{" "}
        <span className="font-mono text-xs">README</span>) para registrar tus
        números reales.
      </p>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && <p className="eyebrow text-ink-mute mb-1">{eyebrow}</p>}
        <h2 className="font-display text-xl text-ink">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-sm text-gold-deep hover:text-ink transition-colors whitespace-nowrap"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-5 py-10 text-center text-sm text-ink-mute">
      {children}
    </div>
  );
}
