// functions/portfolio-history/index.ts

Deno.serve(async () => {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1) Traer transacciones
  const { data: tx, error } = await supabase
    .from("transactions")
    .select("symbol, quantity, price, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return new Response("Error cargando transacciones", { status: 500 });
  }

  if (!tx || tx.length === 0) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) Símbolos únicos
  const symbols = [...new Set(tx.map((t) => t.symbol))];

  // 3) Descargar históricos
  const apiKey = Deno.env.get("TWELVEDATA_API_KEY");
  const histories: Record<string, any[]> = {};

  for (const s of symbols) {
    const url = `https://api.twelvedata.com/time_series?symbol=${s}&interval=1day&apikey=${apiKey}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.values) {
      histories[s] = [];
      continue;
    }

    histories[s] = json.values.reverse();
  }

  // 4) Fechas únicas
  const allDates = new Set<string>();
  Object.values(histories).forEach((h) => {
    if (Array.isArray(h)) h.forEach((p) => allDates.add(p.datetime));
  });

  const datesSorted = Array.from(allDates).sort();

  // 5) Reconstrucción del portfolio
  const positions: Record<string, number> = {};

  const values = datesSorted.map((date) => {
    // aplicar transacciones ese día
    for (const t of tx) {
      if (t.created_at.slice(0, 10) === date) {
        positions[t.symbol] = (positions[t.symbol] ?? 0) + t.quantity;
      }
    }

    // valor total
    let total = 0;

    for (const s of symbols) {
      const p = histories[s]?.find((p) => p.datetime === date)?.close;

      if (p && positions[s]) {
        total += positions[s] * Number(p);
      }
    }

    return { date, total };
  });

  return new Response(JSON.stringify(values), {
    headers: { "Content-Type": "application/json" },
  });
});
