import { getMoedas, getHistoricoComparado } from "@/lib/brasilapi";
import ChartSection from "@/components/ChartSection";

export const instant = false;

export default async function Home() {
  const moedas = await getMoedas();
  const historicoInicial = await getHistoricoComparado(["USD"]);

  return (
    <main className="min-h-screen py-10">
      <ChartSection
        moedas={moedas}
        historicoInicial={historicoInicial}
        moedasIniciais={["USD"]}
      />
    </main>
  );
}
