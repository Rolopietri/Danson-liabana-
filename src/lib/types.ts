// ─── Tipos del dominio — Danson Liabana ─────────────────────────────

export type Moneda = "USD" | "EUR" | "VES";
export const MONEDAS: Moneda[] = ["USD", "EUR", "VES"];

export type TipoMovimiento = "ingreso" | "gasto";

export type Canal =
  | "web"
  | "instagram"
  | "tienda"
  | "mayor"
  | "otro";

export const CANALES: { value: Canal; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "instagram", label: "Instagram" },
  { value: "tienda", label: "Tienda" },
  { value: "mayor", label: "Mayor" },
  { value: "otro", label: "Otro" },
];

export interface Categoria {
  id: string;
  nombre: string;
  tipo: TipoMovimiento;
  color: string | null;
  orden: number;
}

export interface Recurrente {
  id: string;
  nombre: string;
  monto: number;
  moneda: Moneda;
  diaCobro: number | null;
  categoriaId: string | null;
  activo: boolean;
  notas: string | null;
}

export interface Movimiento {
  id: string;
  fecha: string; // YYYY-MM-DD
  tipo: TipoMovimiento;
  categoriaId: string | null;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  tasaUsd: number;
  montoUsd: number;
  canal: Canal | null;
  esFijo: boolean;
  recurrenteId: string | null;
  notas: string | null;
  createdAt: string;
}

export interface Ajustes {
  tasaEurUsd: number;
  tasaVesUsd: number;
  metaBeneficioUsd: number;
}
