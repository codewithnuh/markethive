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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Order } from "./admin-dashboard";
import { updateOrderStatus } from "@/lib/actions/product/orders/actions";

enum OrderStatus {
  Processing = "PROCESSING",
  Shipping = "SHIPPING",
  Shipped = "SHIPPED",
}
// type Order = {
//   id: string;
//   product: string;
//   userName: string;
//   status: OrderStatus;
// };

// const initialOrders: Order[] = [
//   {
//     id: "1",
//     product: "Laptop",
//     userName: "John Doe",
//     status: OrderStatus.Processing,
//   },
//   {
//     id: "2",
//     product: "Smartphone",
//     userName: "Jane Smith",
//     status: OrderStatus.Shipping,
//   },
//   {
//     id: "3",
//     product: "Headphones",
//     userName: "Bob Johnson",
//     status: OrderStatus.Shipped,
//   },
// ];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Processing:
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case OrderStatus.Shipping:
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case OrderStatus.Shipped:
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
  }
};

export function OrdersList({ orders }: { orders: Order[] }) {
  // const [orders, setOrders] = useState<Order[]>(initialOrders);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const { toast } = useToast();

  const handleStatusUpdate = async (id: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    setSelectedOrder(order);
    setPendingStatus(newStatus);
    setShowDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !pendingStatus) return;

    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(selectedOrder.id, pendingStatus);

      if (result.success) {
        // Update the orders in the UI
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id ? result.data : order
          )
        );

        toast({
          title: "Order Updated",
          description: `Order #${selectedOrder.id} status changed to ${pendingStatus}`,
          duration: 3000,
        });
      } else {
        throw new Error(result.error); // Throw error to be caught in the catch block
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } finally {
      setIsUpdating(false);
      setShowDialog(false);
      setSelectedOrder(null);
      setPendingStatus(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders List</h2>
        <Badge variant="outline" className="px-4 py-1">
          Admin View
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value: OrderStatus) =>
                      handleStatusUpdate(order.id, value)
                    }
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="w-[140px]">
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update order #{selectedOrder?.id} status
              to {pendingStatus}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusUpdate}
              disabled={isUpdating}
              className="gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
