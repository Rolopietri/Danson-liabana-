import { Header } from "@/components/Header";
import { FijosClient } from "./FijosClient";

export const metadata = { title: "Fijos · Danson Liabana" };

export default function FijosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
        <FijosClient />
      </main>
    </>
  );
}
