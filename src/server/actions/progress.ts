"use server";

import { db } from "@/db";
import { lessonProgress, lessons, modules, enrollments, certificates, discussions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function toggleLessonCompleteAction(lessonId: string, courseId: string, completed: boolean) {
  const user = await requireUser();
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, user.id), eq(enrollments.courseId, courseId)));
  if (!enrollment) throw new Error("Not enrolled");

  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.enrollmentId, enrollment.id), eq(lessonProgress.lessonId, lessonId)));

  if (existing) {
    await db
      .update(lessonProgress)
      .set({ completed, completedAt: completed ? new Date() : null })
      .where(eq(lessonProgress.id, existing.id));
  } else {
    await db.insert(lessonProgress).values({
      enrollmentId: enrollment.id,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    });
  }

  const { inArray } = await import("drizzle-orm");
  const allModules = await db.select().from(modules).where(eq(modules.courseId, courseId));
  const moduleIds = allModules.map((m) => m.id);
  const fullLessonList = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds))
    : [];
  const progressRows = await db.select().from(lessonProgress).where(eq(lessonProgress.enrollmentId, enrollment.id));
  const completedCount = progressRows.filter((p) => p.completed).length;
  const total = fullLessonList.length || 1;
  const percent = Math.round((completedCount / total) * 100);

  const isCompleted = percent >= 100;
  await db
    .update(enrollments)
    .set({
      progressPercent: percent,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? new Date() : null,
    })
    .where(eq(enrollments.id, enrollment.id));

  if (isCompleted) {
    const [existingCert] = await db.select().from(certificates).where(eq(certificates.enrollmentId, enrollment.id));
    if (!existingCert) {
      await db.insert(certificates).values({
        enrollmentId: enrollment.id,
        certificateCode: `CERT-${nanoid(10).toUpperCase()}`,
      });
    }
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/certificates");
  return { percent, isCompleted };
}

export async function postDiscussionAction(lessonId: string, message: string, parentId?: string | null) {
  const user = await requireUser();
  if (!message.trim()) throw new Error("Message cannot be empty");
  const [row] = await db
    .insert(discussions)
    .values({ lessonId, userId: user.id, message: message.trim(), parentId: parentId || null })
    .returning();
  return row;
}

export async function submitQuizAttemptAction(quizId: string, answers: number[]) {
  const user = await requireUser();
  const { quizQuestions, quizAttempts } = await import("@/db/schema");
  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  let correct = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) correct += 1;
  });
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  await db.insert(quizAttempts).values({ quizId, studentId: user.id, score, answers });
  return { score, correct, total: questions.length };
}
