import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
  meal_plan_id?: string;
}

const GroceryList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Other" });
  const [loading, setLoading] = useState(true);

  const categories = ["Produce", "Meat & Seafood", "Dairy", "Pantry", "Frozen", "Other"];

  useEffect(() => {
    if (user) {
      fetchGroceryItems();
    }
  }, [user]);

  const fetchGroceryItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grocery items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!user || !newItem.name.trim()) return;

    try {
      const { error } = await supabase
        .from('grocery_items')
        .insert({
          user_id: user.id,
          name: newItem.name.trim(),
          quantity: newItem.quantity.trim() || "1",
          category: newItem.category,
          checked: false
        });

      if (error) throw error;

      setNewItem({ name: "", quantity: "", category: "Other" });
      fetchGroceryItems();
      
      toast({
        title: "Item added",
        description: "Added to your grocery list"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ checked })
        .eq('id', id);

      if (error) throw error;
      fetchGroceryItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchGroceryItems();
      
      toast({
        title: "Item removed",
        description: "Removed from your grocery list"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Grocery List</h1>
          <p className="text-muted-foreground">Manage your shopping list</p>
        </div>
      </div>

      {/* Add new item */}
      <Card>
        <CardHeader>
          <CardTitle>Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <Input
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-24"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grocery items by category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {category}
              <Badge variant="secondary">{categoryItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(checked) => toggleItem(item.id, checked as boolean)}
                  />
                  <div className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                    <span className="font-medium">{item.name}</span>
                    {item.quantity && <span className="text-sm text-muted-foreground ml-2">({item.quantity})</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Your grocery list is empty</p>
            <p className="text-muted-foreground">Add items above to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroceryList;