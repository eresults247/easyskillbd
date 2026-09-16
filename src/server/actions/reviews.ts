"use server";

import { db } from "@/db";
import { reviews, enrollments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(courseId: string, rating: number, comment: string) {
  const user = await requireUser();
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, user.id), eq(enrollments.courseId, courseId)));
  if (!enrollment) return { error: "Enroll in the course before leaving a review." };

  const [existing] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.courseId, courseId), eq(reviews.studentId, user.id)));

  if (existing) {
    await db.update(reviews).set({ rating, comment }).where(eq(reviews.id, existing.id));
  } else {
    await db.insert(reviews).values({ courseId, studentId: user.id, rating, comment });
  }

  revalidatePath(`/courses`);
  return { ok: true };
}
