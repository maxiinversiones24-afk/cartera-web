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
    <section
      className="w-full max-w-5xl mb-8 rounded-xl shadow-md overflow-hidden border border-default bg-card animate-fadeIn"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      }}
    >
      <h3 className="text-md font-semibold mb-3 px-4 pt-4">{title}</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr
            style={{
              backgroundColor: "var(--muted)",
              color: "var(--muted-foreground)",
            }}
          >
            <th className="p-2 border border-default">Activo</th>
            <th className="p-2 border border-default">Cantidad</th>
            <th className="p-2 border border-default">PPC</th>
            <th className="p-2 border border-default">PA</th>
            <th className="p-2 border border-default">G/P USD</th>
            <th className="p-2 border border-default">G/P %</th>
            <th className="p-2 border border-default">Invertido</th>
            <th className="p-2 border border-default">Monto actual</th>
            <th className="p-2 border border-default text-center">Historial</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h: any) => (
            <tr key={h.id}>
              <td className="border border-default p-2 font-medium">{h.activo}</td>
              <td className="border border-default p-2">{h.cantidad.toFixed(6)}</td>
              <td className="border border-default p-2">{h.precio_compra.toFixed(2)}</td>
              <td className="border border-default p-2">{h.precio_actual?.toFixed(2)}</td>
              <td
                className="border border-default p-2"
                style={{
                  color: h.ganancia_usd >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                {h.ganancia_usd?.toFixed(2)}
              </td>
              <td
                className="border border-default p-2"
                style={{
                  color: h.ganancia_pct >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                {h.ganancia_pct?.toFixed(2)}%
              </td>
              <td className="border border-default p-2">{h.total_invertido?.toFixed(2)}</td>
              <td className="border border-default p-2">{h.monto_actual?.toFixed(2)}</td>
              <td className="border border-default p-2 text-center">
                <button
                  onClick={() => onExpand(h.activo)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                >
                  {expandedSymbol === h.activo ? "-" : "+"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
