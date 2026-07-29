"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isConfigured } from "@/lib/data/finanzas";

function mensajeError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/invalid login credentials/i.test(msg))
    return "Correo o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg))
    return "Este usuario aún no está confirmado. Actívalo en Supabase (Auto Confirm).";
  return msg || "No se pudo entrar. Intenta de nuevo.";
}

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [errorMsg, setErrorMsg] = useState(search.get("error") || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (!isConfigured()) {
      setErrorMsg("El servidor no está configurado todavía.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      // Navegación completa para que el middleware vea la sesión (cookies).
      window.location.href = next;
    } catch (e) {
      setErrorMsg(mensajeError(e));
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-paper ring-1 ring-line p-5 space-y-3"
      >
        <label className="block">
          <span className="text-sm font-medium text-ink">Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">Contraseña</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-ink text-paper py-2.5 font-medium hover:bg-gold-deep disabled:opacity-50 transition-colors"
        >
          {status === "loading" ? "Entrando…" : "Entrar"}
        </button>
      </form>

      {errorMsg && (
        <div className="rounded-lg bg-neg-bg ring-1 ring-neg-line p-3 text-sm text-neg">
          {errorMsg}
        </div>
      )}

      <p className="text-xs text-ink-mute text-center">
        Acceso privado de Danson Liabana.
      </p>
    </div>
  );
}
