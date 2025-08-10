export function applyAffiliateTracking(
  partner: 'instacart'|'walmart'|'amazon',
  baseUrl: string,
  ids: { instacart?: string; walmart?: string; amazon?: string }
) {
  const u = new URL(baseUrl);
  if (partner === 'instacart' && ids.instacart) u.searchParams.set('aff_id', ids.instacart);
  if (partner === 'walmart' && ids.walmart) u.searchParams.set('affp1', ids.walmart);
  if (partner === 'amazon' && ids.amazon) u.searchParams.set('tag', ids.amazon);
  u.searchParams.set('utm_source', 'swifteatz');
  return u.toString();
}
