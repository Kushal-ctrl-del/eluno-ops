import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", JSON.stringify(error));
      return NextResponse.json({ data: [], error: error.message });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error("Catch error:", err.message);
    return NextResponse.json({ data: [], error: err.message });
  }
}