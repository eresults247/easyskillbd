"use server";

import { db } from "@/db";
import { users, courses, orders, enrollments, orderItems } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserStatusAction(userId: string, status: "active" | "pending" | "suspended") {
  await requireRole(["admin"]);
  await db.update(users).set({ status }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function updateUserRoleAction(userId: string, role: "student" | "instructor" | "admin") {
  await requireRole(["admin"]);
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function updateCourseStatusAction(courseId: string, status: "draft" | "pending" | "published" | "rejected") {
  await requireRole(["admin"]);
  await db.update(courses).set({ status, updatedAt: new Date() }).where(eq(courses.id, courseId));
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function verifyOrderAction(orderId: string) {
  await requireRole(["admin"]);
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order || order.status !== "pending") return;

  await db.update(orders).set({ status: "verified", verifiedAt: new Date() }).where(eq(orders.id, orderId));

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    const alreadyEnrolled = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, item.courseId));
    const hasEnrollment = alreadyEnrolled.some((e) => e.studentId === order.userId);
    if (!hasEnrollment) {
      await db.insert(enrollments).values({ studentId: order.userId, courseId: item.courseId });
    }
  }

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
}

export async function rejectOrderAction(orderId: string) {
  await requireRole(["admin"]);
  await db.update(orders).set({ status: "rejected" }).where(eq(orders.id, orderId));
  revalidatePath("/admin/payments");
}
