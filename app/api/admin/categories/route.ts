import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("job_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Error fetching categories:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}