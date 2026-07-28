import type { Movimiento, Recurrente, Ajustes, Categoria } from "@/lib/types";
import { aUsd } from "@/lib/money";

// Clave de mes 'YYYY-MM' a partir de una fecha ISO 'YYYY-MM-DD'.
export function mesKey(iso: string): string {
  return iso.slice(0, 7);
}

// Mes actual y anterior como claves 'YYYY-MM'.
export function mesActual(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function mesAnterior(d = new Date()): string {
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  return mesActual(prev);
}

// Etiqueta legible de un mes 'YYYY-MM' → "julio 2026".
export function etiquetaMes(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  if (!y || !m) return key;
  return `${meses[m - 1]} ${y}`;
}

export interface CorteCategoria {
  categoriaId: string | null;
  nombre: string;
  color: string | null;
  totalUsd: number;
  porcentaje: number;
}

export interface ResumenMes {
  mes: string;
  ingresosUsd: number;
  gastosUsd: number;
  beneficioUsd: number;
  margen: number; // beneficio / ingresos
  ingresosPorCat: CorteCategoria[];
  gastosPorCat: CorteCategoria[];
}

export function resumenMes(
  movimientos: Movimiento[],
  mes: string,
  categorias: Categoria[],
): ResumenMes {
  const nombreCat = new Map(categorias.map((c) => [c.id, c.nombre]));
  const colorCat = new Map(categorias.map((c) => [c.id, c.color]));
  const delMes = movimientos.filter((m) => mesKey(m.fecha) === mes);

  const ingresosUsd = sum(delMes.filter((m) => m.tipo === "ingreso"));
  const gastosUsd = sum(delMes.filter((m) => m.tipo === "gasto"));
  const beneficioUsd = Math.round((ingresosUsd - gastosUsd) * 100) / 100;

  return {
    mes,
    ingresosUsd,
    gastosUsd,
    beneficioUsd,
    margen: ingresosUsd > 0 ? beneficioUsd / ingresosUsd : 0,
    ingresosPorCat: cortePorCategoria(
      delMes.filter((m) => m.tipo === "ingreso"),
      ingresosUsd,
      nombreCat,
      colorCat,
    ),
    gastosPorCat: cortePorCategoria(
      delMes.filter((m) => m.tipo === "gasto"),
      gastosUsd,
      nombreCat,
      colorCat,
    ),
  };
}

function sum(movs: Movimiento[]): number {
  return Math.round(movs.reduce((a, m) => a + m.montoUsd, 0) * 100) / 100;
}

function cortePorCategoria(
  movs: Movimiento[],
  total: number,
  nombreCat: Map<string, string>,
  colorCat: Map<string, string | null>,
): CorteCategoria[] {
  const acc = new Map<string, number>();
  for (const m of movs) {
    const key = m.categoriaId ?? "sin";
    acc.set(key, (acc.get(key) ?? 0) + m.montoUsd);
  }
  return [...acc.entries()]
    .map(([key, totalUsd]) => ({
      categoriaId: key === "sin" ? null : key,
      nombre: key === "sin" ? "Sin categoría" : nombreCat.get(key) ?? "—",
      color: key === "sin" ? null : colorCat.get(key) ?? null,
      totalUsd: Math.round(totalUsd * 100) / 100,
      porcentaje: total > 0 ? totalUsd / total : 0,
    }))
    .sort((a, b) => b.totalUsd - a.totalUsd);
}

// Total mensual comprometido en gastos fijos (recurrentes activos), en USD.
export function totalFijosUsd(
  recurrentes: Recurrente[],
  ajustes: Ajustes,
): number {
  const total = recurrentes
    .filter((r) => r.activo)
    .reduce((a, r) => a + aUsd(r.monto, r.moneda, ajustes), 0);
  return Math.round(total * 100) / 100;
}

// Variación porcentual entre dos valores (para comparativas).
export function variacion(actual: number, previo: number): number | null {
  if (previo === 0) return actual === 0 ? 0 : null;
  return (actual - previo) / Math.abs(previo);
}
