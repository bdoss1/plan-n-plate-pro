import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Plus, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Progress = () => {
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState({
    weight_kg: "",
    body_fat_percentage: "",
    muscle_mass_kg: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProgressLogs();
  }, []);

  const fetchProgressLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setProgressLogs(data || []);
    } catch (error) {
      console.error("Error fetching progress logs:", error);
      toast({
        title: "Error",
        description: "Failed to load progress logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProgress = async () => {
    if (!newProgress.weight_kg) {
      toast({
        title: "Missing Information",
        description: "Please enter your weight",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("progress_logs").insert({
        user_id: user.id,
        weight_kg: parseFloat(newProgress.weight_kg),
        body_fat_percentage: newProgress.body_fat_percentage ? parseFloat(newProgress.body_fat_percentage) : null,
        muscle_mass_kg: newProgress.muscle_mass_kg ? parseFloat(newProgress.muscle_mass_kg) : null,
        notes: newProgress.notes || null,
        date: newProgress.date,
      });

      if (error) throw error;

      toast({
        title: "Progress Added!",
        description: "Your progress has been logged successfully.",
      });

      setNewProgress({
        weight_kg: "",
        body_fat_percentage: "",
        muscle_mass_kg: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
      setIsAddingProgress(false);
      fetchProgressLogs();
    } catch (error) {
      console.error("Error adding progress:", error);
      toast({
        title: "Error",
        description: "Failed to add progress entry",
        variant: "destructive",
      });
    }
  };

  const chartData = progressLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString(),
    weight: log.weight_kg,
    bodyFat: log.body_fat_percentage,
    muscleMass: log.muscle_mass_kg,
  }));

  const latestEntry = progressLogs[progressLogs.length - 1];
  const previousEntry = progressLogs[progressLogs.length - 2];

  const getWeightChange = () => {
    if (!latestEntry || !previousEntry) return null;
    return latestEntry.weight_kg - previousEntry.weight_kg;
  };

  const weightChange = getWeightChange();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <TrendingUp className="h-8 w-8 mr-3" />
              Progress Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor your fitness journey with detailed progress logs
            </p>
          </div>
          <Dialog open={isAddingProgress} onOpenChange={setIsAddingProgress}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Progress
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Progress Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70.5"
                      value={newProgress.weight_kg}
                      onChange={(e) => setNewProgress(prev => ({ ...prev, weight_kg: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newProgress.date}
                      onChange={(e) => setNewProgress(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="body-fat">Body Fat Percentage</Label>
                    <Input
                      id="body-fat"
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={newProgress.body_fat_percentage}
                      onChange={(e) => setNewProgress(prev => ({ ...prev, body_fat_percentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="muscle-mass">Muscle Mass (kg)</Label>
                    <Input
                      id="muscle-mass"
                      type="number"
                      step="0.1"
                      placeholder="45.2"
                      value={newProgress.muscle_mass_kg}
                      onChange={(e) => setNewProgress(prev => ({ ...prev, muscle_mass_kg: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="How are you feeling? Any observations?"
                    value={newProgress.notes}
                    onChange={(e) => setNewProgress(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <Button onClick={addProgress} className="w-full">
                  Add Progress Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {progressLogs.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{latestEntry?.weight_kg} kg</div>
                  {weightChange && (
                    <p className={`text-xs ${weightChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from last entry
                    </p>
                  )}
                </CardContent>
              </Card>

              {latestEntry?.body_fat_percentage && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestEntry.body_fat_percentage}%</div>
                  </CardContent>
                </Card>
              )}

              {latestEntry?.muscle_mass_kg && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Muscle Mass</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestEntry.muscle_mass_kg} kg</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {chartData.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weight Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Progress History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{new Date(log.date).toLocaleDateString()}</span>
                        <span className="text-sm text-muted-foreground">{log.weight_kg} kg</span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {log.body_fat_percentage && (
                          <span>Body Fat: {log.body_fat_percentage}%</span>
                        )}
                        {log.muscle_mass_kg && (
                          <span>Muscle: {log.muscle_mass_kg} kg</span>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Progress Logged Yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start tracking your fitness journey by logging your first progress entry.
              </p>
              <Button onClick={() => setIsAddingProgress(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Progress
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Progress;