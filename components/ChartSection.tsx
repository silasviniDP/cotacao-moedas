"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Moeda, PontoComparado } from "@/lib/brasilapi";
import { inverterParaReal } from "@/lib/brasilapi";

const CORES = ["#2954A6", "#C2410C", "#059669", "#7C3AED"];
const MAX_MOEDAS = 4;

type Props = {
  moedas: Moeda[];
  historicoInicial: PontoComparado[];
  moedasIniciais: string[];
};

export default function ChartSection({
  moedas,
  historicoInicial,
  moedasIniciais,
}: Props) {
  const [selecionadas, setSelecionadas] = useState<string[]>(moedasIniciais);
  const [historico, setHistorico] = useState<PontoComparado[]>(historicoInicial);
  const [carregando, setCarregando] = useState(false);

  async function buscarHistorico(lista: string[]) {
    setCarregando(true);
    try {
      const res = await fetch(`/api/cotacao?moedas=${lista.join(",")}`);
      const dados: PontoComparado[] = await res.json();
      setHistorico(dados);
    } catch (erro) {
      console.error("Erro ao buscar cotação:", erro);
    } finally {
      setCarregando(false);
    }
  }

  function alternarMoeda(simbolo: string) {
    let nova: string[];
    if (selecionadas.includes(simbolo)) {
      nova = selecionadas.filter((m) => m !== simbolo);
      if (nova.length === 0) return; // sempre deixa pelo menos 1 selecionada
    } else {
      if (selecionadas.length >= MAX_MOEDAS) return; // limite de 4
      nova = [...selecionadas, simbolo];
    }
    setSelecionadas(nova);
    buscarHistorico(nova);
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">
        Variação no último mês (até {MAX_MOEDAS} moedas)
      </h2>

      <div className="flex flex-wrap gap-2 mb-6">
        {moedas.map((m) => {
          const ativa = selecionadas.includes(m.simbolo);
          return (
            <button
              key={m.simbolo}
              onClick={() => alternarMoeda(m.simbolo)}
              className={`px-3 py-1.5 rounded border text-sm transition-colors ${
                ativa
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-black border-gray-300"
              }`}
            >
              {m.simbolo}
            </button>
          );
        })}
      </div>

      {carregando ? (
        <p className="text-center py-20 text-gray-500">Carregando...</p>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={historico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="data" tick={{ fontSize: 12 }} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `R$ ${Number(v).toFixed(2)}`}
            />
            <Tooltip formatter={(v) => `R$ ${Number(v).toFixed(2)}`} />
            <Legend />
            {selecionadas.map((simbolo, i) => (
              <Line
                key={simbolo}
                type="monotone"
                dataKey={simbolo}
                stroke={CORES[i % CORES.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

    )}

      {!carregando && historico.length > 0 && (
        <table className="w-full mt-8 border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Moeda</th>
              <th className="text-right py-2">R$ 1 equivale a</th>
            </tr>
          </thead>
          <tbody>
            {selecionadas.map((simbolo) => {
              const ultimoPonto = [...historico]
                .reverse()
                .find((p) => typeof p[simbolo] === "number");
              const valorVenda = ultimoPonto?.[simbolo] as number | undefined;

              return (
                <tr key={simbolo} className="border-b">
                  <td className="py-2">{simbolo}</td>
                  <td className="text-right py-2">
                    {valorVenda
                      ? inverterParaReal(valorVenda).toFixed(2)
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
    
      )}
    </div>
  );
}
