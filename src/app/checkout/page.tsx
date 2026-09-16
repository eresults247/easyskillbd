import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCartItemsForUser } from "@/server/queries";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/checkout");

  const items = await getCartItemsForUser(session.userId);
  if (!items.length) redirect("/cart");

  const total = items.reduce((sum, i) => sum + Number(i.discountPrice ?? i.price), 0);
  const dashboardHref = session.role === "admin" ? "/admin" : session.role === "instructor" ? "/instructor" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader isAuthenticated dashboardHref={dashboardHref} cartCount={items.length} />
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-1 text-sm text-slate-500">Pay securely with bKash and get enrolled after verification.</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CheckoutForm total={total} />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">Order items</p>
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {i.thumbnailUrl && <Image src={i.thumbnailUrl} alt={i.title} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-slate-800">{i.title}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{formatCurrency(i.discountPrice ?? i.price)}</span>
                  </div>
                ))}
              </div>
              <div className="my-4 h-px bg-slate-100" />
              <div className="flex items-center justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
