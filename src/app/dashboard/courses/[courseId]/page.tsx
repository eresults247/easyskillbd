import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseLearnData } from "@/server/queries";

export default async function CourseRedirectPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  const data = await getCourseLearnData(courseId, user!.id);
  if (!data) notFound();

  const firstLesson = data.modules.flatMap((m) => m.lessons)[0];
  if (!firstLesson) notFound();

  redirect(`/dashboard/courses/${courseId}/lesson/${firstLesson.id}`);
}
