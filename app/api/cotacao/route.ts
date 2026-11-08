import { NextRequest, NextResponse } from "next/server";
import { getHistoricoComparado, MOEDAS_SUPORTADAS } from "@/lib/brasilapi";

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("moedas") ?? "USD";
  const moedas = param.split(",").map((m) => m.trim().toUpperCase());

  const invalidas = moedas.filter(
    (m) => !(MOEDAS_SUPORTADAS as readonly string[]).includes(m)
  );
  if (invalidas.length > 0) {
    return NextResponse.json(
      { error: `Moeda(s) não suportada(s): ${invalidas.join(", ")}` },
      { status: 400 }
    );
  }

  const historico = await getHistoricoComparado(moedas);
  return NextResponse.json(historico);
}