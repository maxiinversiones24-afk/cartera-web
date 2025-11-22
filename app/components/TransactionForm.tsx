"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function TransactionForm({
  showForm,
  setShowForm,
  handleSubmit,
  register,
  searchTerm,
  suggestions,
  handleSearchChange,
  handleSuggestionClick,
  onSubmit,
  assetType,
  setAssetType,
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <AnimatePresence>
      {showForm && (
        <>
          {/* Fondo semitransparente */}
          <motion.div
            className="fixed inset-0 bg-[color:var(--background)]/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && setShowForm(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 overflow-y-auto p-6 shadow-2xl border-l border-[color:var(--border)] transition-colors"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
            }}
          >
            {/* Header */}
            <h2 className="text-xl font-semibold mb-4">➕ Nueva transacción</h2>

            <button
              disabled={isSubmitting}
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)] text-lg transition disabled:opacity-50"
            >
              ✖
            </button>

            {/* Formulario */}
            <form
              onSubmit={handleSubmit(async (data: any) => {
                if (isSubmitting) return; // previene doble click
                setIsSubmitting(true);

                try {
                  await onSubmit(data);
                  setShowForm(false);
                } catch (err) {
                  console.error("Error al guardar:", err);
                } finally {
                  setIsSubmitting(false);
                }
              })}
              className="space-y-4"
            >
              {/* Tipo de activo */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de activo
                </label>
                <select
                  value={assetType}
                  onChange={(e) =>
                    setAssetType(e.target.value as "stock" | "crypto")
                  }
                  disabled={isSubmitting}
                  className="w-full border rounded p-2 bg-[color:var(--muted)] text-[color:var(--foreground)] border-[color:var(--border)] transition disabled:opacity-50"
                >
                  <option value="stock">Acciones / ETFs</option>
                  <option value="crypto">Criptomonedas</option>
                </select>
              </div>
              <input type="hidden" {...register("asset_type")} value={assetType} />

              {/* Buscador */}
              <div className="relative">
                <label className="block text-sm font-medium">Activo</label>
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder={
                    assetType === "stock"
                      ? "Ej: AAPL, TSLA, SPY..."
                      : "Ej: BTC, ETH..."
                  }
                  className="w-full border p-2 rounded mt-1 bg-[color:var(--muted)] text-[color:var(--foreground)] border-[color:var(--border)] transition disabled:opacity-50"
                />

                {suggestions.length > 0 && !isSubmitting && (
                  <ul className="absolute w-full mt-1 rounded border border-[color:var(--border)] shadow z-10 max-h-60 overflow-y-auto bg-[color:var(--card)] text-[color:var(--card-foreground)]">
                    {suggestions.map((s: any, i: number) => (
                      <li
                        key={i}
                        onClick={() => handleSuggestionClick(s.symbol)}
                        className="p-2 text-sm cursor-pointer hover:bg-[color:var(--accent)] hover:text-white transition"
                      >
                        {assetType === "stock"
                          ? `${s.symbol} — ${s.instrument_name || s.name || ""}${
                              s.exchange ? ` (${s.exchange})` : ""
                            }`
                          : `${s.symbol} — ${s.name}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Precio compra */}
              <div>
                <label className="block text-sm font-medium">
                  Precio compra
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  {...register("precio_compra", { valueAsNumber: true })}
                  required
                  disabled={isSubmitting}
                  className="w-full border p-2 rounded mt-1 bg-[color:var(--muted)] text-[color:var(--foreground)] border-[color:var(--border)] disabled:opacity-50"
                />
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium">Cantidad</label>
                <input
                  type="number"
                  step="0.00000001"
                  {...register("cantidad", { valueAsNumber: true })}
                  required
                  disabled={isSubmitting}
                  className="w-full border p-2 rounded mt-1 bg-[color:var(--muted)] text-[color:var(--foreground)] border-[color:var(--border)] disabled:opacity-50"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  {...register("fecha")}
                  required
                  disabled={isSubmitting}
                  className="w-full border p-2 rounded mt-1 bg-[color:var(--muted)] text-[color:var(--foreground)] border-[color:var(--border)] disabled:opacity-50"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg mt-4 font-semibold btn-accent transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Guardando..." : "Guardar transacción"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
