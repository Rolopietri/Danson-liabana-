"use client";

import { useEffect, useState } from "react";
import { useFinanzas } from "@/lib/useFinanzas";
import { updateAjustes } from "@/lib/data/finanzas";
import { DemoBanner } from "@/components/ui";
import { CheckIcon } from "@/components/icons";

export function AjustesClient() {
  const { data, loading, error, configured, reload } = useFinanzas();
  const [eur, setEur] = useState("");
  const [ves, setVes] = useState("");
  const [meta, setMeta] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Al llegar los datos, precargamos el formulario con los valores actuales.
    if (data) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setEur(String(data.ajustes.tasaEurUsd));
      setVes(String(data.ajustes.tasaVesUsd));
      setMeta(String(data.ajustes.metaBeneficioUsd));
      /* eslint-enable react-hooks/set-state-in-effect */
    }
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (!configured) {
      setErr("Conecta Supabase para guardar los ajustes.");
      return;
    }
    setSaving(true);
    try {
      await updateAjustes({
        tasaEurUsd: Number(eur) || 1,
        tasaVesUsd: Number(ves) || 0,
        metaBeneficioUsd: Number(meta) || 0,
      });
      setOk(true);
      reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error guardando");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink bg-paper tnum focus:outline-none focus:ring-2 focus:ring-gold";

  return (
    <div className="space-y-6">
      {!configured && <DemoBanner />}

      <div>
        <p className="eyebrow text-ink-mute mb-1">Configuración</p>
        <h1 className="font-display text-3xl text-ink">Ajustes</h1>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl ring-1 ring-line bg-paper p-5 space-y-5"
      >
        <div>
          <h2 className="font-display text-lg text-ink">Tasas de cambio</h2>
          <p className="text-sm text-ink-soft mt-1">
            Cuántos dólares vale 1 unidad de cada moneda. Todo el panel se
            normaliza a USD con estas tasas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-ink-soft">1 EUR = ? USD</span>
            <input
              type="number"
              step="0.0001"
              className={inputCls + " mt-1"}
              value={eur}
              onChange={(e) => setEur(e.target.value)}
            />
            <span className="text-xs text-ink-mute mt-1 block">
              Producción de Barcelona
            </span>
          </label>
          <label className="block">
            <span className="text-sm text-ink-soft">1 VES = ? USD</span>
            <input
              type="number"
              step="0.00000001"
              className={inputCls + " mt-1"}
              value={ves}
              onChange={(e) => setVes(e.target.value)}
            />
            <span className="text-xs text-ink-mute mt-1 block">
              Gastos en Venezuela (bolívares)
            </span>
          </label>
        </div>

        <hr className="border-line-soft" />

        <div>
          <h2 className="font-display text-lg text-ink">Meta de beneficio</h2>
          <p className="text-sm text-ink-soft mt-1">
            Cuánto quieres que te quede limpio cada mes (en USD). El panel te
            muestra el avance.
          </p>
          <label className="block mt-3 max-w-xs">
            <span className="text-sm text-ink-soft">Meta mensual (USD)</span>
            <input
              type="number"
              step="1"
              min="0"
              className={inputCls + " mt-1"}
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
            />
          </label>
        </div>

        {err && (
          <div className="rounded-lg bg-neg-bg ring-1 ring-neg-line p-3 text-sm text-neg">
            {err}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end">
          {ok && (
            <span className="inline-flex items-center gap-1 text-sm text-pos">
              <CheckIcon className="size-4" /> Guardado
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-ink text-paper px-5 py-2 text-sm font-medium hover:bg-gold-deep disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar ajustes"}
          </button>
        </div>
      </form>
    </div>
  );
}
