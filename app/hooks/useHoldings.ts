"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [assetType, setAssetType] = useState<"stock" | "crypto">("stock");

  // ---------------------------
  // Dólar MEP desde dolarapi.com
  // ---------------------------
  const [dolarMEP, setDolarMEP] = useState<number | null>(null);
  const [dolarMEPLoading, setDolarMEPLoading] = useState<boolean>(true);

  const fetchDolarMEP = async (attempt = 1) => {
    setDolarMEPLoading(true);
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/bolsa");


      if (!res.ok) {
        console.warn("⚠️ dolarapi no respondió OK:", res.status);
        if (attempt < 2) return fetchDolarMEP(attempt + 1);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      const text = await res.text();
      if (!text) {
        console.warn("⚠️ dolarapi devolvió respuesta vacía");
        if (attempt < 2) return fetchDolarMEP(attempt + 1);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("⚠️ parse JSON fallo, retry…", e);
        if (attempt < 2) return fetchDolarMEP(attempt + 1);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      const possibleValues = [
        data?.venta,
        data?.precio,
        data?.valor,
        data?.casa?.venta,
        data?.data?.venta,
        Array.isArray(data) && data[0]?.venta,
      ];

      const found = possibleValues.find(
        (v) =>
          typeof v === "number" ||
          (typeof v === "string" && v.trim() !== "")
      );

      const numeric = found ? Number(found) : null;

      if (!numeric || Number.isNaN(numeric)) {
        console.warn("⚠️ No se pudo extraer valor numérico del MEP:", found);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      setDolarMEP(numeric);
      setDolarMEPLoading(false);
    } catch (err) {
      console.error("❌ Error obteniendo dólar MEP:", err);
      if (attempt < 2) return fetchDolarMEP(attempt + 1);
      setDolarMEP(null);
      setDolarMEPLoading(false);
    }
  };

  // ---------------------------
  // Helper: obtener precio actual
  // ---------------------------
  const fetchCurrentPrice = async (symbol: string) => {
    try {
      if (!symbol) return null;
      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
          symbol
        )}&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}`
      );
      if (!res.ok) return null;

      const data = await res.json();
      return data?.price ? parseFloat(data.price) : null;
    } catch {
      return null;
    }
  };

  // ---------------------------
  // fetchHoldings
  // ---------------------------
  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      const updated = await Promise.all(
        (data || []).map(async (h: any) => {
          const precio_actual = await fetchCurrentPrice(h.activo);
          const total_invertido =
            Number(h.precio_compra || 0) * Number(h.cantidad || 0);

          const monto_actual = precio_actual
            ? precio_actual * Number(h.cantidad || 0)
            : 0;

          const ganancia_usd = monto_actual - total_invertido;
          const ganancia_pct = total_invertido
            ? (ganancia_usd / total_invertido) * 100
            : 0;

          return {
            ...h,
            precio_actual,
            total_invertido,
            monto_actual,
            ganancia_usd,
            ganancia_pct,
          };
        })
      );

      setHoldings(updated);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // fetchTransactions
  // ---------------------------
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) {
        setTransactions([]);
      } else {
        setTransactions(data || []);
      }
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchTransactions();
    fetchDolarMEP();
  }, []);

  // ---------------------------
  // Expandir historial
  // ---------------------------
  const handleExpand = async (symbol: string | null) => {

    if (expandedSymbol === symbol) {
      setExpandedSymbol(null);
      setTransactions([]);
      return;
    }

    setExpandedSymbol(symbol);

    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("activo", symbol)
      .order("fecha", { ascending: false });

    setTransactions(data || []);
  };

  // ---------------------------
  // Búsqueda
  // ---------------------------
  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(
          value
        )}&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}`
      );

      if (!res.ok) {
        setSuggestions([]);
        return;
      }

      const data = await res.json();

      if (data?.data?.length > 0) {
        const filtered = data.data
          .filter((item: any) => item.instrument_name && item.symbol)
          .slice(0, 10)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.instrument_name,
            exchange: item.exchange,
          }));

        setSuggestions(filtered);
      }
    } catch {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    setSearchTerm(symbol);
    setSuggestions([]);
  };

  // ---------------------------
  // onSubmit
  // ---------------------------
  const onSubmit = async (formData: any) => {
    try {
      const activoValue = (searchTerm || "").trim();
      if (!activoValue) {
        alert("Selecciona un activo.");
        return;
      }

      const cantidad = Number(formData.cantidad);
      const precio_compra = Number(formData.precio_compra);
      const fecha = formData.fecha;
      const importe = cantidad * precio_compra;

      const { data: existingHolding } = await supabase
        .from("holdings")
        .select("*")
        .eq("activo", activoValue)
        .maybeSingle();

      let holdingId = null;
      const precio_actual = await fetchCurrentPrice(activoValue);

      if (existingHolding) {
        holdingId = existingHolding.id;

        const nuevaCantidad =
          Number(existingHolding.cantidad || 0) + cantidad;
        const nuevoTotalInvertido =
          Number(existingHolding.total_invertido || 0) + importe;
        const nuevoPPC =
          nuevaCantidad > 0 ? nuevoTotalInvertido / nuevaCantidad : precio_compra;

        await supabase
          .from("holdings")
          .update({
            cantidad: nuevaCantidad,
            total_invertido: nuevoTotalInvertido,
            precio_compra: nuevoPPC,
            precio_actual,
            asset_type: assetType,
          })
          .eq("id", holdingId);
      } else {
        const insertObj: any = {
          activo: activoValue,
          cantidad,
          precio_compra,
          total_invertido: importe,
          precio_actual,
          asset_type: assetType,
        };

        if (fecha) insertObj.fecha = fecha;

        const { data: newHolding } = await supabase
          .from("holdings")
          .insert([insertObj])
          .select()
          .single();

        holdingId = newHolding.id;
      }

      await supabase.from("transactions").insert([
        {
          holding_id: holdingId,
          activo: activoValue,
          fecha,
          precio_compra,
          importe,
          cantidad,
          tipo: "compra",
          asset_type: assetType,
        },
      ]);

      await fetchHoldings();
      await fetchTransactions();
      reset();
      setSearchTerm("");
      setSuggestions([]);
      setShowForm(false);
    } catch (err) {
      console.error("Error en onSubmit:", err);
    }
  };

  // ---------------------------
  // Balance total
  // ---------------------------
  const balanceTotalUSD = holdings.reduce(
    (acc, h) => acc + (h.monto_actual || 0),
    0
  );
// ---------------------------
// handleSellAsset
// ---------------------------
const handleSellAsset = async (symbol: string, cantidadVenta: number) => {
  try {
    if (!symbol || !cantidadVenta || cantidadVenta <= 0) return;

    // Obtener holding actual
    const { data: holding } = await supabase
      .from("holdings")
      .select("*")
      .eq("activo", symbol)
      .maybeSingle();

    if (!holding) {
      console.warn("No existe holding para vender:", symbol);
      return;
    }

    const cantidadActual = Number(holding.cantidad);

    if (cantidadVenta > cantidadActual) {
      alert("No podés vender más de lo que tenés.");
      return;
    }

    // Precio actual para calcular importe de venta
    const precio_actual = await fetchCurrentPrice(symbol);
    const importeVenta = precio_actual ? precio_actual * cantidadVenta : 0;

    // Registrar transacción tipo venta
    await supabase.from("transactions").insert([
      {
        holding_id: holding.id,
        activo: symbol,
        fecha: new Date().toISOString().slice(0, 10),
        precio_compra: precio_actual,
        importe: importeVenta,
        cantidad: cantidadVenta,
        tipo: "venta",
        asset_type: holding.asset_type,
      },
    ]);

    // CASO 1 → Venta total → eliminar holding
    if (cantidadVenta === cantidadActual) {
      await supabase.from("holdings").delete().eq("id", holding.id);
    }

    // CASO 2 → Venta parcial → restar cantidad
    else {
      const nuevaCantidad = cantidadActual - cantidadVenta;

      // El total invertido baja proporcional a las unidades vendidas
      const total_invertido_actual = Number(holding.total_invertido || 0);
      const total_invertido_nuevo =
        (nuevaCantidad / cantidadActual) * total_invertido_actual;

      await supabase
        .from("holdings")
        .update({
          cantidad: nuevaCantidad,
          total_invertido: total_invertido_nuevo,
          precio_compra:
            nuevaCantidad > 0
              ? total_invertido_nuevo / nuevaCantidad
              : holding.precio_compra,
          precio_actual,
        })
        .eq("id", holding.id);
    }

    await fetchHoldings();
    await fetchTransactions();
  } catch (err) {
    console.error("Error en handleSellAsset:", err);
  }
};

  const balanceTotalARS = dolarMEP ? balanceTotalUSD * dolarMEP : 0;

  return {
    holdings,
    transactions,
    expandedSymbol,
    showForm,
    setShowForm,
    handleExpand,
    loading,
    handleSubmit,
    register,
    onSubmit,
    searchTerm,
    suggestions,
    handleSearchChange,
    handleSuggestionClick,
    assetType,
    setAssetType,
    balanceTotalUSD,
    balanceTotalARS,
    dolarMEP,
    handleSellAsset,   // ← AGREGAR ESTO
  };
};