"use server";

import { db } from "@/db";
import { assignmentSubmissions } from "@/db/schema";
import { requireUser, requireRole } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitAssignmentAction(assignmentId: string, content: string, fileUrl?: string) {
  const user = await requireUser();
  if (!content.trim()) return { error: "Submission cannot be empty." };

  const [existing] = await db
    .select()
    .from(assignmentSubmissions)
    .where(and(eq(assignmentSubmissions.assignmentId, assignmentId), eq(assignmentSubmissions.studentId, user.id)));

  if (existing) {
    await db
      .update(assignmentSubmissions)
      .set({ content, fileUrl: fileUrl || null, submittedAt: new Date(), grade: null, feedback: null, gradedAt: null })
      .where(eq(assignmentSubmissions.id, existing.id));
  } else {
    await db.insert(assignmentSubmissions).values({
      assignmentId,
      studentId: user.id,
      content,
      fileUrl: fileUrl || null,
    });
  }

  revalidatePath("/dashboard/assignments");
  return { ok: true };
}

export async function gradeSubmissionAction(submissionId: string, grade: number, feedback: string) {
  await requireRole(["instructor", "admin"]);
  await db
    .update(assignmentSubmissions)
    .set({ grade, feedback, gradedAt: new Date() })
    .where(eq(assignmentSubmissions.id, submissionId));
  revalidatePath("/instructor/submissions");
}
