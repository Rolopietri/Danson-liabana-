import type { Moneda, Ajustes } from "@/lib/types";

// Cuántos USD vale 1 unidad de la moneda, según los ajustes actuales.
export function tasaAUsd(moneda: Moneda, ajustes: Ajustes): number {
  switch (moneda) {
    case "USD":
      return 1;
    case "EUR":
      return ajustes.tasaEurUsd;
    case "VES":
      return ajustes.tasaVesUsd;
  }
}

// Convierte un monto en su moneda nativa a USD.
export function aUsd(monto: number, moneda: Moneda, ajustes: Ajustes): number {
  return Math.round(monto * tasaAUsd(moneda, ajustes) * 100) / 100;
}

const SIMBOLO: Record<Moneda, string> = {
  USD: "$",
  EUR: "€",
  VES: "Bs",
};

// Formatea un monto en su moneda. USD/EUR con símbolo pegado; VES con "Bs".
export function fmt(monto: number, moneda: Moneda = "USD"): string {
  const abs = Math.abs(monto);
  const digits = moneda === "VES" ? 0 : 2;
  const n = abs.toLocaleString("es-VE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  const signo = monto < 0 ? "−" : "";
  return moneda === "VES" ? `${signo}Bs ${n}` : `${signo}${SIMBOLO[moneda]}${n}`;
}

// Formato USD compacto para tarjetas grandes ($10.000, $1.2k opcional).
export function fmtUsd(monto: number): string {
  return fmt(monto, "USD");
}

// "hace X" / fecha corta legible.
export function fmtFecha(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const meses = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  if (!y || !m || !d) return iso;
  return `${d} ${meses[m - 1]} ${y}`;
}

export { SIMBOLO };
