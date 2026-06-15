import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("lens_inventory").select("*");
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}