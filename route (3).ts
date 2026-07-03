import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const { businessId, rows } = await req.json();

  if (!businessId || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Missing businessId or rows" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const clientsToInsert = rows
    .filter((r: any) => r.name && r.email)
    .map((r: any) => ({
      business_id: businessId,
      name: r.name,
      email: r.email,
      service: r.service || "Appointment",
      appointment_date: r.appointment_date || "TBD",
      appointment_time: r.appointment_time || "TBD",
      status: "upcoming",
    }));

  if (clientsToInsert.length === 0) {
    return NextResponse.json({ error: "No valid rows found — each row needs at least name and email" }, { status: 400 });
  }

  const { data, error } = await supabase.from("clients").insert(clientsToInsert).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: data.length });
}
