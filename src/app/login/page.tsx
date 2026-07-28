import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar · Danson Liabana" };

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl tracking-[0.02em] text-ink">
            Danson Liabana
          </h1>
          <p className="eyebrow text-ink-mute mt-2">Finanzas</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
