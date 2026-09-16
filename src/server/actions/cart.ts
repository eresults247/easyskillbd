"use server";

import { db } from "@/db";
import { cartItems, courses, enrollments, orderItems, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addToCartAction(courseId: string) {
  const user = await requireUser();
  const [alreadyEnrolled] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, user.id), eq(enrollments.courseId, courseId)));
  if (alreadyEnrolled) return { error: "Already enrolled in this course." };

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.courseId, courseId)));
  if (existing) return { ok: true };

  await db.insert(cartItems).values({ userId: user.id, courseId });
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeFromCartAction(cartItemId: string) {
  const user = await requireUser();
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, user.id)));
  revalidatePath("/cart");
}

export async function submitBkashPaymentAction(formData: FormData) {
  const user = await requireUser();
  const bkashNumber = String(formData.get("bkashNumber") || "").trim();
  const transactionId = String(formData.get("transactionId") || "").trim();

  if (!bkashNumber || !transactionId) {
    return { error: "Please provide your bKash number and transaction ID." };
  }

  const items = await db
    .select({ courseId: cartItems.courseId, price: courses.price, discountPrice: courses.discountPrice })
    .from(cartItems)
    .innerJoin(courses, eq(cartItems.courseId, courses.id))
    .where(eq(cartItems.userId, user.id));

  if (!items.length) return { error: "Your cart is empty." };

  const total = items.reduce((sum, i) => sum + Number(i.discountPrice ?? i.price), 0);

  const [order] = await db
    .insert(orders)
    .values({
      userId: user.id,
      totalAmount: String(total),
      paymentMethod: "bkash",
      bkashNumber,
      transactionId,
      status: "pending",
    })
    .returning();

  await db.insert(orderItems).values(
    items.map((i) => ({ orderId: order.id, courseId: i.courseId, price: String(i.discountPrice ?? i.price) })),
  );

  await db.delete(cartItems).where(eq(cartItems.userId, user.id));

  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, orderId: order.id };
}

export async function enrollFreeCourseAction(courseId: string) {
  const user = await requireUser();
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  if (!course) return { error: "Course not found" };
  if (Number(course.price) > 0) return { error: "This course is not free." };

  const [existing] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, user.id), eq(enrollments.courseId, courseId)));
  if (existing) return { ok: true };

  await db.insert(enrollments).values({ studentId: user.id, courseId });
  revalidatePath("/dashboard");
  return { ok: true };
}
