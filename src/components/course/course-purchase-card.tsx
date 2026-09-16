"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, Infinity as InfinityIcon, Smartphone, FileBadge } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { addToCartAction, enrollFreeCourseAction } from "@/server/actions/cart";
import { useToast } from "@/components/providers/toast-provider";

export function CoursePurchaseCard({
  course,
  isAuthenticated,
  alreadyInCart,
  alreadyEnrolled,
}: {
  course: { id: string; price: string; discountPrice: string | null; thumbnailUrl?: string | null };
  isAuthenticated: boolean;
  alreadyInCart: boolean;
  alreadyEnrolled: boolean;
}) {
  const [inCart, setInCart] = useState(alreadyInCart);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  const isFree = Number(course.price) === 0;
  const finalPrice = course.discountPrice ?? course.price;

  function handleAddToCart() {
    if (!isAuthenticated) return router.push("/sign-in?next=/cart");
    setInCart(true);
    startTransition(async () => {
      const res = await addToCartAction(course.id);
      if (res?.error) {
        push(res.error, "error");
        setInCart(false);
      } else {
        push("Added to cart", "success");
      }
    });
  }

  function handleBuyNow() {
    if (!isAuthenticated) return router.push("/sign-in?next=/checkout");
    startTransition(async () => {
      await addToCartAction(course.id);
      router.push("/checkout");
    });
  }

  function handleFreeEnroll() {
    if (!isAuthenticated) return router.push("/sign-in?next=/dashboard");
    startTransition(async () => {
      const res = await enrollFreeCourseAction(course.id);
      if (res?.error) push(res.error, "error");
      else {
        push("Enrolled! Redirecting to your dashboard...", "success");
        router.push("/dashboard");
      }
    });
  }

  return (
    <Card className="sticky top-24 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{isFree ? "Free" : formatCurrency(finalPrice)}</span>
          {!isFree && course.discountPrice && (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(course.price)}</span>
          )}
        </div>

        {alreadyEnrolled ? (
          <Button className="mt-5 w-full" size="lg" variant="secondary" onClick={() => router.push("/dashboard")}>
            Go to course
          </Button>
        ) : isFree ? (
          <Button className="mt-5 w-full" size="lg" onClick={handleFreeEnroll} disabled={pending}>
            Enroll now — it&apos;s free
          </Button>
        ) : (
          <div className="mt-5 space-y-2.5">
            <Button className="w-full" size="lg" onClick={handleBuyNow} disabled={pending}>
              <Zap className="h-4 w-4" /> Buy now
            </Button>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handleAddToCart}
              disabled={pending || inCart}
            >
              {inCart ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {inCart ? "Added to cart" : "Add to cart"}
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-600">
          <p className="flex items-center gap-2"><InfinityIcon className="h-4 w-4 text-indigo-600" /> Lifetime access</p>
          <p className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-indigo-600" /> Certificate of completion</p>
          <p className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-indigo-600" /> Access on mobile & desktop</p>
        </div>

        {!isFree && (
          <div className="mt-5 rounded-xl bg-pink-50 p-3 text-xs text-pink-700">
            Secure manual payment via <strong>bKash</strong> — verified within a few hours of checkout.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
