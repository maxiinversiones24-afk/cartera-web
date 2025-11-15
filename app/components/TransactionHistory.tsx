"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionHistory({
  expandedSymbol,
  transactions,
  onClose,
  onSellAsset, // ← NUEVO PROP
}: any) {
  const [selling, setSelling] = useState(false); // popup interno
  const [cantidad, setCantidad] = useState("");

  return (
    <AnimatePresence>
      {expandedSymbol && (
        <>
          {/* FONDO OSCURO */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* POPUP PRINCIPAL */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-full max-w-3xl bg-card border border-default 
                       rounded-xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                🕒 Historial de transacciones de {expandedSymbol}
              </h3>

              {/* BOTÓN CERRAR */}
              <button
                onClick={onClose}
                className="text-xl font-bold hover:opacity-70 transition"
              >
                ✕
              </button>
            </div>

            {/* 🔴 BOTÓN VENDER */}
            <button
              onClick={() => setSelling(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg mb-4 shadow"
            >
              🧾 Vender / Eliminar activo
            </button>

            {/* TABLA */}
            {transactions.length === 0 ? (
              <p className="text-muted">
                No hay transacciones registradas para este activo.
              </p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--muted)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    <th className="p-2 border border-default">Fecha</th>
                    <th className="p-2 border border-default">Precio</th>
                    <th className="p-2 border border-default">Importe</th>
                    <th className="p-2 border border-default">Cantidad</th>
                    <th className="p-2 border border-default">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any, i: number) => (
                    <tr key={i}>
                      <td className="border border-default p-2">{t.fecha}</td>
                      <td className="border border-default p-2">
                        {t.precio_compra.toFixed(2)}
                      </td>
                      <td className="border border-default p-2">
                        {t.importe.toFixed(2)}
                      </td>
                      <td className="border border-default p-2">{t.cantidad}</td>
                      <td
                        className="border border-default p-2 capitalize font-semibold"
                        style={{
                          color:
                            t.tipo === "compra"
                              ? "var(--success)"
                              : "var(--danger)",
                        }}
                      >
                        {t.tipo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>

          {/* ➕ POP-UP INTERNO: VENDER CANTIDAD */}
          <AnimatePresence>
            {selling && (
              <motion.div
                key="sellPopup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-[60] top-1/2 left-1/2 
                           -translate-x-1/2 -translate-y-1/2 
                           bg-card border border-default rounded-lg shadow-xl 
                           p-6 w-full max-w-sm"
              >
                <h3 className="text-lg font-semibold mb-3">
                  Vender {expandedSymbol}
                </h3>

                <label className="block mb-2 font-medium">Cantidad a vender</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full p-2 border rounded mb-4 bg-background"
                  placeholder="Ej: 2.5"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelling(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => {
                      onSellAsset(expandedSymbol, parseFloat(cantidad));
                      setSelling(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirmar venta
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
