import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Apple, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Nutrition = () => {
  const [nutritionLogs, setNutritionLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [newFood, setNewFood] = useState({
    food_item: "",
    meal_type: "",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNutritionLogs();
  }, []);

  const fetchNutritionLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNutritionLogs(data || []);
    } catch (error) {
      console.error("Error fetching nutrition logs:", error);
      toast({
        title: "Error",
        description: "Failed to load nutrition logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addFood = async () => {
    if (!newFood.food_item || !newFood.meal_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in food item and meal type",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: user.id,
        food_item: newFood.food_item,
        meal_type: newFood.meal_type,
        calories: newFood.calories ? parseInt(newFood.calories) : null,
        protein_g: newFood.protein_g ? parseFloat(newFood.protein_g) : null,
        carbs_g: newFood.carbs_g ? parseFloat(newFood.carbs_g) : null,
        fat_g: newFood.fat_g ? parseFloat(newFood.fat_g) : null,
        date: newFood.date,
      });

      if (error) throw error;

      toast({
        title: "Food Added!",
        description: "Your food item has been logged successfully.",
      });

      setNewFood({
        food_item: "",
        meal_type: "",
        calories: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingFood(false);
      fetchNutritionLogs();
    } catch (error) {
      console.error("Error adding food:", error);
      toast({
        title: "Error",
        description: "Failed to add food item",
        variant: "destructive",
      });
    }
  };

  const deleteFood = async (id: string) => {
    try {
      const { error } = await supabase
        .from("nutrition_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Food Deleted",
        description: "Food item has been removed from your log.",
      });
      fetchNutritionLogs();
    } catch (error) {
      console.error("Error deleting food:", error);
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  const groupedLogs = nutritionLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {});

  const getTotalCaloriesForDate = (logs: any[]) => {
    return logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Apple className="h-8 w-8 mr-3" />
              Nutrition Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Log your meals and track your nutritional intake
            </p>
          </div>
          <Dialog open={isAddingFood} onOpenChange={setIsAddingFood}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Food
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Food Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="food-item">Food Item</Label>
                  <Input
                    id="food-item"
                    placeholder="e.g., Grilled Chicken Breast"
                    value={newFood.food_item}
                    onChange={(e) => setNewFood(prev => ({ ...prev, food_item: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select value={newFood.meal_type} onValueChange={(value) => setNewFood(prev => ({ ...prev, meal_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newFood.date}
                      onChange={(e) => setNewFood(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="250"
                      value={newFood.calories}
                      onChange={(e) => setNewFood(prev => ({ ...prev, calories: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="25"
                      value={newFood.protein_g}
                      onChange={(e) => setNewFood(prev => ({ ...prev, protein_g: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="10"
                      value={newFood.carbs_g}
                      onChange={(e) => setNewFood(prev => ({ ...prev, carbs_g: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      placeholder="5"
                      value={newFood.fat_g}
                      onChange={(e) => setNewFood(prev => ({ ...prev, fat_g: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={addFood} className="w-full">
                  Add Food Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([date, logs]: [string, any]) => (
            <Card key={date}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{new Date(date).toLocaleDateString()}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Total: {getTotalCaloriesForDate(logs)} calories
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logs.map((log: any) => (
                    <div key={log.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{log.food_item}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteFood(log.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="capitalize">{log.meal_type}</span>
                          {log.calories && <span>{log.calories} cal</span>}
                          {log.protein_g && <span>{log.protein_g}g protein</span>}
                          {log.carbs_g && <span>{log.carbs_g}g carbs</span>}
                          {log.fat_g && <span>{log.fat_g}g fat</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {nutritionLogs.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Apple className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Food Logged Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start tracking your nutrition by adding your first food item.
                </p>
                <Button onClick={() => setIsAddingFood(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Food
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Nutrition;