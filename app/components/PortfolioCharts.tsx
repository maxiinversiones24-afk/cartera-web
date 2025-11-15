"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function PortfolioCharts({ holdings }: { holdings: any[] }) {
  const [range, setRange] = useState<"1w" | "1m" | "6m" | "1y">("1w");

  const safeHoldings = holdings || [];

  const totalActual = safeHoldings.reduce(
    (sum, h) => sum + (h.monto_actual || 0),
    0
  );

  // 🔢 GENERA DATOS SEGÚN EL RANGO SELECCIONADO
  const generarDatos = () => {
    const ahora = new Date();
    let cantidad: number;

    switch (range) {
      case "1w":
        cantidad = 7;
        break;
      case "1m":
        cantidad = 30;
        break;
      case "6m":
        cantidad = 180;
        break;
      case "1y":
        cantidad = 365;
        break;
    }

    return Array.from({ length: cantidad }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(ahora.getDate() - (cantidad - i));

      return {
        date: `${fecha.getDate()}/${fecha.getMonth() + 1}`,
        value: totalActual
          ? totalActual * (1 + Math.sin(i / 10) * 0.05) // variación visual
          : 50000 + i * 20,
      };
    });
  };

  const lineData = generarDatos();

  // Escala Y
  const valores = lineData.map((p) => p.value);
  const minY = Math.min(...valores);
  const maxY = Math.max(...valores);
  const margen = (maxY - minY) * 0.05;

  // Datos torta
  const total = safeHoldings.reduce(
    (sum, h) => sum + (h.monto_actual || 0),
    0
  );
  const pieData =
    total > 0
      ? safeHoldings.map((h) => ({
          name: h.activo,
          value: ((h.monto_actual || 0) / total) * 100,
        }))
      : [{ name: "Sin activos", value: 100 }];

  const COLORS = ["#ec4899", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7"];

  const tituloRango = {
    "1w": "Última semana",
    "1m": "Último mes",
    "6m": "Últimos 6 meses",
    "1y": "Último año",
  }[range];

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 📈 Rendimiento */}
      <div className="p-4 rounded-xl bg-card shadow-md border border-default">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-muted-foreground">
            {tituloRango}
          </h3>
          <span className="text-red-500 font-semibold text-lg">-2,26 %</span>
        </div>

        {/* 🔘 BOTONES DE RANGO */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "1w", label: "1W" },
            { key: "1m", label: "1M" },
            { key: "6m", label: "6M" },
            { key: "1y", label: "1Y" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setRange(b.key as any)}
              className={`px-3 py-1 rounded text-sm transition ${
                range === b.key
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={lineData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              width={60}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              domain={[minY - margen, maxY + margen]}
              tickFormatter={(value: number) =>
                value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`
              }
              tick={{ fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                "Valor",
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              fill="url(#colorValue)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🥯 Distribución de activos */}
      <div className="p-4 rounded-xl bg-card shadow-md border border-default flex flex-col">
        <h3 className="text-md font-semibold mb-4 text-center">
          Distribución de activos
        </h3>

        <div className="flex items-center justify-center gap-6">
          <div className="relative w-1/2 h-[220px] flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={80}
                  paddingAngle={2}
                  labelLine={false}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => v.toFixed(2) + "%"}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center">
              <p className="text-sm text-muted-foreground">
                {total > 0 ? `${pieData.length} activos` : "Sin datos"}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center w-1/2 space-y-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {entry.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
