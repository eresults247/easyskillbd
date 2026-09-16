"use server";

import { db } from "@/db";
import { courses, modules, lessons, quizzes, quizQuestions, assignments } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCourseAction(formData: FormData) {
  const instructor = await requireRole(["instructor", "admin"]);
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const level = String(formData.get("level") || "beginner") as "beginner" | "intermediate" | "advanced";
  const price = String(formData.get("price") || "0");
  const discountPrice = String(formData.get("discountPrice") || "");
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "");
  const promoVideoUrl = String(formData.get("promoVideoUrl") || "");

  if (!title) throw new Error("Title is required");

  let slug = slugify(title);
  const [existing] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug));
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const [course] = await db
    .insert(courses)
    .values({
      title,
      subtitle,
      description,
      category,
      level,
      price,
      discountPrice: discountPrice || null,
      thumbnailUrl: thumbnailUrl || null,
      promoVideoUrl: promoVideoUrl || null,
      slug,
      instructorId: instructor.id,
      status: "draft",
    })
    .returning();

  revalidatePath("/instructor/courses");
  return course;
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);

  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "General").trim();
  const level = String(formData.get("level") || "beginner") as "beginner" | "intermediate" | "advanced";
  const price = String(formData.get("price") || "0");
  const discountPrice = String(formData.get("discountPrice") || "");
  const thumbnailUrl = String(formData.get("thumbnailUrl") || "");
  const promoVideoUrl = String(formData.get("promoVideoUrl") || "");

  await db
    .update(courses)
    .set({
      title,
      subtitle,
      description,
      category,
      level,
      price,
      discountPrice: discountPrice || null,
      thumbnailUrl: thumbnailUrl || null,
      promoVideoUrl: promoVideoUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));

  revalidatePath(`/instructor/courses/${courseId}`);
}

async function assertOwnership(courseId: string, userId: string, role: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) throw new Error("Course not found");
  if (role !== "admin" && course.instructorId !== userId) throw new Error("FORBIDDEN");
  return course;
}

export async function submitCourseForReviewAction(courseId: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.update(courses).set({ status: "pending", updatedAt: new Date() }).where(eq(courses.id, courseId));
  revalidatePath("/instructor/courses");
  revalidatePath("/admin/courses");
}

export async function deleteCourseAction(courseId: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.delete(courses).where(eq(courses.id, courseId));
  revalidatePath("/instructor/courses");
}

export async function createModuleAction(courseId: string, title: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  const existing = await db.select().from(modules).where(eq(modules.courseId, courseId));
  const [mod] = await db
    .insert(modules)
    .values({ courseId, title, position: existing.length })
    .returning();
  revalidatePath(`/instructor/courses/${courseId}`);
  return mod;
}

export async function deleteModuleAction(moduleId: string, courseId: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.delete(modules).where(eq(modules.id, moduleId));
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function reorderModulesAction(courseId: string, orderedIds: string[]) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await Promise.all(
    orderedIds.map((id, index) => db.update(modules).set({ position: index }).where(eq(modules.id, id))),
  );
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function createLessonAction(params: {
  moduleId: string;
  courseId: string;
  title: string;
  videoUrl?: string;
  contentHtml?: string;
  durationMinutes?: number;
  isFreePreview?: boolean;
}) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(params.courseId, instructor.id, instructor.role);
  const existing = await db.select().from(lessons).where(eq(lessons.moduleId, params.moduleId));
  const [lesson] = await db
    .insert(lessons)
    .values({
      moduleId: params.moduleId,
      title: params.title,
      videoUrl: params.videoUrl || null,
      contentHtml: params.contentHtml || null,
      durationMinutes: params.durationMinutes ?? 5,
      isFreePreview: params.isFreePreview ?? false,
      position: existing.length,
    })
    .returning();
  revalidatePath(`/instructor/courses/${params.courseId}`);
  return lesson;
}

export async function updateLessonAction(
  lessonId: string,
  courseId: string,
  data: Partial<{
    title: string;
    videoUrl: string | null;
    contentHtml: string | null;
    durationMinutes: number;
    isFreePreview: boolean;
  }>,
) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.update(lessons).set(data).where(eq(lessons.id, lessonId));
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function deleteLessonAction(lessonId: string, courseId: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function reorderLessonsAction(courseId: string, orderedIds: string[]) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await Promise.all(
    orderedIds.map((id, index) => db.update(lessons).set({ position: index }).where(eq(lessons.id, id))),
  );
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function createQuizAction(params: { moduleId: string; courseId: string; title: string; passingScore: number }) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(params.courseId, instructor.id, instructor.role);
  const [quiz] = await db
    .insert(quizzes)
    .values({ moduleId: params.moduleId, title: params.title, passingScore: params.passingScore })
    .returning();
  revalidatePath(`/instructor/courses/${params.courseId}`);
  return quiz;
}

export async function addQuizQuestionAction(params: {
  quizId: string;
  courseId: string;
  question: string;
  options: string[];
  correctIndex: number;
}) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(params.courseId, instructor.id, instructor.role);
  const existing = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, params.quizId));
  await db.insert(quizQuestions).values({
    quizId: params.quizId,
    question: params.question,
    options: params.options,
    correctIndex: params.correctIndex,
    position: existing.length,
  });
  revalidatePath(`/instructor/courses/${params.courseId}`);
}

export async function createAssignmentAction(params: {
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  maxScore?: number;
}) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(params.courseId, instructor.id, instructor.role);
  await db.insert(assignments).values({
    courseId: params.courseId,
    title: params.title,
    description: params.description,
    dueDate: params.dueDate ? new Date(params.dueDate) : null,
    maxScore: params.maxScore ?? 100,
  });
  revalidatePath(`/instructor/courses/${params.courseId}`);
  revalidatePath("/instructor/submissions");
}

export async function deleteAssignmentAction(assignmentId: string, courseId: string) {
  const instructor = await requireRole(["instructor", "admin"]);
  await assertOwnership(courseId, instructor.id, instructor.role);
  await db.delete(assignments).where(and(eq(assignments.id, assignmentId), eq(assignments.courseId, courseId)));
  revalidatePath(`/instructor/courses/${courseId}`);
}
