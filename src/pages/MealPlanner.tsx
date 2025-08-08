import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Loader2 } from "lucide-react";

const MealPlanner = () => {
  const [preferences, setPreferences] = useState({
    dietary_restrictions: "",
    calories_per_day: "",
    meals_per_day: "3",
    cuisine_preference: "",
    allergies: "",
    fitness_goal: "",
  });
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const generateMealPlan = async () => {
    if (!preferences.calories_per_day) {
      toast({
        title: "Missing Information",
        description: "Please enter your daily calorie target",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { preferences }
      });

      if (error) throw error;

      const parsedPlan = typeof data === 'string' ? JSON.parse(data) : data;
      setMealPlan(parsedPlan);
      
      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan is ready.",
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <ChefHat className="h-8 w-8 mr-3" />
            AI Meal Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate personalized meal plans based on your preferences and goals
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="calories">Daily Calorie Target</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="2000"
                    value={preferences.calories_per_day}
                    onChange={(e) => handleInputChange("calories_per_day", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="meals">Meals Per Day</Label>
                  <Select value={preferences.meals_per_day} onValueChange={(value) => handleInputChange("meals_per_day", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 meals</SelectItem>
                      <SelectItem value="3">3 meals</SelectItem>
                      <SelectItem value="4">4 meals</SelectItem>
                      <SelectItem value="5">5 meals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fitness-goal">Fitness Goal</Label>
                <Select value={preferences.fitness_goal} onValueChange={(value) => handleInputChange("fitness_goal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="athletic_performance">Athletic Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cuisine">Cuisine Preference</Label>
                <Input
                  id="cuisine"
                  placeholder="e.g., Mediterranean, Asian, Italian"
                  value={preferences.cuisine_preference}
                  onChange={(e) => handleInputChange("cuisine_preference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="restrictions">Dietary Restrictions</Label>
                <Textarea
                  id="restrictions"
                  placeholder="e.g., vegetarian, vegan, keto, paleo"
                  value={preferences.dietary_restrictions}
                  onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="e.g., nuts, dairy, gluten"
                  value={preferences.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                />
              </div>

              <Button onClick={generateMealPlan} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ChefHat className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {mealPlan ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Weekly Meal Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {mealPlan.days?.map((day: any, index: number) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <h3 className="font-semibold text-lg mb-3">{day.day}</h3>
                          <div className="grid gap-3">
                            {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                              <div key={mealType} className="bg-muted p-3 rounded-lg">
                                <h4 className="font-medium capitalize mb-1">{mealType}</h4>
                                <p className="text-sm text-muted-foreground">{meal}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex justify-between text-sm">
                            <span className="font-medium">Daily Calories: {day.calories}</span>
                            {day.notes && <span className="text-muted-foreground">{day.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Meal Plan Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Fill out your preferences and click "Generate Meal Plan" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MealPlanner;