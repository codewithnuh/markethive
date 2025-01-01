import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllOrders } from "@/lib/actions/product/orders/actions";
import { getAllUsers } from "@/lib/actions/user/actions";
export default async function AdminPage() {
  const users = await getAllUsers();
  const orders = await getAllOrders();
  orders.data?.flatMap((item) =>
    console.log(item.orderItems.map((i) => i.product))
  );
  console.log(orders.data);

  return (
    <main>
      <AdminDashboard users={users.data!} orders={orders.data!} />
    </main>
  );
}
