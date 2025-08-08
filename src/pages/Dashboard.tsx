import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChefHat, Apple, TrendingUp, Calendar } from "lucide-react";

const Dashboard = () => {
  const [recentNutrition, setRecentNutrition] = useState<any[]>([]);
  const [recentProgress, setRecentProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent nutrition logs
      const { data: nutrition } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      // Fetch latest progress entry
      const { data: progress } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      setRecentNutrition(nutrition || []);
      setRecentProgress(progress);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayNutrition = recentNutrition.filter(
    item => new Date(item.date).toDateString() === new Date().toDateString()
  );

  const totalCaloriesToday = todayNutrition.reduce((sum, item) => sum + (item.calories || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome to SwiftEatz</h1>
          <p className="text-muted-foreground mt-2">Track your nutrition and plan your meals</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCaloriesToday}</div>
              <p className="text-xs text-muted-foreground">
                {todayNutrition.length} meals logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentProgress?.weight_kg ? `${recentProgress.weight_kg} kg` : "Not set"}
              </div>
              <p className="text-xs text-muted-foreground">
                {recentProgress?.date ? new Date(recentProgress.date).toLocaleDateString() : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Meals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentNutrition.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meal Planning</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/meal-planner">Plan Meals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meals</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNutrition.length > 0 ? (
                <div className="space-y-3">
                  {recentNutrition.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.food_item}</p>
                        <p className="text-sm text-muted-foreground">{item.meal_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.calories} cal</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No meals logged yet</p>
              )}
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/nutrition">View All Nutrition</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/meal-planner">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Generate Meal Plan
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/nutrition">
                  <Apple className="h-4 w-4 mr-2" />
                  Log Food
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/progress">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Progress
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;