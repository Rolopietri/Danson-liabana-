"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFinanzas } from "@/lib/useFinanzas";
import { fmtUsd } from "@/lib/money";
import {
  resumenMes,
  totalFijosUsd,
  mesActual,
  mesAnterior,
  etiquetaMes,
  variacion,
  type CorteCategoria,
} from "@/lib/calc";
import { DemoBanner, SectionTitle, EmptyState } from "@/components/ui";
import {
  TrendUpIcon,
  TrendDownIcon,
  RepeatIcon,
  PlusIcon,
  TargetIcon,
} from "@/components/icons";

export function PanelClient() {
  const { data, loading, error, configured } = useFinanzas();

  const view = useMemo(() => {
    if (!data) return null;
    const mes = mesActual();
    const prev = mesAnterior();
    const actual = resumenMes(data.movimientos, mes, data.categorias);
    const anterior = resumenMes(data.movimientos, prev, data.categorias);
    const fijos = totalFijosUsd(data.recurrentes, data.ajustes);
    return { mes, actual, anterior, fijos, ajustes: data.ajustes };
  }, [data]);

  if (loading) {
    return <p className="text-sm text-ink-mute py-20 text-center">Cargando…</p>;
  }
  if (error) {
    return (
      <div className="rounded-xl bg-neg-bg ring-1 ring-neg-line p-4 text-sm text-neg">
        {error}
      </div>
    );
  }
  if (!view) return null;

  const { actual, anterior, fijos, ajustes } = view;
  const beneficioBueno = actual.beneficioUsd >= 0;
  const fijosPct =
    actual.ingresosUsd > 0 ? fijos / actual.ingresosUsd : 0;
  const varBeneficio = variacion(actual.beneficioUsd, anterior.beneficioUsd);

  return (
    <div className="space-y-8">
      {!configured && <DemoBanner />}

      {/* Encabezado del mes */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-ink-mute mb-1">Resumen del mes</p>
          <h1 className="font-display text-3xl sm:text-4xl text-ink capitalize">
            {etiquetaMes(actual.mes)}
          </h1>
        </div>
        <Link
          href="/movimientos"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-ink text-paper px-4 py-2 text-sm hover:bg-gold-deep transition-colors"
        >
          <PlusIcon className="size-4" /> Registrar
        </Link>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-line rounded-2xl overflow-hidden ring-1 ring-line">
        <Kpi
          label="Facturación"
          value={actual.ingresosUsd}
          prev={anterior.ingresosUsd}
          tone="pos"
        />
        <Kpi
          label="Gastos"
          value={actual.gastosUsd}
          prev={anterior.gastosUsd}
          tone="neg"
          invertVar
        />
        <Kpi
          label="Beneficio neto"
          value={actual.beneficioUsd}
          prev={anterior.beneficioUsd}
          tone={beneficioBueno ? "pos" : "neg"}
          strong
        />
      </div>

      {/* Lo que queda + margen + fijos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`rounded-2xl p-5 ring-1 ${
            beneficioBueno
              ? "bg-pos-bg ring-pos-line"
              : "bg-neg-bg ring-neg-line"
          }`}
        >
          <p className="eyebrow text-ink-mute">Lo que te queda</p>
          <p
            className={`mt-2 font-display text-3xl tnum ${
              beneficioBueno ? "text-pos" : "text-neg"
            }`}
          >
            {fmtUsd(actual.beneficioUsd)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Margen {(actual.margen * 100).toFixed(0)}%
            {varBeneficio !== null && (
              <>
                {" · "}
                <span className={varBeneficio >= 0 ? "text-pos" : "text-neg"}>
                  {varBeneficio >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(varBeneficio * 100).toFixed(0)}% vs. mes anterior
                </span>
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl p-5 ring-1 ring-line bg-paper">
          <div className="flex items-center gap-2 text-ink-mute">
            <RepeatIcon className="size-4" />
            <p className="eyebrow">Fijos comprometidos / mes</p>
          </div>
          <p className="mt-2 font-display text-3xl tnum text-ink">
            {fmtUsd(fijos)}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {(fijosPct * 100).toFixed(0)}% de tu facturación se va sola cada mes.{" "}
            <Link href="/fijos" className="text-gold-deep hover:text-ink">
              Ver
            </Link>
          </p>
        </div>

        <div className="rounded-2xl p-5 ring-1 ring-line bg-paper">
          <div className="flex items-center gap-2 text-ink-mute">
            <TargetIcon className="size-4" />
            <p className="eyebrow">Meta de beneficio</p>
          </div>
          {ajustes.metaBeneficioUsd > 0 ? (
            <>
              <p className="mt-2 font-display text-3xl tnum text-ink">
                {fmtUsd(ajustes.metaBeneficioUsd)}
              </p>
              <Meta
                actual={actual.beneficioUsd}
                meta={ajustes.metaBeneficioUsd}
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-mute">
              Define una meta en{" "}
              <Link href="/ajustes" className="text-gold-deep hover:text-ink">
                Ajustes
              </Link>{" "}
              para medir tu avance.
            </p>
          )}
        </div>
      </div>

      {/* ¿En qué se va? */}
      <section>
        <SectionTitle
          eyebrow="El punto de fuga"
          title="¿En qué se va?"
          action={{ href: "/movimientos", label: "Ver movimientos" }}
        />
        {actual.gastosPorCat.length === 0 ? (
          <EmptyState>Aún no hay gastos este mes.</EmptyState>
        ) : (
          <div className="rounded-2xl ring-1 ring-line bg-paper p-5 space-y-3">
            {actual.gastosPorCat.map((c) => (
              <BarraCategoria key={c.categoriaId ?? "sin"} corte={c} tone="neg" />
            ))}
          </div>
        )}
      </section>

      {/* De dónde entra */}
      {actual.ingresosPorCat.length > 0 && (
        <section>
          <SectionTitle eyebrow="De dónde entra" title="Ingresos por origen" />
          <div className="rounded-2xl ring-1 ring-line bg-paper p-5 space-y-3">
            {actual.ingresosPorCat.map((c) => (
              <BarraCategoria
                key={c.categoriaId ?? "sin"}
                corte={c}
                tone="pos"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  prev,
  tone,
  strong,
  invertVar,
}: {
  label: string;
  value: number;
  prev: number;
  tone: "pos" | "neg";
  strong?: boolean;
  invertVar?: boolean;
}) {
  const v = variacion(value, prev);
  // Para gastos, "subir" es malo → invertimos el color de la variación.
  const good = v === null ? true : invertVar ? v <= 0 : v >= 0;
  return (
    <div className="bg-paper p-5">
      <p className="eyebrow text-ink-mute">{label}</p>
      <p
        className={`mt-2 font-display tnum ${strong ? "text-3xl" : "text-2xl"} ${
          strong ? (tone === "pos" ? "text-pos" : "text-neg") : "text-ink"
        }`}
      >
        {fmtUsd(value)}
      </p>
      {v !== null && (
        <p
          className={`mt-1 text-xs flex items-center gap-1 ${
            good ? "text-pos" : "text-neg"
          }`}
        >
          {v >= 0 ? (
            <TrendUpIcon className="size-3.5" />
          ) : (
            <TrendDownIcon className="size-3.5" />
          )}
          {Math.abs(v * 100).toFixed(0)}% vs. mes anterior
        </p>
      )}
    </div>
  );
}

function BarraCategoria({
  corte,
  tone,
}: {
  corte: CorteCategoria;
  tone: "pos" | "neg";
}) {
  const pct = Math.max(2, Math.round(corte.porcentaje * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="text-ink">{corte.nombre}</span>
        <span className="tnum text-ink-soft">
          {fmtUsd(corte.totalUsd)}
          <span className="text-ink-mute ml-2">
            {(corte.porcentaje * 100).toFixed(0)}%
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-bone overflow-hidden">
        <div
          className={`h-full rounded-full ${
            tone === "pos" ? "bg-pos" : "bg-neg"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Meta({ actual, meta }: { actual: number; meta: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((actual / meta) * 100)));
  return (
    <>
      <div className="mt-3 h-2 rounded-full bg-bone overflow-hidden">
        <div
          className="h-full rounded-full bg-gold"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-ink-soft">{pct}% de la meta</p>
    </>
  );
}
