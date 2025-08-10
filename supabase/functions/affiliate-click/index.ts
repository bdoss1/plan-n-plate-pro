import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type Body = {
  initiator_user_id: string;
  partner_name: 'instacart' | 'walmart' | 'amazon';
  base_url: string;
};

function applyAffiliateTracking(partner: Body['partner_name'], baseUrl: string, ids: { instacart?: string; walmart?: string; amazon?: string }) {
  const u = new URL(baseUrl);
  if (partner === 'instacart' && ids.instacart) u.searchParams.set('aff_id', ids.instacart);
  if (partner === 'walmart'   && ids.walmart)   u.searchParams.set('affp1', ids.walmart);
  if (partner === 'amazon'    && ids.amazon)    u.searchParams.set('tag', ids.amazon);
  u.searchParams.set('utm_source', 'swifteatz');
  return u.toString();
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('VITE_SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE')!
  );

  const body: Body = await req.json();
  if (!body?.initiator_user_id || !body?.partner_name || !body?.base_url) {
    return new Response('Bad request', { status: 400 });
  }

  const { data: cfg } = await supabaseAdmin.from('affiliate_config').select('*').eq('id', 1).single();
  const tracked = applyAffiliateTracking(body.partner_name, body.base_url, {
    instacart: cfg?.instacart_id || Deno.env.get('AFF_INSTACART_ID') || undefined,
    walmart:   cfg?.walmart_id   || Deno.env.get('AFF_WALMART_ID')   || undefined,
    amazon:    cfg?.amazon_tag   || Deno.env.get('AFF_AMAZON_TAG')   || undefined,
  });

  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('user_id, email, is_admin')
    .eq('is_admin', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let adminUserId = adminProfile?.user_id as string | null;
  if (!adminUserId) {
    const { data: p2 } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .ilike('email', 'baron@dossx.com')
      .maybeSingle();
    adminUserId = (p2?.user_id as string) || null;
  }

  const { error } = await supabaseAdmin.from('affiliate_clicks').insert({
    user_id: adminUserId,
    partner_name: body.partner_name,
    order_url: tracked,
    status: 'clicked'
  } as any);

  if (error) {
    return new Response(`Insert error: ${error.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ url: tracked }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
