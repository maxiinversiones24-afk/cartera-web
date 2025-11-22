"use client";

import { useState, useEffect } from "react";
import HoldingsTable from "./components/HoldingsTable";
import TransactionForm from "./components/TransactionForm";
import TransactionHistory from "./components/TransactionHistory";
import ThemeToggle from "./components/ThemeToggle";
import { useHoldings } from "./hooks/useHoldings";
import PortfolioCharts from "./components/PortfolioCharts";
import ToggleMoneda from "./components/ToggleMoneda";
import { useAuth } from "./components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import type { Session } from "@supabase/supabase-js";

export default function Page() {
  // 🔹 1) TODOS LOS HOOKS VAN ARRIBA
  const [session, setSession] = useState<Session | null>(null);
  const [mostrarARS, setMostrarARS] = useState(false);
  const [user, setUser] = useState<any>(undefined);

  // 🔹 2) Cargar sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔹 3) Cargar usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  // 🔹 4) Hooks del sistema (SIEMPRE deben ejecutarse)
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

     // 🔹 AGREGAR ESTOS:
  handleSubmit,
  register,
  onSubmit,
  searchTerm,
  suggestions,
  handleSearchChange,
  handleSuggestionClick,
  assetType,
  setAssetType,
  } = useHoldings();

  // 🔹 5) AHORA recién podés cortar el render
  if (!session || user === null) {
    return (
      <main className="h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-4">🔐 Iniciar sesión</h1>

        <div className="w-full max-w-sm">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Contraseña",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Contraseña",
                },
              },
            }}
          />
        </div>
      </main>
    );
  }

  // 🔹 6) SI LLEGA HASTA ACA → usuario logueado ✔
  // (tu app sigue normalmente)

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
  className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm font-medium"
>
  <span className="text-lg">＋</span>
  Agregar transacción
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



      <TransactionForm
  showForm={showForm}
  setShowForm={setShowForm}
  handleSubmit={handleSubmit}
  register={register}
  searchTerm={searchTerm}
  suggestions={suggestions}
  handleSearchChange={handleSearchChange}
  handleSuggestionClick={handleSuggestionClick}
  onSubmit={onSubmit}
  assetType={assetType}
  setAssetType={setAssetType}
/>

    </main>
  );
}
