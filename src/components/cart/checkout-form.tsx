"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, CheckCircle2, Copy, ShieldCheck } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { submitBkashPaymentAction } from "@/server/actions/cart";
import { useToast } from "@/components/providers/toast-provider";

const MERCHANT_NUMBER = "01711-223344";

export function CheckoutForm({ total }: { total: number }) {
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { push } = useToast();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitBkashPaymentAction(formData);
      if (res?.error) {
        push(res.error, "error");
      } else {
        setSubmitted(true);
        push("Payment submitted for verification!", "success");
      }
    });
  }

  function copyNumber() {
    navigator.clipboard?.writeText(MERCHANT_NUMBER);
    push("bKash number copied", "info");
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-xl font-bold text-emerald-800">Payment submitted!</h2>
        <p className="mt-2 text-sm text-emerald-700">
          Your bKash payment is pending verification by our team. You&apos;ll be enrolled automatically once confirmed
          (usually within a few hours).
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5">
        <div className="flex items-center gap-2 text-pink-700">
          <Smartphone className="h-5 w-5" />
          <p className="font-semibold">Pay with bKash (Manual)</p>
        </div>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-pink-800">
          <li>
            Open your bKash app and send <strong>{formatCurrency(total)}</strong> to the merchant number below using{" "}
            <strong>&quot;Send Money&quot;</strong>.
          </li>
          <li>Copy the Transaction ID (TrxID) from the confirmation SMS.</li>
          <li>Enter your bKash number and the Transaction ID below, then submit.</li>
        </ol>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">Merchant bKash Number</p>
            <p className="text-lg font-bold tracking-wide text-slate-900">{MERCHANT_NUMBER}</p>
          </div>
          <button onClick={copyNumber} className="flex items-center gap-1 rounded-lg bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-700">
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <Label htmlFor="bkashNumber">Your bKash Number</Label>
          <Input id="bkashNumber" name="bkashNumber" placeholder="01XXXXXXXXX" required />
        </div>
        <div>
          <Label htmlFor="transactionId">Transaction ID (TrxID)</Label>
          <Input id="transactionId" name="transactionId" placeholder="e.g. 9F3K7L2QRT" required />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" /> Your payment will be verified manually by our admin team.
        </p>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : `Confirm payment of ${formatCurrency(total)}`}
        </Button>
      </form>
    </div>
  );
}
