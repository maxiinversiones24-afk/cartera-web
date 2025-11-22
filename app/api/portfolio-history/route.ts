import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --------------------------------------
// 🔥 CLIENTE SERVER-ROLE (puede leer user_id)
// --------------------------------------
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// --------------------------------------
// 🔵 GET — opcional, para pruebas
// --------------------------------------
export async function GET() {
  return NextResponse.json({
    message: "Usa POST para traer el historial",
  });
}

// --------------------------------------
// 🔵 POST — el que usa tu frontend
// --------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { access_token, user_id } = body;

    if (!access_token || !user_id) {
      return NextResponse.json(
        { error: "Falta access_token o user_id" },
        { status: 400 }
      );
    }

    // Autenticar al usuario con el token recibido
    const { data: userData, error: authError } = await supabaseServer.auth.getUser(
      access_token
    );

    if (authError || !userData?.user) {
      return NextResponse.json(
        { error: "Token inválido o usuario no encontrado" },
        { status: 401 }
      );
    }

    // --------------------------------------
    // 🔥 Traer historial del usuario REAL
    // --------------------------------------
    const { data, error } = await supabaseServer
      .from("portfolio_history")
      .select("*")
      .eq("user_id", user_id)
      .order("recorded_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: data });
  } catch (e) {
    console.error("Error en API portfolio-history:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
