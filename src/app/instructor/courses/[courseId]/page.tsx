import { db } from "@/db";
import { courses, modules, lessons, quizzes, quizQuestions, assignments } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CurriculumBuilder } from "@/components/instructor/curriculum-builder";
import { CourseSettingsForm } from "@/components/instructor/course-settings-form";
import { AssignmentsManager } from "@/components/instructor/assignments-manager";
import { CoursePublishPanel } from "@/components/instructor/course-publish-panel";

export const dynamic = "force-dynamic";

export default async function CourseBuilderPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  if (!course) notFound();
  if (user!.role !== "admin" && course.instructorId !== user!.id) redirect("/instructor/courses");

  const moduleRows = await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.position);
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(lessons.position)
    : [];
  const quizRows = moduleIds.length ? await db.select().from(quizzes).where(inArray(quizzes.moduleId, moduleIds)) : [];
  const quizIds = quizRows.map((q) => q.id);
  const questionRows = quizIds.length
    ? await db.select().from(quizQuestions).where(inArray(quizQuestions.quizId, quizIds)).orderBy(quizQuestions.position)
    : [];
  const assignmentRows = await db.select().from(assignments).where(eq(assignments.courseId, courseId));

  const modulesData = moduleRows.map((m) => ({
    ...m,
    lessons: lessonRows.filter((l) => l.moduleId === m.id),
    quiz: quizRows
      .filter((q) => q.moduleId === m.id)
      .map((q) => ({ ...q, questions: questionRows.filter((qq) => qq.quizId === q.id) }))[0] ?? null,
  }));

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Course Builder</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
        </div>
        <CoursePublishPanel courseId={course.id} status={course.status} />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Curriculum</h2>
            <CurriculumBuilder courseId={courseId} modules={modulesData} />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Assignments</h2>
            <AssignmentsManager courseId={courseId} assignments={assignmentRows.map((a) => ({ ...a, dueDate: a.dueDate ? a.dueDate.toISOString().slice(0, 10) : null }))} />
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Course settings</h2>
          <CourseSettingsForm
            course={{
              id: course.id,
              title: course.title,
              subtitle: course.subtitle ?? "",
              description: course.description ?? "",
              category: course.category,
              level: course.level,
              price: course.price,
              discountPrice: course.discountPrice ?? "",
              thumbnailUrl: course.thumbnailUrl ?? "",
              promoVideoUrl: course.promoVideoUrl ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
