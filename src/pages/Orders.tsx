import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

// Simple orders component for demo purposes
const Orders = () => {
  // Demo data for now
  const [orders] = useState([
    {
      id: "order_123",
      status: "delivered",
      total_amount: 127.45,
      created_at: "2024-01-15",
      estimated_delivery: "2024-01-18",
      items: [
        { name: "Organic Bananas", quantity: 6, price: 3.99 },
        { name: "Chicken Breast", quantity: 2, price: 12.99 },
        { name: "Greek Yogurt", quantity: 4, price: 1.50 }
      ]
    },
    {
      id: "order_124",
      status: "shipped",
      total_amount: 89.23,
      created_at: "2024-01-20",
      estimated_delivery: "2024-01-22",
      items: [
        { name: "Salmon Fillets", quantity: 2, price: 15.99 },
        { name: "Mixed Vegetables", quantity: 3, price: 4.50 }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track your grocery orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              When you place your first grocery order, it will appear here.
            </p>
            <Button>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.id.slice(-3)}
                      <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Ordered on {formatDate(order.created_at)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{formatCurrency(order.total_amount)}</div>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="text-sm text-muted-foreground">
                        Est. delivery: {formatDate(order.estimated_delivery)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">Items:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                
                {order.status === 'shipped' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Your order is on the way!</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Track your delivery for estimated arrival on {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;