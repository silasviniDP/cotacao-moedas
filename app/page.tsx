import { connection } from "next/server";
import { getMoedas, getHistoricoComparado } from "@/lib/brasilapi";
import ChartSection from "@/components/ChartSection";

export default async function Home() {
  await connection(); // força essa página a rodar a cada visita, não só no build
  
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
