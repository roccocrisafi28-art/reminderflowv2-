"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function ReschedulePage() {
  const params = useParams();
  const clientId = params.id as string;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const res = await fetch("/api/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, newDate: date, newTime: time }),
    });

    setStatus(res.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-xl mb-2">You're all set</h1>
          <p className="text-sm text-[#6B6A63]">
            Your appointment has been moved to {date} at {time}. See you then.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-xl mb-1">Pick a new time</h1>
        <p className="text-sm text-[#6B6A63] mb-6">
          Choose a date and time that works better for you.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm"
          />
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm"
          />
          {status === "error" && (
            <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="bg-clay text-white rounded px-3 py-2 text-sm disabled:opacity-60"
          >
            {status === "submitting" ? "Saving…" : "Confirm new time"}
          </button>
        </form>
      </div>
    </main>
  );
}
