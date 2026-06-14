import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request, { params }: any) {
  const { data } = await supabase.from("orders").select("*").eq("id", params.id).single();
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();
  const { data } = await supabase.from("orders").update(body).eq("id", params.id).select().single();
  return NextResponse.json({ data });
}