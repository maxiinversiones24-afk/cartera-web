"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ResponsiveContainer,
  LineChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RangeKey = "1s" | "1m" | "6m" | "1y";

function formatThousands(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function generateRangeFilledData(history: any[], days: number) {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - days);

  const map = new Map();

  history.forEach((p) => {
    const d = new Date(p.rawDate);
    const key = d.toISOString().split("T")[0];
    map.set(key, p.value);
  });

  const result: any[] = [];

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split("T")[0];
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;

    result.push({
      rawDate: iso,
      date: label,
      value: map.get(iso) ?? 0,
    });
  }

  return result;
}

export default function PortfolioCharts({ holdings }: { holdings: any[] }) {
  const [range, setRange] = useState<RangeKey>("1s");
  const [history, setHistory] = useState<
    { rawDate: string; date: string; value: number }[]
  >([]);

  const safeHoldings = holdings || [];

  const totalActual = safeHoldings.reduce(
    (sum, h) => sum + Number(h.monto_actual || 0),
    0
  );

  useEffect(() => {
    async function loadRealHistory() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch("/api/portfolio-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session?.access_token ?? null,
            user_id: session?.user?.id ?? null,
          }),
        });

        const json = await res.json();

        let arr: any[] = [];

        if (Array.isArray(json?.history)) arr = json.history;
        else if (Array.isArray(json?.history?.history))
          arr = json.history.history;
        else {
          setHistory([]);
          return;
        }

        const formatted = arr.map((p: any) => {
          const iso = p.recorded_at || p.date;
          const d = new Date(iso);

          const label = `${String(d.getDate()).padStart(2, "0")}/${String(
            d.getMonth() + 1
          )}`;

          return {
            rawDate: iso,
            date: label,
            value: Number(p.total_value ?? p.total ?? p.value),
          };
        });

        setHistory(formatted);
      } catch (e) {
        console.error("Error:", e);
        setHistory([]);
      }
    }

    loadRealHistory();
  }, [holdings]);

  const filtrarPorRango = () => {
    if (!history.length) return [];

    const days =
      range === "1s" ? 7 : range === "1m" ? 30 : range === "6m" ? 180 : 365;

    return generateRangeFilledData(history, days);
  };

  const lineData = filtrarPorRango();

  const valores = lineData.length ? lineData.map((p) => p.value) : [0, 1];
  const minY = Math.min(...valores);
  const maxY = Math.max(...valores);
  const margen = (maxY - minY) * 0.05 || 1;

  const pieData =
    totalActual > 0
      ? safeHoldings.map((h) => ({
          name: h.activo,
          value:
            totalActual > 0 ? (Number(h.monto_actual) / totalActual) * 100 : 0,
        }))
      : [{ name: "Sin activos", value: 100 }];

  const COLORS = ["#ec4899", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7"];

  const tituloRango = {
    "1s": "Última semana",
    "1m": "Último mes",
    "6m": "Últimos 6 meses",
    "1y": "Último año",
  }[range];

  return (
    <div className="w-full max-w-6xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">

      {/* === LINE CHART === */}
      <div className="p-5 rounded-2xl bg-card border border-[color:var(--border)] shadow-sm">

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-semibold text-muted-foreground">
            {tituloRango}
          </h3>

          <div className="flex gap-2">
            {[
              { key: "1s", label: "1S" },
              { key: "1m", label: "1M" },
              { key: "6m", label: "6M" },
              { key: "1y", label: "1Y" },
            ].map((b) => (
              <button
                key={b.key}
                onClick={() => setRange(b.key as RangeKey)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  range === b.key
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-[color:var(--muted)] border-[color:var(--border)] text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
  data={lineData}
  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
>

            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              minTickGap={10}
            />

            <YAxis
              width={60}
              tickLine={false}
              axisLine={false}
              stroke="var(--muted-foreground)"
              domain={[Math.max(0, minY - margen), maxY + margen]}
              tickFormatter={(v: number) => `$${formatThousands(v)}`}
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "8px 12px",
              }}
              formatter={(v: number) => [`$${formatThousands(v)}`, "Valor"]}
            />

            {/* AREA BAJO LA CURVA */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 3 }}
              animationDuration={500}
            />
          </ComposedChart>

        </ResponsiveContainer>
      </div>

      {/* === PIE CHART === */}
      <div className="p-5 rounded-2xl bg-card border border-[color:var(--border)] shadow-sm flex flex-col">
        <h3 className="text-md font-semibold mb-4 text-center text-muted-foreground">
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
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  labelLine={false}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "6px 10px",
                  }}
                  formatter={(v: number) => `${v.toFixed(2)}%`}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center">
              <p className="text-sm text-muted-foreground">
                {totalActual > 0 ? `${pieData.length} activos` : "Sin datos"}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center w-1/2 space-y-2">
            {pieData.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
                <span className="font-medium">
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
