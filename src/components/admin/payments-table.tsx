"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { verifyOrderAction, rejectOrderAction } from "@/server/actions/admin";
import { useToast } from "@/components/providers/toast-provider";
import { Check, X, Smartphone } from "lucide-react";

type OrderRow = {
  id: string;
  totalAmount: string;
  status: "pending" | "verified" | "rejected";
  paymentMethod: string;
  bkashNumber: string | null;
  transactionId: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
  items: string[];
};

const statusColor = { pending: "warning", verified: "success", rejected: "danger" } as const;

export function PaymentsTable({ orders }: { orders: OrderRow[] }) {
  const [rows, setRows] = useState(orders);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleVerify(id: string) {
    setRows((prev) => prev.map((o) => (o.id === id ? { ...o, status: "verified" } : o)));
    startTransition(async () => {
      await verifyOrderAction(id);
      push("Payment verified & student enrolled", "success");
    });
  }

  function handleReject(id: string) {
    setRows((prev) => prev.map((o) => (o.id === id ? { ...o, status: "rejected" } : o)));
    startTransition(async () => {
      await rejectOrderAction(id);
      push("Payment rejected", "info");
    });
  }

  return (
    <div className="space-y-4">
      {rows.map((o) => (
        <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-semibold text-slate-800">
                <Smartphone className="h-4 w-4 text-pink-600" /> {formatCurrency(o.totalAmount)} via {o.paymentMethod}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {o.userName} ({o.userEmail})
              </p>
              <p className="mt-1 text-xs text-slate-400">Items: {o.items.join(", ")}</p>
              <p className="mt-1 text-xs text-slate-400">
                bKash number: {o.bkashNumber} · TrxID: <span className="font-mono">{o.transactionId}</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Submitted {formatDate(o.createdAt)}</p>
            </div>
            <Badge variant={statusColor[o.status]} className="capitalize">{o.status}</Badge>
          </div>
          {o.status === "pending" && (
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => handleVerify(o.id)} disabled={pending}>
                <Check className="h-3.5 w-3.5" /> Verify & enroll
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleReject(o.id)} disabled={pending}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
      {rows.length === 0 && <p className="text-sm text-slate-400">No payment submissions yet.</p>}
    </div>
  );
}
