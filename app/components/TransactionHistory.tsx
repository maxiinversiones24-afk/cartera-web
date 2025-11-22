"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionHistory({
  expandedSymbol,
  transactions,
  onClose,
  onSellAsset,
}: any) {
  const [selling, setSelling] = useState(false);
  const [cantidad, setCantidad] = useState("");

  return (
    <AnimatePresence>
      {expandedSymbol && (
        <>
          {/* Fondo difuminado minimalista */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup principal minimalista */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-full max-w-2xl bg-[color:var(--card)]
                       rounded-2xl shadow-xl p-6 border border-[color:var(--border)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Historial — {expandedSymbol}
              </h3>

              <button
                onClick={onClose}
                className="text-lg opacity-60 hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Botón vender minimalista */}
            <button
              onClick={() => setSelling(true)}
              className="w-full py-2 rounded-xl mb-6
                         bg-red-500/10 text-red-600 border border-red-500/30
                         hover:bg-red-500/20 transition font-medium"
            >
              Vender / Eliminar activo
            </button>

            {/* Tabla minimalista */}
            {transactions.length === 0 ? (
              <p className="text-muted">No hay transacciones registradas.</p>
            ) : (
              <div className="rounded-xl overflow-hidden border border-[color:var(--border)]">
                <table className="w-full text-sm">
                  <thead
                    className="bg-[color:var(--muted)] text-[color:var(--muted-foreground)]"
                  >
                    <tr>
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Precio</th>
                      <th className="p-2 text-left">Importe</th>
                      <th className="p-2 text-left">Cantidad</th>
                      <th className="p-2 text-left">Tipo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((t: any, i: number) => (
                      <tr
                        key={i}
                        className="border-t border-[color:var(--border)]"
                      >
                        <td className="p-2">{t.fecha}</td>

                        <td className="p-2">
                          {t.precio_compra.toFixed(2)}
                        </td>

                        <td className="p-2">
                          {t.importe.toFixed(2)}
                        </td>

                        <td className="p-2">
                          {t.cantidad}
                        </td>

                        <td
                          className="p-2 font-medium capitalize"
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
              </div>
            )}
          </motion.div>

          {/* Popup interno de venta — minimalista */}
          <AnimatePresence>
            {selling && (
              <motion.div
                key="sellPopup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed z-[60] top-1/2 left-1/2 
                           -translate-x-1/2 -translate-y-1/2 
                           bg-[color:var(--card)] border border-[color:var(--border)]
                           rounded-xl shadow-xl p-6 w-full max-w-sm"
              >
                <h3 className="text-lg font-semibold mb-4">
                  Vender {expandedSymbol}
                </h3>

                <label className="block text-sm mb-2">Cantidad a vender</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-full p-2 border border-[color:var(--border)]
                             rounded-lg bg-[color:var(--muted)]
                             mb-5 text-[color:var(--foreground)]"
                  placeholder="Ej: 2.5"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelling(false)}
                    className="px-4 py-2 rounded-lg border border-[color:var(--border)] 
                               hover:bg-[color:var(--muted)] transition"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => {
                      onSellAsset(expandedSymbol, parseFloat(cantidad));
                      setSelling(false);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white
                               hover:bg-red-700 transition"
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
