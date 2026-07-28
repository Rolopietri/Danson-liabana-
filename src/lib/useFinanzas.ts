"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isConfigured,
  getAjustes,
  listCategorias,
  listMovimientos,
  listRecurrentes,
} from "@/lib/data/finanzas";
import { buildDemo } from "@/lib/demo";
import type { Ajustes, Categoria, Movimiento, Recurrente } from "@/lib/types";

export interface FinanzasData {
  categorias: Categoria[];
  movimientos: Movimiento[];
  recurrentes: Recurrente[];
  ajustes: Ajustes;
}

export function useFinanzas() {
  const [data, setData] = useState<FinanzasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isConfigured();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!configured) {
        setData(buildDemo());
        return;
      }
      const [categorias, movimientos, recurrentes, ajustes] = await Promise.all([
        listCategorias(),
        listMovimientos(),
        listRecurrentes(),
        getAjustes(),
      ]);
      setData({ categorias, movimientos, recurrentes, ajustes });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    // Carga inicial / recarga: patrón estándar de fetch en efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, configured, reload: load };
}
