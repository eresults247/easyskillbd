import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCartItemsForUser } from "@/server/queries";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartList } from "@/components/cart/cart-list";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/cart");

  const items = await getCartItemsForUser(session.userId);
  const dashboardHref = session.role === "admin" ? "/admin" : session.role === "instructor" ? "/instructor" : "/dashboard";

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader isAuthenticated dashboardHref={dashboardHref} cartCount={items.length} />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Your cart</h1>
        <p className="mt-1 text-sm text-slate-500">Review your selected courses before checkout.</p>
        <div className="mt-8">
          <CartList
            items={items.map((i) => ({
              ...i,
              price: String(i.price),
              discountPrice: i.discountPrice ? String(i.discountPrice) : null,
            }))}
          />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
