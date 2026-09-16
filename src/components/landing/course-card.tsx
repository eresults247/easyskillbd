"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock, ShoppingCart, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useState, useTransition } from "react";
import { addToCartAction } from "@/server/actions/cart";
import { useToast } from "@/components/providers/toast-provider";
import { useRouter } from "next/navigation";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  level: string;
  price: string;
  discountPrice?: string | null;
  instructorName: string;
  rating: string;
  reviewCount: number;
  enrollCount: number;
};

export function CourseCard({ course, isAuthenticated }: { course: CourseCardData; isAuthenticated: boolean }) {
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  const finalPrice = course.discountPrice ?? course.price;
  const hasDiscount = course.discountPrice && Number(course.discountPrice) < Number(course.price);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/sign-in?next=/cart");
      return;
    }
    setAdded(true);
    startTransition(async () => {
      const res = await addToCartAction(course.id);
      if (res?.error) {
        push(res.error, "error");
        setAdded(false);
      } else {
        push("Added to cart", "success");
      }
    });
  }

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <span className="text-sm font-semibold">{course.title}</span>
          </div>
        )}
        <Badge variant="indigo" className="absolute left-3 top-3 backdrop-blur">
          {course.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 min-h-[2.7em] font-semibold text-slate-900">{course.title}</p>
        <p className="mt-1 text-xs text-slate-500">by {course.instructorName}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1 font-medium text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {course.rating}
            <span className="text-slate-400">({course.reviewCount})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {course.enrollCount}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Clock className="h-3.5 w-3.5" /> {course.level}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {Number(finalPrice) === 0 ? "Free" : formatCurrency(finalPrice)}
            </span>
            {hasDiscount && <span className="text-xs text-slate-400 line-through">{formatCurrency(course.price)}</span>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={pending || added}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white disabled:opacity-70"
            title="Add to cart"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </Link>
  );
}
