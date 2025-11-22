"use client";

export default function HoldingsTable({
  title,
  holdings,
  onExpand,
  expandedSymbol,
  loading,
}: any) {
  if (loading) return <p>Cargando...</p>;

  if (holdings.length === 0)
    return (
      <section className="w-full max-w-5xl mb-8">
        <h3 className="text-md font-semibold mb-3">{title}</h3>
        <p className="text-muted">No hay registros aún.</p>
      </section>
    );

  return (
    <section className="w-full max-w-5xl mb-8 animate-fadeIn">
      <h3 className="text-md font-semibold mb-4 px-2">{title}</h3>

      {/* ---------- HEADER CARD ---------- */}
      <div
        className="grid grid-cols-9 gap-2 p-3 rounded-xl border bg-card shadow-sm font-semibold text-sm"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
        }}
      >
        <p>Activo</p>
        <p>Cantidad</p>
        <p>PPC</p>
        <p>PA</p>
        <p>G/P USD</p>
        <p>G/P %</p>
        <p>Invertido</p>
        <p>Monto actual</p>
        <p>Historial</p>
      </div>

      {/* ---------- HOLDINGS LIST ---------- */}
      <div className="flex flex-col mt-3 gap-3">
        {holdings.map((h: any) => {
          const color = h.ganancia_usd >= 0 ? "var(--success)" : "var(--danger)";
          const expanded = expandedSymbol === h.activo;

          return (
            <div
              key={h.id}
              className="rounded-xl border bg-card shadow-sm p-3 hover:shadow-md transition"
            >
              {/* ---------- GRID VALUES ---------- */}
              <div
                className="grid grid-cols-9 gap-2 text-sm items-center"
              >
                <p className="font-medium">{h.activo}</p>
                <p>{h.cantidad.toFixed(6)}</p>
                <p>{h.precio_compra.toFixed(2)}</p>
                <p>{h.precio_actual?.toFixed(2)}</p>

                <p style={{ color }}>{h.ganancia_usd?.toFixed(2)}</p>
                <p style={{ color }}>{h.ganancia_pct?.toFixed(2)}%</p>

                <p>{h.total_invertido?.toFixed(2)}</p>
                <p>{h.monto_actual?.toFixed(2)}</p>

                {/* ---------- BOTÓN + PARA HISTORIAL ---------- */}
                <button
                  onClick={() => onExpand(h.activo)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border hover:bg-muted transition"
                >
                  +
                </button>
              </div>

              {/* ---------- EXPANDED AREA ---------- */}
              {expanded && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  Historial, movimientos o lo que quieras mostrar aquí.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
