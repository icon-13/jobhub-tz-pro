import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    title,
    slug,
    company_id,
    category_id,
    job_type_id,
    experience_level_id,
    location,
    salary_min,
    salary_max,
    description,
    requirements,
    benefits,
    how_to_apply,
    application_deadline,
    poster_image_url,
    job_document_url,
    document_type,
    is_active,
  } = body;

  if (!title || !slug || !category_id || !job_type_id || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      title,
      slug,
      company_id: company_id ? parseInt(company_id) : null,
      category_id: parseInt(category_id),
      job_type_id: parseInt(job_type_id),
      experience_level_id: experience_level_id ? parseInt(experience_level_id) : null,
      location,
      salary_min: salary_min ? parseFloat(salary_min) : null,
      salary_max: salary_max ? parseFloat(salary_max) : null,
      description,
      requirements,
      benefits,
      how_to_apply,
      application_deadline: application_deadline || null,
      poster_image_url: poster_image_url || null,
      job_document_url: job_document_url || null,
      document_type: document_type || "none",
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}