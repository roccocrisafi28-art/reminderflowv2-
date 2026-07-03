"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase-browser";

type Client = {
  id: string;
  name: string;
  email: string;
  service: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
};

const statusLabel: Record<string, string> = {
  upcoming: "Upcoming",
  reminded: "Notified",
  rescheduled: "Rescheduled",
};

const statusStyles: Record<string, string> = {
  upcoming: "bg-[#E6F1FB] text-[#0C447C]",
  reminded: "bg-[#EAF3DE] text-[#27500A]",
  rescheduled: "bg-[#FAEEDA] text-[#633806]",
};

function parseToDateObj(dateStr: string): Date | null {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "",
    appointment_date: "",
    appointment_time: "",
  });

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      let { data: business } = await supabase
        .from("businesses")
        .select("id, name, subscription_status")
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (!business) {
        const nameFromSignup = userData.user.user_metadata?.business_name;
        const { data: created } = await supabase
          .from("businesses")
          .insert({ owner_id: userData.user.id, name: nameFromSignup || "My business" })
          .select("id, name, subscription_status")
          .single();
        business = created;
      }

      if (!business) {
        router.push("/login");
        return;
      }

      if (business.subscription_status !== "active" && business.subscription_status !== "trialing") {
        router.push("/billing");
        return;
      }

      setBusinessId(business.id);
      setBusinessName(business.name);

      const { data: clientRows } = await supabase
        .from("clients")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

      setClients(clientRows || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!businessId) return;

    const { data, error } = await supabase
      .from("clients")
      .insert({ ...form, business_id: businessId, status: "upcoming" })
      .select()
      .single();

    if (error) {
      setFormError(error.message);
      return;
    }

    setClients([data, ...clients]);
    setForm({ name: "", email: "", service: "", appointment_date: "", appointment_time: "" });
    setShowForm(false);
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !businessId) return;

    setImporting(true);
    setImportMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        const res = await fetch("/api/import-clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessId, rows }),
        });
        const body = await res.json();

        if (res.ok) {
          setImportMessage(`Imported ${body.count} client${body.count === 1 ? "" : "s"}.`);
          const { data: clientRows } = await supabase
            .from("clients")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false });
          setClients(clientRows || []);
        } else {
          setImportMessage(`Import failed: ${body.error}`);
        }
        setImporting(false);
        e.target.value = "";
      },
      error: () => {
        setImportMessage("Couldn't read that file. Make sure it's a .csv.");
        setImporting(false);
      },
    });
  }

  async function handleSendReminder(client: Client) {
    setSendingId(client.id);
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      if (res.ok) {
        setClients(clients.map((c) => (c.id === client.id ? { ...c, status: "reminded" } : c)));
      } else {
        const body = await res.json();
        alert("Couldn't send reminder: " + (body.error || "unknown error"));
      }
    } finally {
      setSendingId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // --- Calendar setup ---
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const clientsByDay = useMemo(() => {
    const map: Record<string, Client[]> = {};
    clients.forEach((c) => {
      const d = parseToDateObj(c.appointment_date);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [clients]);

  const visibleClients = selectedDay
    ? clientsByDay[selectedDay] || []
    : [...clients].sort((a, b) => {
        const da = parseToDateObj(a.appointment_date);
        const db = parseToDateObj(b.appointment_date);
        if (!da || !db) return 0;
        return da.getTime() - db.getTime();
      });

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-sm text-[#6B6A63]">Loading…</main>;
  }

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <main className="min-h-screen px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl">{businessName}</h1>
          <p className="text-sm text-[#6B6A63]">Appointment reminders</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-[#6B6A63] underline">
          Log out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        {/* Calendar */}
        <div className="bg-white border border-line rounded-2xl p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setMonthOffset(monthOffset - 1)} className="text-sm px-2 py-1 rounded-lg hover:bg-[#F3F1EA]">
              ‹
            </button>
            <p className="text-sm font-medium">{monthLabel}</p>
            <button onClick={() => setMonthOffset(monthOffset + 1)} className="text-sm px-2 py-1 rounded-lg hover:bg-[#F3F1EA]">
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#8C8A80] mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const key = `${year}-${month}-${day}`;
              const hasClients = !!clientsByDay[key];
              const isSelected = selectedDay === key;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`aspect-square rounded-lg text-xs flex flex-col items-center justify-center gap-0.5 ${
                    isSelected ? "bg-clay text-white" : "hover:bg-[#F3F1EA]"
                  }`}
                >
                  <span>{day}</span>
                  {hasClients && <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-clay"}`} />}
                </button>
              );
            })}
          </div>
          {selectedDay && (
            <button onClick={() => setSelectedDay(null)} className="text-xs text-clay underline mt-3">
              Clear day filter
            </button>
          )}
        </div>

        {/* Client list + actions */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h2 className="font-display text-lg">
              {selectedDay ? "Appointments this day" : "All clients"}
            </h2>
            <div className="flex gap-2">
              <label className="text-sm border border-line rounded-xl px-3 py-2 cursor-pointer bg-white hover:bg-[#F3F1EA]">
                {importing ? "Importing…" : "Import CSV"}
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" disabled={importing} />
              </label>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-clay text-white text-sm rounded-xl px-3 py-2"
              >
                {showForm ? "Cancel" : "Add client"}
              </button>
            </div>
          </div>

          {importMessage && (
            <p className="text-sm text-[#6B6A63] mb-3">
              {importMessage}{" "}
              <a href="/sample-clients.csv" download className="text-clay underline">
                Download sample CSV
              </a>
            </p>
          )}

          {!importMessage && (
            <p className="text-xs text-[#8C8A80] mb-3">
              Have a client list already?{" "}
              <a href="/sample-clients.csv" download className="text-clay underline">
                Download the sample CSV format
              </a>{" "}
              to see the columns needed, then import above.
            </p>
          )}

          {showForm && (
            <form onSubmit={handleAddClient} className="border border-line rounded-2xl p-4 mb-6 flex flex-col gap-3 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Client name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-line rounded-xl px-3 py-2 text-sm"
                />
                <input
                  placeholder="Client email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-line rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <input
                placeholder="Service (e.g. Teeth cleaning)"
                required
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="border border-line rounded-xl px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  className="border border-line rounded-xl px-3 py-2 text-sm"
                />
                <input
                  placeholder="Appointment time (e.g. 10:00 AM)"
                  required
                  value={form.appointment_time}
                  onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                  className="border border-line rounded-xl px-3 py-2 text-sm"
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <button type="submit" className="bg-ink text-white text-sm rounded-xl px-3 py-2 self-start">
                Save client
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {visibleClients.length === 0 && (
              <p className="text-sm text-[#6B6A63]">
                {selectedDay ? "No appointments on this day." : "No clients yet. Add one or import a CSV above."}
              </p>
            )}
            {visibleClients.map((c) => (
              <div key={c.id} className="border border-line rounded-2xl p-4 bg-white flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-sm text-[#6B6A63]">{c.service}</p>
                  <p className="text-xs text-[#8C8A80] mt-1">{c.appointment_date} at {c.appointment_time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-pill ${statusStyles[c.status] || statusStyles.upcoming}`}>
                    {statusLabel[c.status] || c.status}
                  </span>
                  <button
                    onClick={() => handleSendReminder(c)}
                    disabled={sendingId === c.id}
                    className="text-sm border border-line rounded-xl px-3 py-1.5 disabled:opacity-60"
                  >
                    {sendingId === c.id ? "Sending…" : "Send reminder"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
