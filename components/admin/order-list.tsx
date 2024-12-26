"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

enum OrderStatus {
  Processing = "Processing",
  Shipping = "Shipping",
  Shipped = "Shipped",
}

type Order = {
  id: string;
  product: string;
  userName: string;
  status: OrderStatus;
};

const initialOrders: Order[] = [
  {
    id: "1",
    product: "Laptop",
    userName: "John Doe",
    status: OrderStatus.Processing,
  },
  {
    id: "2",
    product: "Smartphone",
    userName: "Jane Smith",
    status: OrderStatus.Shipping,
  },
  {
    id: "3",
    product: "Headphones",
    userName: "Bob Johnson",
    status: OrderStatus.Shipped,
  },
];

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const handleStatusUpdate = (id: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Orders List</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.product}</TableCell>
              <TableCell>{order.userName}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value: OrderStatus) =>
                    handleStatusUpdate(order.id, value)
                  }
                  defaultValue={order.status}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
