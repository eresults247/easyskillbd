import { getOrdersForAdmin } from "@/server/queries";
import { PaymentsTable } from "@/components/admin/payments-table";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const orders = await getOrdersForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payments & Payouts</h1>
        <p className="mt-1 text-sm text-slate-500">Verify manual bKash payments to activate student enrollments.</p>
      </div>
      <PaymentsTable
        orders={orders.map((o) => ({ ...o, totalAmount: String(o.totalAmount), createdAt: o.createdAt.toString() }))}
      />
    </div>
  );
}
