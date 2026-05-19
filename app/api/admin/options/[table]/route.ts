import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

// Allowed tables (whitelist for security)
const allowedTables = [
  "companies",
  "job_categories",
  "job_types",
  "experience_levels"
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("id, name")
      .order("name");

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error(`Error fetching ${table}:`, error.message);
    return NextResponse.json([], { status: 500 });
  }
}