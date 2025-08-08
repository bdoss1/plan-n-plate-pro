import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { 
  ChefHat, 
  Plus, 
  Calendar, 
  ShoppingCart, 
  Sparkles, 
  Crown, 
  Loader2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface MealPlan {
  id: string;
  title: string;
  week_start_date: string;
  meals: any;
  created_at: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  created_at: string;
  servings: number;
}

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!profile?.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    // Check for payment success/cancellation
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: "Payment successful!",
        description: "Your subscription has been activated.",
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "Your subscription was not activated.",
        variant: "destructive"
      });
    }

    fetchDashboardData();
  }, [user, profile, navigate, searchParams, toast]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Fetch recent meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (mealPlansError && mealPlansError.code !== 'PGRST116') {
        throw mealPlansError;
      }

      // Fetch recent recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (recipesError && recipesError.code !== 'PGRST116') {
        throw recipesError;
      }

      setMealPlans(mealPlansData || []);
      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    setGeneratingPlan(true);
    
    try {
      // Use profile data for preferences
      const preferences = {
        dietary_preferences: profile?.dietary_preferences || [],
        allergies: profile?.allergies || [],
        budget_range: profile?.budget_range || 'moderate',
        cooking_skill_level: profile?.cooking_skill_level || 'intermediate',
        household_size: profile?.household_size || 1,
        meals_per_week: profile?.meals_per_week || 7,
        calories_per_day: 2000
      };

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { preferences }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      // Parse the meal plan and save to database
      if (data && data.days) {
        const { error: insertError } = await supabase
          .from('meal_plans')
          .insert({
            user_id: user.id,
            title: `Meal Plan - ${new Date().toLocaleDateString()}`,
            week_start_date: new Date().toISOString().split('T')[0],
            meals: data,
            total_estimated_cost: 50.00 // placeholder
          });

        if (insertError) {
          console.error('Error saving meal plan:', insertError);
        }
      }

      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan is ready.",
      });

      await fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive"
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleUpgrade = async (plan: 'pro' | 'premium') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive"
      });
    }
  };

  const getSubscriptionBadge = () => {
    const tier = profile?.subscription_tier || 'free';
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      pro: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[tier as keyof typeof colors]}>
        {tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : 'Premium'}
      </Badge>
    );
  };

  const getUsageInfo = () => {
    const planUsed = profile?.monthly_meal_plans_used || 0;
    const suggestUsed = profile?.monthly_smart_suggests_used || 0;
    const tier = profile?.subscription_tier || 'free';
    
    const limits = {
      free: { plans: 1, suggests: 1 },
      pro: { plans: 10, suggests: 999 },
      premium: { plans: 999, suggests: 999 }
    };
    
    const limit = limits[tier as keyof typeof limits];
    
    return { planUsed, suggestUsed, limit };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const usage = getUsageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name || user?.email}!</h1>
              <p className="text-gray-600 mt-1">Here's your SwiftEatz dashboard</p>
            </div>
            {getSubscriptionBadge()}
          </div>
        </div>
        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meal Plans This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usage.planUsed} / {usage.limit.plans === 999 ? '∞' : usage.limit.plans}
              </div>
              <p className="text-xs text-muted-foreground">
                {usage.limit.plans - usage.planUsed > 0 && usage.limit.plans !== 999
                  ? `${usage.limit.plans - usage.planUsed} remaining`
                  : usage.limit.plans === 999 ? 'Unlimited' : 'Limit reached'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Smart Suggests</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {usage.suggestUsed} / {usage.limit.suggests === 999 ? '∞' : usage.limit.suggests}
              </div>
              <p className="text-xs text-muted-foreground">
                {usage.limit.suggests === 999 ? 'Unlimited' : 'Monthly usage'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Recipes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes.length}</div>
              <p className="text-xs text-muted-foreground">Personal collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Generate Meal Plan
              </CardTitle>
              <CardDescription>
                Create an AI-powered weekly meal plan based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleGenerateMealPlan} 
                disabled={generatingPlan || (usage.planUsed >= usage.limit.plans && usage.limit.plans !== 999)}
                className="w-full"
              >
                {generatingPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/nutrition')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5 text-primary" />
                Add Recipe
              </CardTitle>
              <CardDescription>
                Create or import new recipes to your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/meal-planner')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                Meal Planner
              </CardTitle>
              <CardDescription>
                View and manage your meal plans and grocery lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Meal Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meal Plans</CardTitle>
              <CardDescription>Your latest AI-generated meal plans</CardDescription>
            </CardHeader>
            <CardContent>
              {mealPlans.length > 0 ? (
                <div className="space-y-3">
                  {mealPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-gray-600">
                          Week of {new Date(plan.week_start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/meal-planner')}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No meal plans yet</p>
                  <p className="text-sm text-gray-500">Generate your first meal plan above</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recipe Collection</CardTitle>
              <CardDescription>Your saved recipes</CardDescription>
            </CardHeader>
            <CardContent>
              {recipes.length > 0 ? (
                <div className="space-y-3">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{recipe.title}</p>
                        <p className="text-sm text-gray-600">Serves {recipe.servings}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => navigate('/nutrition')}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600">No recipes yet</p>
                  <p className="text-sm text-gray-500">Add your first recipe</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA for Free Users */}
        {profile?.subscription_tier === 'free' && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5 text-primary" />
                Unlock Premium Features
              </CardTitle>
              <CardDescription>
                Get unlimited meal plans, advanced AI features, and grocery ordering
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => handleUpgrade('pro')} className="flex-1">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade to Pro - $29.99/mo
                </Button>
                <Button onClick={() => handleUpgrade('premium')} variant="outline" className="flex-1">
                  <Crown className="mr-2 h-4 w-4" />
                  Go Premium - $69.99/mo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;