import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllOrders } from "@/lib/actions/product/orders/actions";
import { getAllUsers } from "@/lib/actions/user/actions";
export default async function AdminPage() {
  const users = await getAllUsers();
  const orders = await getAllOrders();

  return (
    <main>
      <AdminDashboard
        users={users.data!}
        orders={orders.data ? orders.data : []}
      />
    </main>
  );
}
