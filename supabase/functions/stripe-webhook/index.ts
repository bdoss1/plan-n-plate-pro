import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.22.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabaseAdmin = createClient(Deno.env.get("VITE_SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE")!);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (e) {
    return new Response(`Invalid signature: ${e.message}`, { status: 400 });
  }

  try {
    if (event.type.startsWith("customer.subscription.")) {
      const sub: any = event.data.object;
      const email = sub?.customer_email || sub?.customer_details?.email;
      const priceId = sub?.items?.data?.[0]?.price?.id;
      if (email) {
        let tier = 'free';
        if (priceId === Deno.env.get("PRO_PRICE_ID")) tier = 'pro';
        if (priceId === Deno.env.get("PREMIUM_PRICE_ID")) tier = 'premium';
        await supabaseAdmin.from('profiles').update({ subscription_tier: tier }).eq('email', email);
      }
    }
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
