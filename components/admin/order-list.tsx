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
import { Loader2, CheckCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  updateOrderStatus,
  updatePaymentStatus,
} from "@/lib/actions/product/orders/actions";

/**
 * OrdersList Component
 *
 * This component displays a list of orders and provides functionality to manage them.
 * It allows administrators to view order details, update order statuses, and payment statuses.
 *
 * Features:
 * - Display orders in a table format
 * - Update order status (Processing, Shipping, Shipped)
 * - Update payment status (Pending, Paid, Failed)
 * - View detailed information for each order
 * - Error handling with toast notifications
 *
 * @param {Object} props - The component props
 * @param {Order[]} props.ordersData - An array of Order objects to be displayed
 *
 * @returns {JSX.Element} The rendered OrdersList component
 */

enum OrderStatus {
  Processing = "PROCESSING",
  Shipping = "SHIPPING",
  Shipped = "SHIPPED",
}

export enum PaymentStatus {
  Pending = "PENDING",
  Paid = "PAID",
  Failed = "FAILED",
}

enum PaymentMethod {
  CashOnDelivery = "CASH_ON_DELIVERY",
  Stripe = "STRIPE",
}

export interface Order {
  id: string;
  userId: string;
  paymentAddressId: string;
  status: OrderStatus;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  user: { firstName: string; lastName: string };
  orderItems: Array<{ product: { name: string } }>;
  paymentAddress: {
    name: string;
    address: string;
    countryName: string;
    postalCode: string;
  };
}

const getStatusColor = (status: OrderStatus | PaymentStatus) => {
  switch (status) {
    case OrderStatus.Processing:
    case PaymentStatus.Pending:
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case OrderStatus.Shipping:
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    case OrderStatus.Shipped:
    case PaymentStatus.Paid:
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case PaymentStatus.Failed:
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
  }
};

export function OrdersList({ ordersData }: { ordersData: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [orders, setOrders] = useState<Order[]>(ordersData);
  const [pendingStatus, setPendingStatus] = useState<
    OrderStatus | PaymentStatus | null
  >(null);
  const [updateType, setUpdateType] = useState<"order" | "payment" | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();

  /**
   * Handles the initiation of a status update for an order
   *
   * @param {string} id - The ID of the order to update
   * @param {OrderStatus | PaymentStatus} newStatus - The new status to set
   * @param {"order" | "payment"} type - The type of status update (order or payment)
   */
  const handleStatusUpdate = async (
    id: string,
    newStatus: OrderStatus | PaymentStatus,
    type: "order" | "payment"
  ) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    setSelectedOrder(order);
    setPendingStatus(newStatus);
    setUpdateType(type);
    setShowDialog(true);
  };

  /**
   * Confirms and processes the status update for an order
   * Displays success or error messages using toast notifications
   */
  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !pendingStatus || !updateType) return;

    setIsUpdating(true);

    try {
      let result;
      if (updateType === "order") {
        result = await updateOrderStatus(
          selectedOrder.id,
          pendingStatus as OrderStatus
        );
      } else {
        result = await updatePaymentStatus(
          selectedOrder.id,
          pendingStatus as PaymentStatus
        );
      }

      if (result.success) {
        setOrders(
          orders.map((order) =>
            order.id === selectedOrder.id
              ? {
                  ...order,
                  [updateType === "order" ? "status" : "paymentStatus"]:
                    pendingStatus,
                }
              : order
          )
        );

        toast({
          title: `${
            updateType === "order" ? "Order" : "Payment"
          } Status Updated`,
          description: `Order #${selectedOrder.id} ${
            updateType === "order" ? "status" : "payment status"
          } changed to ${pendingStatus}`,
          duration: 3000,
        });
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
      setShowDialog(false);
      setSelectedOrder(null);
      setPendingStatus(null);
      setUpdateType(null);
    }
  };

  /**
   * Opens the order details dialog for a specific order
   *
   * @param {Order} order - The order object to display details for
   */
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
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
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Order Status</TableHead>
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
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(order.paymentStatus)}
                >
                  {order.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(order.status)}
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value: OrderStatus) =>
                      handleStatusUpdate(order.id, value, "order")
                    }
                    defaultValue={order.status}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Order Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrderStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value: PaymentStatus) =>
                      handleStatusUpdate(order.id, value, "payment")
                    }
                    defaultValue={order.paymentStatus}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
              Are you sure you want to update order #{selectedOrder?.id}{" "}
              {updateType} status to {pendingStatus}?
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

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Order ID:</span>
                <span className="col-span-3">#{selectedOrder.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Customer:</span>
                <span className="col-span-3">
                  {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Total Price:</span>
                <span className="col-span-3">
                  ${selectedOrder.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Payment Method:</span>
                <span className="col-span-3">
                  {selectedOrder.paymentMethod}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Payment Status:</span>
                <span className="col-span-3">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Order Status:</span>
                <span className="col-span-3">{selectedOrder.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Shipping Address:</span>
                <span className="col-span-3">
                  {selectedOrder.paymentAddress.name}
                  <br />
                  {selectedOrder.paymentAddress.address}
                  <br />
                  {selectedOrder.paymentAddress.countryName},{" "}
                  {selectedOrder.paymentAddress.postalCode}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
