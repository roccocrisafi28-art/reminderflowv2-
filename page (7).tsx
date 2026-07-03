import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = createAdminClient();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const businessId = session.metadata?.business_id;
      if (businessId) {
        await supabase
          .from("businesses")
          .update({
            subscription_status: "active",
            stripe_subscription_id: session.subscription,
          })
          .eq("id", businessId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;
      const status = subscription.status; // active | past_due | canceled | trialing etc.
      await supabase
        .from("businesses")
        .update({ subscription_status: status })
        .eq("stripe_customer_id", customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
