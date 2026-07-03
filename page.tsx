import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase-admin";
import { reminderSubject, reminderHtml } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*, businesses(name)")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: process.env.REMINDER_FROM_EMAIL || "reminders@yourdomain.com",
      to: client.email,
      subject: reminderSubject(client),
      html: reminderHtml(client, { name: client.businesses.name }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Email send failed" }, { status: 500 });
  }

  await supabase.from("clients").update({ status: "reminded" }).eq("id", clientId);

  return NextResponse.json({ success: true });
}
