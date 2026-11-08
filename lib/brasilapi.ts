// A API de cotação só aceita essas moedas, mesmo que /moedas liste mais.
export const MOEDAS_SUPORTADAS = [
  "AUD", "CAD", "CHF", "DKK", "EUR", "GBP", "JPY", "SEK", "USD",
] as const;

export type Moeda = {
  simbolo: string;
  nome: string;
  tipo_moeda: string;
};

type CotacaoBoletim = {
  paridade_compra: number;
  paridade_venda: number;
  cotacao_compra: number;
  cotacao_venda: number;
  data_hora_cotacao: string;
  tipo_boletim: string;
};

type CotacaoDiaResposta = {
  moeda: string;
  data: string;
  cotacoes: CotacaoBoletim[];
};

export type PontoHistorico = {
  data: string; // AAAA/MM/DD
  valorVenda: number; // quanto vale 1 unidade da moeda, em Reais
};

const BASE_URL = "https://brasilapi.com.br/api";

// Busca a lista de moedas e filtra só as que o endpoint de cotação aceita
export async function getMoedas(): Promise<Moeda[]> {
  const res = await fetch(`${BASE_URL}/cambio/v1/moedas`, {
    next: { revalidate: 86400 }, // cache de 1 dia, a lista quase nunca muda
  });
  if (!res.ok) throw new Error("Não foi possível buscar as moedas");
  const todas: Moeda[] = await res.json();
  return todas.filter((m) =>
    (MOEDAS_SUPORTADAS as readonly string[]).includes(m.simbolo)
  );
}

function formatarData(d: Date): string {
  return d.toISOString().split("T")[0]; // AAAA/MM/DD
}

// Busca a cotação de um dia específico, pegando o fechamento (PTAX) quando existir
async function getCotacaoDia(
  moeda: string,
  data: Date
): Promise<PontoHistorico | null> {
  const dataStr = formatarData(data);
  const res = await fetch(
    `${BASE_URL}/cambio/v1/cotacao/${moeda}/${dataStr}`,
    { next: { revalidate: 3600 } } // cache de 1 hora
  );
  if (!res.ok) return null; // dia sem cotação (feriado sem boletim, etc.)

  const json: CotacaoDiaResposta = await res.json();
  if (!json.cotacoes || json.cotacoes.length === 0) return null;

  const fechamento =
    json.cotacoes.find((c) => c.tipo_boletim === "FECHAMENTO PTAX") ??
    json.cotacoes[json.cotacoes.length - 1];

  return { data: json.data, valorVenda: fechamento.cotacao_venda };
}

// Gera os últimos N dias úteis (pula sábado e domingo)
function gerarDiasUteis(quantidade: number): Date[] {
  const dias: Date[] = [];
  const cursor = new Date();
  while (dias.length < quantidade) {
    const diaSemana = cursor.getDay(); // 0 = domingo, 6 = sábado
    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return dias.reverse(); // do mais antigo pro mais recente
}

// Busca o histórico de 1 mês (22 dias úteis) de uma moeda
export async function getHistoricoMensal(
  moeda: string,
  diasUteis = 22
): Promise<PontoHistorico[]> {
  const datas = gerarDiasUteis(diasUteis);
  const resultados = await Promise.all(
    datas.map((data) => getCotacaoDia(moeda, data))
  );
  return resultados.filter((r): r is PontoHistorico => r !== null);
}

// Quanto vale R$1 na moeda informada, a partir da cotação de venda mais recente
export function inverterParaReal(valorVenda: number): number {
  return 1 / valorVenda;
}

export type PontoComparado = { data: string } & Record<string, number | string>;

// Busca o histórico de várias moedas e junta num único array,
// uma linha por data, com uma coluna por moeda.
export async function getHistoricoComparado(
  moedas: string[],
  diasUteis = 22
): Promise<PontoComparado[]> {
  const resultados = await Promise.all(
    moedas.map((m) => getHistoricoMensal(m, diasUteis))
  );

  const mapa = new Map<string, PontoComparado>();
  moedas.forEach((moeda, i) => {
    resultados[i].forEach((ponto) => {
      const linha = mapa.get(ponto.data) ?? { data: ponto.data };
      linha[moeda] = ponto.valorVenda;
      mapa.set(ponto.data, linha);
    });
  });

  return Array.from(mapa.values()).sort((a, b) =>
    String(a.data).localeCompare(String(b.data))
  );
}
