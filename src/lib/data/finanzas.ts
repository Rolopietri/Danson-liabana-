"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { aUsd } from "@/lib/money";
import type {
  Ajustes,
  Categoria,
  Movimiento,
  Recurrente,
  Moneda,
  TipoMovimiento,
  Canal,
} from "@/lib/types";

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

const AJUSTES_DEFAULT: Ajustes = {
  tasaEurUsd: 1.08,
  tasaVesUsd: 0.025,
  metaBeneficioUsd: 0,
};

function db() {
  return createSupabaseBrowserClient();
}

// ── Ajustes ──────────────────────────────────────────────────────────
export async function getAjustes(): Promise<Ajustes> {
  if (!isConfigured()) return AJUSTES_DEFAULT;
  const { data, error } = await db()
    .from("ajustes")
    .select("tasa_eur_usd, tasa_ves_usd, meta_beneficio_usd")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return AJUSTES_DEFAULT;
  return {
    tasaEurUsd: Number(data.tasa_eur_usd),
    tasaVesUsd: Number(data.tasa_ves_usd),
    metaBeneficioUsd: Number(data.meta_beneficio_usd),
  };
}

export async function updateAjustes(patch: Partial<Ajustes>): Promise<void> {
  const row: Record<string, number> = {};
  if (patch.tasaEurUsd !== undefined) row.tasa_eur_usd = patch.tasaEurUsd;
  if (patch.tasaVesUsd !== undefined) row.tasa_ves_usd = patch.tasaVesUsd;
  if (patch.metaBeneficioUsd !== undefined)
    row.meta_beneficio_usd = patch.metaBeneficioUsd;
  const { error } = await db()
    .from("ajustes")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

// ── Categorías ───────────────────────────────────────────────────────
type CatRow = {
  id: string;
  nombre: string;
  tipo: string;
  color: string | null;
  orden: number;
};

function toCategoria(r: CatRow): Categoria {
  return {
    id: r.id,
    nombre: r.nombre,
    tipo: r.tipo as TipoMovimiento,
    color: r.color,
    orden: r.orden,
  };
}

export async function listCategorias(): Promise<Categoria[]> {
  if (!isConfigured()) return [];
  const { data, error } = await db()
    .from("categorias")
    .select("id, nombre, tipo, color, orden")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data as CatRow[]).map(toCategoria);
}

export async function createCategoria(input: {
  nombre: string;
  tipo: TipoMovimiento;
  color?: string;
}): Promise<void> {
  const { error } = await db().from("categorias").insert({
    nombre: input.nombre,
    tipo: input.tipo,
    color: input.color ?? (input.tipo === "ingreso" ? "#1e7a5a" : "#b23a2f"),
  });
  if (error) throw error;
}

// ── Recurrentes (fijos) ──────────────────────────────────────────────
type RecRow = {
  id: string;
  nombre: string;
  monto: number | string;
  moneda: string;
  dia_cobro: number | null;
  categoria_id: string | null;
  activo: boolean;
  notas: string | null;
};

function toRecurrente(r: RecRow): Recurrente {
  return {
    id: r.id,
    nombre: r.nombre,
    monto: Number(r.monto),
    moneda: r.moneda as Moneda,
    diaCobro: r.dia_cobro,
    categoriaId: r.categoria_id,
    activo: r.activo,
    notas: r.notas,
  };
}

export async function listRecurrentes(): Promise<Recurrente[]> {
  if (!isConfigured()) return [];
  const { data, error } = await db()
    .from("recurrentes")
    .select("id, nombre, monto, moneda, dia_cobro, categoria_id, activo, notas")
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data as RecRow[]).map(toRecurrente);
}

export async function createRecurrente(input: {
  nombre: string;
  monto: number;
  moneda: Moneda;
  diaCobro?: number | null;
  categoriaId?: string | null;
  notas?: string | null;
}): Promise<void> {
  const { error } = await db().from("recurrentes").insert({
    nombre: input.nombre,
    monto: input.monto,
    moneda: input.moneda,
    dia_cobro: input.diaCobro ?? null,
    categoria_id: input.categoriaId ?? null,
    notas: input.notas ?? null,
  });
  if (error) throw error;
}

export async function setRecurrenteActivo(
  id: string,
  activo: boolean,
): Promise<void> {
  const { error } = await db()
    .from("recurrentes")
    .update({ activo })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRecurrente(id: string): Promise<void> {
  const { error } = await db().from("recurrentes").delete().eq("id", id);
  if (error) throw error;
}

// ── Movimientos ──────────────────────────────────────────────────────
type MovRow = {
  id: string;
  fecha: string;
  tipo: string;
  categoria_id: string | null;
  descripcion: string;
  monto: number | string;
  moneda: string;
  tasa_usd: number | string;
  monto_usd: number | string;
  canal: string | null;
  es_fijo: boolean;
  recurrente_id: string | null;
  notas: string | null;
  created_at: string;
};

function toMovimiento(r: MovRow): Movimiento {
  return {
    id: r.id,
    fecha: r.fecha,
    tipo: r.tipo as TipoMovimiento,
    categoriaId: r.categoria_id,
    descripcion: r.descripcion,
    monto: Number(r.monto),
    moneda: r.moneda as Moneda,
    tasaUsd: Number(r.tasa_usd),
    montoUsd: Number(r.monto_usd),
    canal: (r.canal as Canal) ?? null,
    esFijo: r.es_fijo,
    recurrenteId: r.recurrente_id,
    notas: r.notas,
    createdAt: r.created_at,
  };
}

export async function listMovimientos(rango?: {
  desde?: string;
  hasta?: string;
}): Promise<Movimiento[]> {
  if (!isConfigured()) return [];
  let q = db()
    .from("movimientos")
    .select(
      "id, fecha, tipo, categoria_id, descripcion, monto, moneda, tasa_usd, monto_usd, canal, es_fijo, recurrente_id, notas, created_at",
    )
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (rango?.desde) q = q.gte("fecha", rango.desde);
  if (rango?.hasta) q = q.lte("fecha", rango.hasta);
  const { data, error } = await q;
  if (error) throw error;
  return (data as MovRow[]).map(toMovimiento);
}

export async function createMovimiento(
  input: {
    fecha: string;
    tipo: TipoMovimiento;
    categoriaId: string | null;
    descripcion: string;
    monto: number;
    moneda: Moneda;
    canal?: Canal | null;
    esFijo?: boolean;
    notas?: string | null;
  },
  ajustes: Ajustes,
): Promise<void> {
  const tasa =
    input.moneda === "USD"
      ? 1
      : input.moneda === "EUR"
        ? ajustes.tasaEurUsd
        : ajustes.tasaVesUsd;
  const montoUsd = aUsd(input.monto, input.moneda, ajustes);
  const { error } = await db().from("movimientos").insert({
    fecha: input.fecha,
    tipo: input.tipo,
    categoria_id: input.categoriaId,
    descripcion: input.descripcion,
    monto: input.monto,
    moneda: input.moneda,
    tasa_usd: tasa,
    monto_usd: montoUsd,
    canal: input.canal ?? null,
    es_fijo: input.esFijo ?? false,
    notas: input.notas ?? null,
  });
  if (error) throw error;
}

export async function deleteMovimiento(id: string): Promise<void> {
  const { error } = await db().from("movimientos").delete().eq("id", id);
  if (error) throw error;
}
