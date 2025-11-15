"use client";

import { useState } from "react";
import HoldingsTable from "./components/HoldingsTable";
import TransactionForm from "./components/TransactionForm";
import TransactionHistory from "./components/TransactionHistory";
import ThemeToggle from "./components/ThemeToggle";
import { useHoldings } from "./hooks/useHoldings";
import PortfolioCharts from "./components/PortfolioCharts";
import ToggleMoneda from "./components/ToggleMoneda";


export default function Page() {
  const {
    holdings,
    transactions,
    expandedSymbol,
    showForm,
    setShowForm,
    handleExpand,
    loading,
    balanceTotalUSD,
    balanceTotalARS,
    handleSellAsset,
  } = useHoldings();

 // const totalBalance = holdings.reduce((acc, h) => acc + (h.monto_actual || 0), 0);
  const [mostrarARS, setMostrarARS] = useState(false);


  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center p-8 transition-colors">
  <div className="w-full max-w-5xl flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold">📊 Mi cartera</h1>

  {/* Contenedor de botones (Moneda + Tema) */}
  <div className="flex items-center gap-3">
    <ToggleMoneda
      currency={mostrarARS ? "ARS" : "USD"}
      onToggle={() => setMostrarARS(!mostrarARS)}
    />
    <ThemeToggle />
  </div>
</div>


<div className="w-full max-w-5xl mb-8">
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-semibold">Balance</h2>



  </div>

 <p
  className="text-3xl font-bold mt-2 flex items-center gap-2"
  style={{ fontFamily: "Times New Roman, serif" }}
>
  {mostrarARS
    ? balanceTotalARS?.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      })
    : balanceTotalUSD?.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}

  {/* Mostrar etiqueta USD / ARS */}
  <span className="text-xl opacity-80">
    {mostrarARS ? "ARS" : "USD"}
  </span>
</p>


</div>


  
        {/* 📊 Gráficos de resumen */}
          <PortfolioCharts holdings={holdings} />
      
      {/* Botón debajo del header */}
  <div className="w-full max-w-5xl mb-6">
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-2 btn-accent hover:bg-[var(--accent-hover)] px-4 py-2 rounded-lg shadow transition"
    >
      <span className="text-xl font-bold">＋</span> Agregar transacción
    </button>
  </div>

      <HoldingsTable
        title="📈 Acciones y ETFs"
        holdings={holdings.filter((h) => h.asset_type === "stock")}
        expandedSymbol={expandedSymbol}
        onExpand={handleExpand}
        loading={loading}
      />

      <div className="w-full max-w-5xl border-t border-[var(--border)] my-6"></div>

      {/* 🔹 Eliminado el bloque de prueba del modo oscuro */}


      <HoldingsTable
        title="💰 Criptomonedas"
        holdings={holdings.filter((h) => h.asset_type === "crypto")}
        expandedSymbol={expandedSymbol}
        onExpand={handleExpand}
        loading={loading}
      />

      <TransactionHistory
  expandedSymbol={expandedSymbol}
  transactions={transactions}
  onClose={() => handleExpand(null)}
  onSellAsset={handleSellAsset}
/>



      <TransactionForm showForm={showForm} setShowForm={setShowForm} />
    </main>
  );
}
