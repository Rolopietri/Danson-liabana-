"use client";

import { useMemo, useState } from "react";
import { useFinanzas } from "@/lib/useFinanzas";
import { fmt, fmtUsd, fmtFecha } from "@/lib/money";
import { mesKey, etiquetaMes } from "@/lib/calc";
import { createMovimiento, deleteMovimiento } from "@/lib/data/finanzas";
import { DemoBanner, EmptyState } from "@/components/ui";
import { PlusIcon, CloseIcon } from "@/components/icons";
import {
  MONEDAS,
  CANALES,
  type Moneda,
  type TipoMovimiento,
  type Canal,
} from "@/lib/types";

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function MovimientosClient() {
  const { data, loading, error, configured, reload } = useFinanzas();
  const [abierto, setAbierto] = useState(false);

  const grupos = useMemo(() => {
    if (!data) return [];
    const catNombre = new Map(data.categorias.map((c) => [c.id, c.nombre]));
    const porMes = new Map<string, typeof data.movimientos>();
    for (const m of data.movimientos) {
      const k = mesKey(m.fecha);
      if (!porMes.has(k)) porMes.set(k, []);
      porMes.get(k)!.push(m);
    }
    return [...porMes.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([mes, movs]) => ({
        mes,
        movs,
        catNombre,
      }));
  }, [data]);

  if (loading)
    return <p className="text-sm text-ink-mute py-20 text-center">Cargando…</p>;
  if (error)
    return (
      <div className="rounded-xl bg-neg-bg ring-1 ring-neg-line p-4 text-sm text-neg">
        {error}
      </div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      {!configured && <DemoBanner />}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-mute mb-1">Libro</p>
          <h1 className="font-display text-3xl text-ink">Movimientos</h1>
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
          {abierto ? "Cerrar" : "Registrar"}
        </button>
      </div>

      {abierto && (
        <FormMovimiento
          data={data}
          configured={configured}
          onSaved={() => {
            setAbierto(false);
            reload();
          }}
        />
      )}

      {grupos.length === 0 ? (
        <EmptyState>Aún no has registrado movimientos.</EmptyState>
      ) : (
        <div className="space-y-8">
          {grupos.map((g) => (
            <div key={g.mes}>
              <p className="eyebrow text-ink-mute mb-3 capitalize">
                {etiquetaMes(g.mes)}
              </p>
              <div className="rounded-2xl ring-1 ring-line bg-paper divide-y divide-line-soft overflow-hidden">
                {g.movs.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-3 group"
                  >
                    <span
                      className={`size-2 rounded-full shrink-0 ${
                        m.tipo === "ingreso" ? "bg-pos" : "bg-neg"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink truncate">
                        {m.descripcion || "(sin descripción)"}
                      </p>
                      <p className="text-xs text-ink-mute">
                        {fmtFecha(m.fecha)}
                        {m.categoriaId &&
                          ` · ${g.catNombre.get(m.categoriaId) ?? ""}`}
                        {m.esFijo && " · fijo"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`tnum text-sm font-medium ${
                          m.tipo === "ingreso" ? "text-pos" : "text-neg"
                        }`}
                      >
                        {m.tipo === "ingreso" ? "+" : "−"}
                        {fmtUsd(m.montoUsd)}
                      </p>
                      {m.moneda !== "USD" && (
                        <p className="text-xs text-ink-mute tnum">
                          {fmt(m.monto, m.moneda)}
                        </p>
                      )}
                    </div>
                    {configured && (
                      <button
                        onClick={async () => {
                          if (!confirm("¿Eliminar este movimiento?")) return;
                          await deleteMovimiento(m.id);
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormMovimiento({
  data,
  configured,
  onSaved,
}: {
  data: ReturnType<typeof useFinanzas>["data"] & object;
  configured: boolean;
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState<TipoMovimiento>("gasto");
  const [fecha, setFecha] = useState(hoy());
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<Moneda>("USD");
  const [canal, setCanal] = useState<Canal | "">("");
  const [esFijo, setEsFijo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const cats = data!.categorias.filter((c) => c.tipo === tipo);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const montoNum = Number(monto);
    if (!montoNum || montoNum <= 0) {
      setErr("Escribe un monto válido.");
      return;
    }
    if (!configured) {
      setErr("Conecta Supabase para registrar movimientos reales.");
      return;
    }
    setSaving(true);
    try {
      await createMovimiento(
        {
          fecha,
          tipo,
          categoriaId: categoriaId || null,
          descripcion: descripcion.trim(),
          monto: montoNum,
          moneda,
          canal: tipo === "ingreso" && canal ? (canal as Canal) : null,
          esFijo,
        },
        data!.ajustes,
      );
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error guardando");
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl ring-1 ring-line bg-bone-soft p-5 space-y-4"
    >
      {/* Tipo */}
      <div className="inline-flex rounded-full bg-bone p-1 ring-1 ring-line">
        {(["gasto", "ingreso"] as TipoMovimiento[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTipo(t);
              setCategoriaId("");
            }}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              tipo === t
                ? t === "ingreso"
                  ? "bg-pos text-paper"
                  : "bg-neg text-paper"
                : "text-ink-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm text-ink-soft">Descripción</span>
          <input
            className={inputCls + " mt-1"}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={tipo === "ingreso" ? "Ventas de la semana" : "Shopify"}
          />
        </label>
        <label className="block">
          <span className="text-sm text-ink-soft">Fecha</span>
          <input
            type="date"
            className={inputCls + " mt-1"}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="block col-span-1">
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
        <label className="block col-span-2">
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

      <div className="flex flex-wrap items-center gap-4">
        {tipo === "ingreso" && (
          <label className="block">
            <span className="text-sm text-ink-soft mr-2">Canal</span>
            <select
              className="rounded-lg ring-1 ring-line px-3 py-1.5 text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold"
              value={canal}
              onChange={(e) => setCanal(e.target.value as Canal | "")}
            >
              <option value="">—</option>
              {CANALES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {tipo === "gasto" && (
          <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={esFijo}
              onChange={(e) => setEsFijo(e.target.checked)}
              className="size-4 accent-gold"
            />
            Es un gasto fijo / recurrente
          </label>
        )}
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
