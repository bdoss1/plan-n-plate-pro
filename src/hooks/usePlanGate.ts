import { useEffect, useState } from 'react';
import { LIMITS, PlanKey, isOverLimit } from '@/lib/plan';
import { supabase } from '@/integrations/supabase/client';

type Usage = { monthly_meal_plans_used: number; monthly_smart_suggests_used: number; custom_recipes_count: number };

export function usePlanGate(userId?: string | null) {
  const [plan, setPlan] = useState<PlanKey>('free');
  const [usage, setUsage] = useState<Usage>({ monthly_meal_plans_used: 0, monthly_smart_suggests_used: 0, custom_recipes_count: 0 });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('subscription_tier, monthly_meal_plans_used, monthly_smart_suggests_used, custom_recipes_count').eq('user_id', userId).single();
      if (data) {
        setPlan((data.subscription_tier || 'free') as PlanKey);
        setUsage({
          monthly_meal_plans_used: data.monthly_meal_plans_used || 0,
          monthly_smart_suggests_used: data.monthly_smart_suggests_used || 0,
          custom_recipes_count: data.custom_recipes_count || 0,
        });
      }
    })();
  }, [userId]);

  const limits = LIMITS[plan];
  return {
    plan,
    limits,
    usage,
    over: {
      mealPlans: isOverLimit(usage.monthly_meal_plans_used, limits.mealPlans),
      smartSuggest: isOverLimit(usage.monthly_smart_suggests_used, limits.smartSuggest),
      recipes: isOverLimit(usage.custom_recipes_count, limits.recipes),
    },
  };
}
