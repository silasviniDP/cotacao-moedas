# Cotação de Moedas

Dashboard que acompanha a variação de moedas estrangeiras em relação ao Real
ao longo do último mês, com comparação entre moedas e tabela de conversão,
usando dados reais da BrasilAPI.

🔗 **Deploy:** [https://cotacao-moedas-kvjz.vercel.app](https://cotacao-moedas-kvjz.vercel.app)

---

## Sobre o projeto

Projeto construído pra praticar consumo de API externa, cache no servidor e
visualização de dados em gráfico — indo além do básico de só exibir um JSON
na tela.

Principais decisões técnicas:
- A BrasilAPI só retorna a cotação de **um dia por vez**, então o histórico
  mensal é montado buscando os últimos ~22 dias úteis em paralelo e
  cacheando o resultado no servidor.
- A tabela de conversão reaproveita os mesmos dados já buscados para o
  gráfico (sem chamadas extras à API), então atualiza em conjunto.

## Tecnologias

| Camada       | Tecnologia                          |
|--------------|--------------------------------------|
| Framework    | [Next.js](https://nextjs.org/) (App Router) |
| Biblioteca   | [React](https://react.dev/)          |
| Linguagem    | [TypeScript](https://www.typescriptlang.org/) |
| Estilização  | [Tailwind CSS](https://tailwindcss.com/) |
| Gráficos     | [Recharts](https://recharts.org/)    |
| Dados        | [BrasilAPI](https://brasilapi.com.br/) (câmbio) |
| Deploy       | [Vercel](https://vercel.com/)        |

## Funcionalidades

- Gráfico de linha com a variação de uma moeda ao longo do último mês
- Comparação simultânea entre até 4 moedas no mesmo gráfico
- Tabela de conversão (R$ 1 → valor na moeda selecionada), sincronizada com o gráfico
- Cache no servidor para não sobrecarregar a API a cada visita

## Estrutura do projeto

├─ app/
│ ├─ api/cotacao/route.ts # endpoint que serve o histórico de cotações
│ ├─ layout.tsx
│ ├─ page.tsx # busca os dados iniciais no servidor
│ └─ globals.css
├─ components/
│ └─ ChartSection.tsx # gráfico, seletor de moedas e tabela
├─ lib/
│ └─ brasilapi.ts # funções de busca e cache na BrasilAPI


## Fonte de dados

[BrasilAPI — Câmbio](https://brasilapi.com.br/docs#tag/CAMBIO), API pública
e gratuita mantida pela comunidade.