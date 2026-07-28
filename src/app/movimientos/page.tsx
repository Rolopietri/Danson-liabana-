import { Header } from "@/components/Header";
import { MovimientosClient } from "./MovimientosClient";

export const metadata = { title: "Movimientos · Danson Liabana" };

export default function MovimientosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
        <MovimientosClient />
      </main>
    </>
  );
}
