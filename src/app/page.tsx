import { Header } from "@/components/Header";
import { PanelClient } from "./PanelClient";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
        <PanelClient />
      </main>
    </>
  );
}
