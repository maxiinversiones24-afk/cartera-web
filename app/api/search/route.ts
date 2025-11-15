import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toUpperCase() || "";

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // 🔹 Búsqueda general (acciones, ETFs, etc.)
    const resStocks = await fetch(
      `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}`
    );
    if (!resStocks.ok) throw new Error("Error en búsqueda de acciones");

    const jsonStocks = await resStocks.json();
    const allData = jsonStocks.data || [];

    // 🔸 Filtramos acciones y ETFs
    const stocksEtfs = allData
      .filter(
        (item: any) =>
          (item.instrument_type === "Common Stock" ||
            item.instrument_type === "ETF") &&
          !item.symbol.includes("/") // para no mezclar pares tipo BTC/USD
      )
      .map((item: any) => ({
        category: "Acciones/ETFs",
        symbol: item.symbol,
        name: item.instrument_name,
      }))
      .slice(0, 10);

    // 🔸 Filtramos criptomonedas
    const cryptos = allData
      .filter(
        (item: any) =>
          item.instrument_type === "Digital Currency" &&
          item.symbol.includes("/")
      )
      .map((item: any) => ({
        category: "Criptomonedas",
        symbol: item.symbol,
        name: item.instrument_name || "Criptomoneda",
      }))
      .slice(0, 10);

    // 🔹 Combinamos en un solo array
    const combined = [...stocksEtfs, ...cryptos];

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Error en /api/search:", error);
    return NextResponse.json(
      { error: "Error interno al buscar activo" },
      { status: 500 }
    );
  }
}
