"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllSingleUserOrders } from "@/lib/actions/product/orders/actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

export function Loader({ className }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}

enum OrderStatus {
  Processing = "PROCESSING",
  Shipping = "SHIPPING",
  Shipped = "SHIPPED",
}
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Processing:
      return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400";
    case OrderStatus.Shipping:
      return "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400";
    case OrderStatus.Shipped:
      return "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400";
  }
};
type SingleUserOrder = {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
  orderItems: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    product: {
      name: string;
      price: number;
    };
  }[];
};

export function OrdersList() {
  const [orders, setOrders] = useState<SingleUserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setError("User ID not found");
        setIsLoading(false);
        return;
      }

      try {
        const ordersResponse = await getAllSingleUserOrders({ userId });
        setOrders(ordersResponse.data || []);
      } catch (err) {
        if (err) {
          setError("Failed to fetch orders. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-12 py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-xl text-muted-foreground">Track and manage your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-secondary/30 rounded-[2rem] p-12 text-center space-y-4 border-2 border-dashed">
          <h2 className="text-2xl font-bold">No orders found</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            It looks like you haven&apos;t placed any orders yet. Start exploring our latest products!
          </p>
          <Button asChild className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary/20 rounded-[2rem] overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent bg-secondary/50">
                <TableHead className="py-6 px-8 font-bold uppercase tracking-widest text-[10px]">Order ID</TableHead>
                <TableHead className="py-6 px-8 font-bold uppercase tracking-widest text-[10px]">Product</TableHead>
                <TableHead className="py-6 px-8 font-bold uppercase tracking-widest text-[10px]">Total Price</TableHead>
                <TableHead className="py-6 px-8 font-bold uppercase tracking-widest text-[10px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <TableCell className="py-6 px-8 font-mono text-xs text-muted-foreground">
                    #{order.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="py-6 px-8">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{order.orderItems[0].product.name}</span>
                      {order.orderItems.length > 1 && (
                        <span className="text-xs text-muted-foreground">+{order.orderItems.length - 1} more items</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 px-8 font-bold">
                    ${order.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="py-6 px-8 text-right">
                    <Badge
                      className={`rounded-full px-4 py-1 text-[10px] font-bold border-none ${getStatusColor(
                        order.status === "PROCESSING"
                          ? OrderStatus.Processing
                          : order.status === OrderStatus.Shipping
                          ? OrderStatus.Shipping
                          : OrderStatus.Shipped
                      )}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
