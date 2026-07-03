"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      // Store the business name in the user's own metadata instead of writing
      // to the businesses table right away. If email confirmation is turned
      // on, the user isn't fully authenticated yet at this point, so a direct
      // table write here can silently fail. We create the business row later,
      // the first time they successfully log in (see the "login" branch below).
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { business_name: businessName || "My business" } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is required, there's no session yet — show a
      // "check your email" message instead of trying to go to the dashboard.
      if (!data.session) {
        setLoading(false);
        setCheckEmail(true);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    // Make sure a business row exists for this account. Runs after both
    // login and signup-without-confirmation, and is safe to run every time —
    // it only inserts if nothing exists yet.
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userData.user.id)
        .maybeSingle();

      if (!existingBusiness) {
        const nameFromSignup = userData.user.user_metadata?.business_name;
        await supabase.from("businesses").insert({
          owner_id: userData.user.id,
          name: nameFromSignup || businessName || "My business",
        });
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checkEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-2xl mb-2">Check your email</h1>
          <p className="text-sm text-[#6B6A63]">
            We sent a confirmation link to <strong>{email}</strong>. Click it,
            then come back here and log in.
          </p>
          <button
            onClick={() => {
              setCheckEmail(false);
              setMode("login");
            }}
            className="text-sm text-clay mt-6 underline"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">ReminderFlow</h1>
        <p className="text-sm text-[#6B6A63] mb-8">
          {mode === "login" ? "Log in to your dashboard." : "Set up your business account."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="border border-line rounded px-3 py-2 text-sm"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-line rounded px-3 py-2 text-sm"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-clay text-white rounded px-3 py-2 text-sm mt-2 disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-sm text-clay mt-4 underline"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}
