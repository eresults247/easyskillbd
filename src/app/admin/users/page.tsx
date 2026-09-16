import { getAllUsersForAdmin } from "@/server/queries";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">Approve instructors, manage student accounts and update roles.</p>
      </div>
      <UsersTable
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toString() }))}
      />
    </div>
  );
}
