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
import { Order } from "../admin/admin-dashboard";
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

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { userId } = useAuth();
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) throw Error;
      const orders = await getAllSingleUserOrders({ userId });
      setOrders(orders.data ? orders.data : []);
    };
    fetchOrders();
  });
  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders List</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-4 py-1">
            Customer View
          </Badge>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.id}</TableCell>
              <TableCell>{order.orderItems[0].product.name}</TableCell>
              <TableCell>
                {order.user.firstName + " " + order.user.lastName}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(
                    order.status === "PROCESSING"
                      ? OrderStatus.Processing
                      : order.status === OrderStatus.Shipping
                      ? OrderStatus.Shipping
                      : OrderStatus.Shipped
                  )}
                >
                  {order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
