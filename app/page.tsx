import { connection } from "next/server";
import { getMoedas, getHistoricoComparado } from "@/lib/brasilapi";
import ChartSection from "@/components/ChartSection";
import ThemeToggle from "@/components/ThemeToggle";

export const instant = false;

export default async function Home() {
  await connection();

  const moedas = await getMoedas();
  const historicoInicial = await getHistoricoComparado(["USD"]);

  return (
    <main className="min-h-screen py-10">
      <div className="w-full max-w-3xl mx-auto px-6 flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground/70">
          Cotação de Moedas
        </span>
        <ThemeToggle />
      </div>

      <ChartSection
        moedas={moedas}
        historicoInicial={historicoInicial}
        moedasIniciais={["USD"]}
      />
    </main>
  );
}
