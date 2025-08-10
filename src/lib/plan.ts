export type PlanKey = 'free' | 'pro' | 'premium';

export const LIMITS: Record<PlanKey, {
  mealPlans: number | 'unlimited';
  recipes: number | 'unlimited';
  smartSuggest: number | 'unlimited';
  exportList: boolean;
  ordering: boolean;
}> = {
  free:    { mealPlans: 1,  recipes: 5,   smartSuggest: 1,          exportList: false, ordering: false },
  pro:     { mealPlans: 10, recipes: 100, smartSuggest: 'unlimited', exportList: true,  ordering: true  },
  premium: { mealPlans: 'unlimited', recipes: 'unlimited', smartSuggest: 'unlimited', exportList: true, ordering: true },
};

export function isOverLimit(used: number, limit: number | 'unlimited') {
  if (limit === 'unlimited') return false;
  return used >= limit;
}
