// Datos de demostración para el "modo vitrina" (cuando Supabase aún no está
// conectado). Cuentan la historia real: ~$10.000 que entran y se van lentamente
// en muchos gastos pequeños, sobre todo fijos.

import type { Categoria, Movimiento, Recurrente, Ajustes } from "@/lib/types";

const AJUSTES: Ajustes = {
  tasaEurUsd: 1.08,
  tasaVesUsd: 0.025,
  metaBeneficioUsd: 2500,
};

const CATS: Categoria[] = [
  { id: "c-web", nombre: "Ventas web", tipo: "ingreso", color: "#1e7a5a", orden: 10 },
  { id: "c-ig", nombre: "Ventas Instagram", tipo: "ingreso", color: "#1e7a5a", orden: 20 },
  { id: "c-mayor", nombre: "Ventas mayor", tipo: "ingreso", color: "#1e7a5a", orden: 30 },
  { id: "g-prod", nombre: "Producción (Barcelona)", tipo: "gasto", color: "#b23a2f", orden: 10 },
  { id: "g-envio", nombre: "Envíos / logística", tipo: "gasto", color: "#b23a2f", orden: 30 },
  { id: "g-ads", nombre: "Marketing / Ads", tipo: "gasto", color: "#b23a2f", orden: 40 },
  { id: "g-com", nombre: "Comisiones plataforma", tipo: "gasto", color: "#b23a2f", orden: 50 },
  { id: "g-soft", nombre: "Software / Apps", tipo: "gasto", color: "#b23a2f", orden: 60 },
  { id: "g-nom", nombre: "Nómina / Colaboradores", tipo: "gasto", color: "#b23a2f", orden: 70 },
  { id: "g-alm", nombre: "Almacén", tipo: "gasto", color: "#b23a2f", orden: 80 },
];

function d(dia: number): string {
  const now = new Date();
  const day = Math.min(dia, 28);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function usd(
  id: string,
  fecha: string,
  tipo: "ingreso" | "gasto",
  categoriaId: string,
  descripcion: string,
  monto: number,
  extra: Partial<Movimiento> = {},
): Movimiento {
  return {
    id,
    fecha,
    tipo,
    categoriaId,
    descripcion,
    monto,
    moneda: "USD",
    tasaUsd: 1,
    montoUsd: monto,
    canal: null,
    esFijo: false,
    recurrenteId: null,
    notas: null,
    createdAt: fecha,
    ...extra,
  };
}

const MOVS: Movimiento[] = [
  // Ingresos (~$10.000)
  usd("m1", d(3), "ingreso", "c-web", "Ventas tienda online", 4200, { canal: "web" }),
  usd("m2", d(8), "ingreso", "c-ig", "Pedidos por Instagram", 2600, { canal: "instagram" }),
  usd("m3", d(14), "ingreso", "c-web", "Ventas tienda online", 1900, { canal: "web" }),
  usd("m4", d(20), "ingreso", "c-mayor", "Pedido mayorista boutique", 1500, { canal: "mayor" }),
  // Gastos grandes
  usd("m5", d(5), "gasto", "g-prod", "Lote producción SS — taller Barcelona", 3800, { moneda: "EUR", tasaUsd: 1.08, montoUsd: 4104, monto: 3800 }),
  usd("m6", d(6), "gasto", "g-envio", "Envío lote Barcelona → Caracas", 620),
  usd("m7", d(9), "gasto", "g-ads", "Campaña Meta Ads", 900),
  // Muerte por mil cortes (fijos)
  usd("m8", d(1), "gasto", "g-soft", "Shopify", 39, { esFijo: true }),
  usd("m9", d(1), "gasto", "g-soft", "Klaviyo (email)", 45, { esFijo: true }),
  usd("m10", d(1), "gasto", "g-soft", "Canva Pro", 15, { esFijo: true }),
  usd("m11", d(2), "gasto", "g-soft", "App de reseñas", 29, { esFijo: true }),
  usd("m12", d(2), "gasto", "g-alm", "Almacén / fulfillment", 180, { esFijo: true }),
  usd("m13", d(4), "gasto", "g-nom", "Community manager", 350, { esFijo: true }),
  usd("m14", d(10), "gasto", "g-com", "Comisiones Shopify Payments", 310),
  usd("m15", d(12), "gasto", "g-com", "Comisiones pasarela IG", 130),
  usd("m16", d(16), "gasto", "g-ads", "Colaboración micro-influencer", 250),
  usd("m17", d(18), "gasto", "g-envio", "Envíos a clientas (courier)", 240),
  usd("m18", d(22), "gasto", "g-soft", "Dominio + correo", 22, { esFijo: true }),
];

const RECS: Recurrente[] = [
  { id: "r1", nombre: "Shopify", monto: 39, moneda: "USD", diaCobro: 1, categoriaId: "g-soft", activo: true, notas: null },
  { id: "r2", nombre: "Klaviyo (email)", monto: 45, moneda: "USD", diaCobro: 1, categoriaId: "g-soft", activo: true, notas: null },
  { id: "r3", nombre: "Canva Pro", monto: 15, moneda: "USD", diaCobro: 1, categoriaId: "g-soft", activo: true, notas: null },
  { id: "r4", nombre: "App de reseñas", monto: 29, moneda: "USD", diaCobro: 2, categoriaId: "g-soft", activo: true, notas: null },
  { id: "r5", nombre: "Almacén / fulfillment", monto: 180, moneda: "USD", diaCobro: 2, categoriaId: "g-alm", activo: true, notas: null },
  { id: "r6", nombre: "Community manager", monto: 350, moneda: "USD", diaCobro: 4, categoriaId: "g-nom", activo: true, notas: null },
  { id: "r7", nombre: "Dominio + correo", monto: 22, moneda: "USD", diaCobro: 22, categoriaId: "g-soft", activo: true, notas: null },
];

export function buildDemo() {
  return { categorias: CATS, movimientos: MOVS, recurrentes: RECS, ajustes: AJUSTES };
}
