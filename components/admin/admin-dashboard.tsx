import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./user-list";
import { OrdersList } from "./order-list";
import { DiscountsManager } from "./discount-manager";
export type User = {
  role: string;
  email: string;
  clerkId: string;
  firstName: string;
  lastName: string;
};

// Product Type
type Product = {
  name: string;
  price: number;
};

// Order Item Type
type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
};

// User Type
type User1 = {
  firstName: string;
  lastName: string;
};

// Order Type
export type Order = {
  id: string;
  userId: string;
  user: User1;
  orderItems: OrderItem[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELED"; // Enum for order statuses
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
};
export function AdminDashboard({
  users,
  orders,
}: {
  users: User[];
  orders: Order[];
}) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersList users={users} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersList orders={orders} />
        </TabsContent>
        <TabsContent value="discounts">
          <DiscountsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
