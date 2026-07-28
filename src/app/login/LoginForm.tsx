"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailIcon } from "@/components/icons";

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const errorParam = search.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState(errorParam || "");

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error enviando enlace");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-pos-bg ring-1 ring-pos-line p-6 text-center">
        <div className="mb-2 flex justify-center text-pos">
          <MailIcon className="size-8" />
        </div>
        <h2 className="font-medium text-ink">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Te enviamos un enlace a <span className="font-medium">{email}</span>.
          Haz clic y entrarás automáticamente.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
          className="mt-4 text-sm text-ink-soft underline"
        >
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleEmail}
        className="rounded-2xl bg-paper ring-1 ring-line p-5 space-y-3"
      >
        <label className="block">
          <span className="text-sm font-medium text-ink">
            Enlace mágico por correo
          </span>
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg ring-1 ring-line px-3 py-2 text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-ink text-paper py-2.5 font-medium hover:bg-gold-deep disabled:opacity-50 transition-colors"
        >
          {status === "sending" ? "Enviando…" : "Enviar enlace"}
        </button>
      </form>

      {errorMsg && (
        <div className="rounded-lg bg-neg-bg ring-1 ring-neg-line p-3 text-sm text-neg">
          {errorMsg}
        </div>
      )}

      <p className="text-xs text-ink-mute text-center">
        Solo correos autorizados pueden entrar.
      </p>
    </div>
  );
}
