import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-display text-4xl leading-tight mb-4">
        Fewer no-shows.<br />No extra front-desk work.
      </h1>
      <p className="text-[#6B6A63] mb-8 max-w-md">
        ReminderFlow sends your clients personalized reminder emails before
        their appointment — with a one-click way to reschedule instead of
        just not showing up.
      </p>
      <Link
        href="/login"
        className="bg-clay text-white rounded px-4 py-2.5 text-sm inline-block"
      >
        Get started
      </Link>

      <div className="mt-16 grid grid-cols-1 gap-6 border-t border-line pt-8">
        <div>
          <p className="font-display text-lg mb-1">Built for the shop, not the enterprise</p>
          <p className="text-sm text-[#6B6A63]">
            Dentists, barbers, tattoo studios, massage and ortho practices —
            anywhere a missed appointment costs real money.
          </p>
        </div>
        <div>
          <p className="font-display text-lg mb-1">Personalized, not generic</p>
          <p className="text-sm text-[#6B6A63]">
            Every email uses the client's name, service, and appointment time
            — it reads like it came from your front desk, not a robot.
          </p>
        </div>
      </div>
    </main>
  );
}
