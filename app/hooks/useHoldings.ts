import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";

export const COINGECKO_MAP: Record<string, string> = {
  BTCUSD: "bitcoin",
  ETHUSD: "ethereum",
  SOLUSD: "solana",
  BNBUSD: "binancecoin",
  XRPUSD: "ripple",
  ADAUSD: "cardano",
  DOGEUSD: "dogecoin",
  AVAXUSD: "avalanche-2",
  TRXUSD: "tron",
  LINKUSD: "chainlink",
  DOTUSD: "polkadot",
  MATICUSD: "matic-network",
  LTCUSD: "litecoin",
  BCHUSD: "bitcoin-cash",
  UNIUSD: "uniswap",
  ATOMUSD: "cosmos",
  XLMUSD: "stellar",
  XMRUSD: "monero",
  ETCUSD: "ethereum-classic",
  HBARUSD: "hedera-hashgraph",
  FILUSD: "filecoin",
  VETUSD: "vechain",
  AAVEUSD: "aave",
  ALGOUSD: "algorand",
  FTMUSD: "fantom",
  SANDUSD: "the-sandbox",
  MANAUSD: "decentraland",
  EGLDUSD: "multiversx",
  HNTUSD: "helium",
  NEARUSD: "near",
  FLOWUSD: "flow",
  CHZUSD: "chiliz",
  THETAUSD: "theta-token",
  EOSUSD: "eos",
  RUNEUSD: "thorchain",
  AXSUSD: "axie-infinity",
  CAKEUSD: "pancakeswap-token",
  ZECUSD: "zcash",
  MIOTAUSD: "iota",
  KSMUSD: "kusama",
  CELUSD: "celsius-degree-token",
  GRTUSD: "the-graph",
  MKRUSD: "maker",
  CRVUSD: "curve-dao-token",
  SNXUSD: "synthetix-network-token",
  LRCUSD: "loopring",
  ENJUSD: "enjincoin",
  AMPUSD: "amp-token",
  DASHUSD: "dash",
  BTGUSD: "bitcoin-gold",
  NEOUSD: "neo",
  ZILUSD: "zilliqa",
  QTUMUSD: "qtum",
  ARUSD: "arweave",
  KAVAUSD: "kava",
  OKBUSD: "okb",
  CROUSD: "crypto-com-chain",
  XECUSD: "ecash",
  COMPUSD: "compound-governance-token",
  WAVESUSD: "waves",
  CELOUSD: "celo",
  LPTUSD: "livepeer",
  IMXUSD: "immutable-x",
  STXUSD: "blockstack",
  OPUSD: "optimism",
  ARBUSD: "arbitrum",
  GMXUSD: "gmx",
  INJUSD: "injective-protocol",
  APEUSD: "apecoin",
  DYDXUSD: "dydx",
  LDOUSD: "lido-dao",
  RPLUSD: "rocket-pool",
  TUSDUSD: "true-usd",
  USDCUSD: "usd-coin",
  USDTUSD: "tether",
  DAIUSD: "dai",
  FRAXUSD: "frax",
  BUSDUSD: "binance-usd",
  PYUSDUSD: "paypal-usd",
  WBTCUSD: "wrapped-bitcoin",
  WETHUSD: "weth",
  SUIUSD: "sui",
  APTUSD: "aptos",
  BONKUSD: "bonk",
  JUPUSD: "jupiter-exchange-solana",
  PEPEUSD: "pepe",
  SHIBUSD: "shiba-inu",
  FLOKIUSD: "floki",
  SEIUSD: "sei-network",
  GALAUSD: "gala",
  RENDERUSD: "render-token",
  ONDOUSD: "ondo-finance",
  BEAMUSD: "beam",
};

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
  const [dolarMEP, setDolarMEP] = useState<number | null>(null);
  const [dolarMEPLoading, setDolarMEPLoading] = useState<boolean>(true);

  const fetchDolarMEP = async (attempt = 1) => {
    setDolarMEPLoading(true);
    try {
      const res = await fetch("https://dolarapi.com/v1/dolares/bolsa");
      if (!res.ok) {
        if (attempt < 2) return fetchDolarMEP(attempt + 1);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      const text = await res.text();
      if (!text) {
        if (attempt < 2) return fetchDolarMEP(attempt + 1);
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
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
        setDolarMEP(null);
        setDolarMEPLoading(false);
        return;
      }

      setDolarMEP(numeric);
      setDolarMEPLoading(false);
    } catch {
      if (attempt < 2) return fetchDolarMEP(attempt + 1);
      setDolarMEP(null);
      setDolarMEPLoading(false);
    }
  };

  const fetchCurrentPrice = async (symbol: string) => {
    try {
      if (!symbol) return null;

      const upper = symbol.toUpperCase();
      const isCrypto = upper.endsWith("USD");

      if (isCrypto) {
        const id = COINGECKO_MAP[upper];
        if (!id) return null;

        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
        );
        const data = await res.json();
        return data[id]?.usd ?? null;
      }

      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=${encodeURIComponent(
          symbol
        )}&apikey=${process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY}`
      );
      const data = await res.json();
      return data?.price ? parseFloat(data.price) : null;
    } catch {
      return null;
    }
  };

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      const updated = await Promise.all(
        (data || []).map(async (h: any) => {
          const precio_actual = await fetchCurrentPrice(h.activo);
          const total_invertido = Number(h.total_invertido || 0);
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

  const fetchTransactions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha", { ascending: false });

      if (!error) setTransactions(data || []);
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchTransactions();
    fetchDolarMEP();
  }, []);

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

  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (assetType === "crypto") {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
            value
          )}`
        );
        const data = await res.json();
        const cryptos = data.coins.slice(0, 10).map((c: any) => ({
          symbol: c.symbol.toUpperCase() + "USD",
          name: c.name,
          exchange: "Crypto",
        }));
        setSuggestions(cryptos);
        return;
      } catch {
        setSuggestions([]);
        return;
      }
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

  const onSubmit = async (formData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Debes iniciar sesión para agregar transacciones.");
        return;
      }

      const userId = user.id;

      const activoValue = (searchTerm || "").trim();
      if (!activoValue) {
        alert("Selecciona un activo.");
        return;
      }

      const cantidad = Number(formData.cantidad);
      const precio_compra = Number(formData.precio_compra);
      const fecha = formData.fecha;
      const importe = cantidad * precio_compra;

      formData.asset_type = assetType;

      const { data: existingHolding } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", userId)
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
          nuevaCantidad > 0
            ? nuevoTotalInvertido / nuevaCantidad
            : precio_compra;

        await supabase
          .from("holdings")
          .update({
            cantidad: nuevaCantidad,
            total_invertido: nuevoTotalInvertido,
            precio_compra: nuevoPPC,
            precio_actual,
            asset_type: formData.asset_type,
          })
          .eq("id", holdingId)
          .eq("user_id", userId);
      } else {
        const newHoldingObj: any = {
          user_id: userId,
          activo: activoValue,
          cantidad,
          precio_compra,
          total_invertido: importe,
          precio_actual,
          asset_type: formData.asset_type,
        };

        if (fecha) newHoldingObj.fecha = fecha;

        const { data: newHolding, error: newHoldingError } =
          await supabase
            .from("holdings")
            .insert([newHoldingObj])
            .select()
            .single();

        if (newHoldingError) {
          console.error("Error insertando holding:", newHoldingError);
          return;
        }

        holdingId = newHolding.id;
      }

      await supabase.from("transactions").insert([
        {
          user_id: userId,
          holding_id: holdingId,
          activo: activoValue,
          fecha,
          precio_compra,
          importe,
          cantidad,
          tipo: "compra",
          asset_type: formData.asset_type,
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
      alert("Error agregando transacción.");
    }
  };

  const balanceTotalUSD = holdings.reduce(
    (acc, h) => acc + (h.monto_actual || 0),
    0
  );

  const handleSellAsset = async (symbol: string, cantidadVenta: number) => {
    try {
      if (!symbol || !cantidadVenta || cantidadVenta <= 0) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Debes iniciar sesión.");
        return;
      }

      const { data: holding } = await supabase
        .from("holdings")
        .select("*")
        .eq("user_id", user.id)
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

      const precio_actual = await fetchCurrentPrice(symbol);
      const importeVenta =
        precio_actual ? precio_actual * cantidadVenta : 0;

      await supabase.from("transactions").insert([
        {
          user_id: user.id,
          holding_id: holding.id,
          activo: symbol,
          fecha: new Date().toISOString().slice(0, 10),
          precio_compra: precio_actual,
          importe: importeVenta,
          cantidad: -cantidadVenta,
          tipo: "venta",
          asset_type: holding.asset_type,
        },
      ]);

      if (cantidadVenta === cantidadActual) {
        await supabase
          .from("holdings")
          .delete()
          .eq("id", holding.id)
          .eq("user_id", user.id);
      } else {
        const nuevaCantidad = cantidadActual - cantidadVenta;

        const total_invertido_actual = Number(
          holding.total_invertido || 0
        );
        const total_invertido_nuevo =
          (nuevaCantidad / cantidadActual) *
          total_invertido_actual;

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
          .eq("id", holding.id)
          .eq("user_id", user.id);
      }

      await fetchHoldings();
      await fetchTransactions();
    } catch (err) {
      console.error("Error en handleSellAsset:", err);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    setSearchTerm(symbol);
    setSuggestions([]);
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
    handleSellAsset,
  };
};
