"use client";

import { useState } from "react";
import { useFinanzas } from "@/lib/useFinanzas";
import { fmt, fmtUsd } from "@/lib/money";
import { aUsd } from "@/lib/money";
import { totalFijosUsd } from "@/lib/calc";
import {
  createRecurrente,
  setRecurrenteActivo,
  deleteRecurrente,
} from "@/lib/data/finanzas";
import { DemoBanner, EmptyState } from "@/components/ui";
import { PlusIcon, CloseIcon, RepeatIcon } from "@/components/icons";
import { MONEDAS, type Moneda } from "@/lib/types";

export function FijosClient() {
  const { data, loading, error, configured, reload } = useFinanzas();
  const [abierto, setAbierto] = useState(false);

  if (loading)
    return <p className="text-sm text-ink-mute py-20 text-center">Cargando…</p>;
  if (error)
    return (
      <div className="rounded-xl bg-neg-bg ring-1 ring-neg-line p-4 text-sm text-neg">
        {error}
      </div>
    );
  if (!data) return null;

  const total = totalFijosUsd(data.recurrentes, data.ajustes);
  const catNombre = new Map(data.categorias.map((c) => [c.id, c.nombre]));

  return (
    <div className="space-y-6">
      {!configured && <DemoBanner />}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-mute mb-1">Lo que se va solo</p>
          <h1 className="font-display text-3xl text-ink">Gastos fijos</h1>
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-ink text-paper px-4 py-2 text-sm hover:bg-gold-deep transition-colors"
        >
          {abierto ? (
            <CloseIcon className="size-4" />
          ) : (
            <PlusIcon className="size-4" />
          )}
          {abierto ? "Cerrar" : "Agregar"}
        </button>
      </div>

      <div className="rounded-2xl p-5 ring-1 ring-line bg-paper flex items-center gap-4">
        <div className="size-11 rounded-full bg-bone flex items-center justify-center text-ink-soft">
          <RepeatIcon className="size-5" />
        </div>
        <div>
          <p className="font-display text-3xl tnum text-ink">{fmtUsd(total)}</p>
          <p className="text-sm text-ink-soft">
            comprometidos cada mes en {data.recurrentes.filter((r) => r.activo).length}{" "}
            gastos recurrentes activos
          </p>
        </div>
      </div>

      {abierto && (
        <FormRecurrente
          data={data}
          configured={configured}
          onSaved={() => {
            setAbierto(false);
            reload();
          }}
        />
      )}

      {data.recurrentes.length === 0 ? (
        <EmptyState>
          Aún no has registrado gastos fijos. Empieza por Shopify, apps, almacén,
          nómina…
        </EmptyState>
      ) : (
        <div className="rounded-2xl ring-1 ring-line bg-paper divide-y divide-line-soft overflow-hidden">
          {data.recurrentes.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3 group">
              <button
                onClick={async () => {
                  if (!configured) return;
                  await setRecurrenteActivo(r.id, !r.activo);
                  reload();
                }}
                title={r.activo ? "Activo" : "Pausado"}
                className={`size-2.5 rounded-full shrink-0 ${
                  r.activo ? "bg-pos" : "bg-ink-mute"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm truncate ${
                    r.activo ? "text-ink" : "text-ink-mute line-through"
                  }`}
                >
                  {r.nombre}
                </p>
                <p className="text-xs text-ink-mute">
                  {r.categoriaId && `${catNombre.get(r.categoriaId) ?? ""}`}
                  {r.diaCobro && ` · día ${r.diaCobro}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="tnum text-sm font-medium text-ink">
                  {fmt(r.monto, r.moneda)}
                </p>
                {r.moneda !== "USD" && (
                  <p className="text-xs text-ink-mute tnum">
                    ≈ {fmtUsd(aUsd(r.monto, r.moneda, data.ajustes))}
                  </p>
                )}
              </div>
              {configured && (
                <button
                  onClick={async () => {
                    if (!confirm(`¿Eliminar "${r.nombre}"?`)) return;
                    await deleteRecurrente(r.id);
                    reload();
                  }}
                  className="opacity-0 group-hover:opacity-100 text-ink-mute hover:text-neg transition p-1"
                  title="Eliminar"
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormRecurrente({
  data,
  configured,
  onSaved,
}: {
  data: NonNullable<ReturnType<typeof useFinanzas>["data"]>;
  configured: boolean;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("USD");
  const [diaCobro, setDiaCobro] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const cats = data.categorias.filter((c) => c.tipo === "gasto");
  const inputCls =
    "w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const montoNum = Number(monto);
    if (!nombre.trim()) return setErr("Ponle un nombre.");
    if (!montoNum || montoNum <= 0) return setErr("Escribe un monto válido.");
    if (!configured)
      return setErr("Conecta Supabase para guardar gastos fijos reales.");
    setSaving(true);
    try {
      await createRecurrente({
        nombre: nombre.trim(),
        monto: montoNum,
        moneda,
        diaCobro: diaCobro ? Number(diaCobro) : null,
        categoriaId: categoriaId || null,
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error guardando");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl ring-1 ring-line bg-bone-soft p-5 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-ink-soft">Nombre</span>
          <input
            className={inputCls + " mt-1"}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Shopify, Klaviyo, almacén…"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-soft">Categoría</span>
          <select
            className={inputCls + " mt-1"}
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm text-ink-soft">Monto</span>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className={inputCls + " mt-1 tnum"}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-soft">Moneda</span>
          <select
            className={inputCls + " mt-1"}
            value={moneda}
            onChange={(e) => setMoneda(e.target.value as Moneda)}
          >
            {MONEDAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-ink-soft">Día de cobro</span>
          <input
            type="number"
            min="1"
            max="31"
            className={inputCls + " mt-1 tnum"}
            value={diaCobro}
            onChange={(e) => setDiaCobro(e.target.value)}
            placeholder="1"
          />
        </label>
      </div>

      {err && (
        <div className="rounded-lg bg-neg-bg ring-1 ring-neg-line p-3 text-sm text-neg">
          {err}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink text-paper px-5 py-2 text-sm font-medium hover:bg-gold-deep disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
