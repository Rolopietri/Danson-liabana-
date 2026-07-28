import { Header } from "@/components/Header";
import { AjustesClient } from "./AjustesClient";

export const metadata = { title: "Ajustes · Danson Liabana" };

export default function AjustesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-8 sm:py-10">
        <AjustesClient />
      </main>
    </>
  );
}
