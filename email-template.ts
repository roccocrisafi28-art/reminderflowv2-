import { createClient } from "@supabase/supabase-js";

// Uses the service role key — only ever imported in server-side API routes,
// never sent to the browser. This is what lets the reschedule page (which
// visitors use without logging in) update appointment rows safely.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
