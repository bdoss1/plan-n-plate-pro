import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Simple grocery list component that works for now
const GroceryList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", category: "Other" });

  const categories = ["Produce", "Meat & Seafood", "Dairy", "Pantry", "Frozen", "Other"];

  // For now, just show a placeholder UI since the types haven't updated yet
  const addItem = () => {
    if (!newItem.name.trim()) return;
    
    const item = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || "1",
      category: newItem.category,
      checked: false
    };
    
    setItems([...items, item]);
    setNewItem({ name: "", quantity: "", category: "Other" });
    
    toast({
      title: "Item added",
      description: "Added to your grocery list"
    });
  };

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Removed from your grocery list"
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  async function openAffiliate(partner: 'instacart'|'walmart'|'amazon', baseUrl: string) {
  if (!gate.limits.ordering) {
    setShowUpsell({ title: "Order in 1 Click (Pro & Premium)", body: "Send your list to Instacart, Walmart, or Amazon Fresh. Upgrade to unlock ordering." });
    return;
  }
  const { data: cfg } = await supabase.from('affiliate_config').select('*').eq('id', 1).single();
  const url = applyAffiliateTracking(partner, baseUrl, {
    instacart: cfg?.instacart_id || import.meta.env.VITE_AFF_INSTACART_ID,
    walmart:   cfg?.walmart_id   || import.meta.env.VITE_AFF_WALMART_ID,
    amazon:    cfg?.amazon_tag   || import.meta.env.VITE_AFF_AMAZON_TAG,
  });
  await supabase.from('affiliate_clicks').insert({ user_id: userId, partner_name: partner, order_url: url });
  window.open(url, '_blank', 'noopener,noreferrer');
}

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
              <Badge variant="secondary">{Array.isArray(categoryItems) ? categoryItems.length : 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.isArray(categoryItems) && categoryItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleItem(item.id)}
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
    </div>
  );
};

export default GroceryList;