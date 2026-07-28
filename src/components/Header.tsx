"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutIcon } from "@/components/icons";

const NAV = [
  { href: "/", label: "Panel" },
  { href: "/movimientos", label: "Movimientos" },
  { href: "/fijos", label: "Fijos" },
  { href: "/ajustes", label: "Ajustes" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto w-full max-w-5xl px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-lg tracking-[0.02em] text-ink">
            Danson Liabana
          </span>
          <span className="eyebrow text-ink-mute mt-1">Finanzas</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  active
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-bone"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <form action="/api/logout" method="post" className="ml-1">
            <button
              type="submit"
              title="Salir"
              className="p-2 rounded-full text-ink-mute hover:text-ink hover:bg-bone transition-colors"
            >
              <LogoutIcon className="size-4" />
            </button>
          </form>
        </nav>
      </div>

      {/* Nav móvil */}
      <nav className="sm:hidden flex items-center gap-1 overflow-x-auto px-5 pb-3">
        {NAV.map((n) => {
          const active =
            n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                active ? "bg-ink text-paper" : "text-ink-soft bg-bone"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
