import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("breach_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ data: [] });
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}