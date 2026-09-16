"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { removeFromCartAction } from "@/server/actions/cart";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/providers/toast-provider";

type CartItem = {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  price: string;
  discountPrice: string | null;
  instructorName: string;
};

export function CartList({ items }: { items: CartItem[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  const total = items.reduce((sum, i) => sum + Number(i.discountPrice ?? i.price), 0);

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeFromCartAction(id);
      push("Removed from cart", "info");
      router.refresh();
    });
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Browse our catalog and add courses you'd like to enroll in."
        action={<LinkButton href="/#courses">Browse courses</LinkButton>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <Link href={`/courses/${item.slug}`} className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/courses/${item.slug}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">by {item.instructorName}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{formatCurrency(item.discountPrice ?? item.price)}</span>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-medium text-slate-500">Order summary</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal ({items.length} courses)</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="my-4 h-px bg-slate-100" />
        <div className="flex items-center justify-between text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button className="mt-5 w-full" size="lg" onClick={() => router.push("/checkout")}>
          Proceed to checkout
        </Button>
      </div>
    </div>
  );
}
