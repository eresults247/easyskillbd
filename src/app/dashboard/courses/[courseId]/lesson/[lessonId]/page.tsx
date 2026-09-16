import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourseLearnData, getLessonDiscussions } from "@/server/queries";
import { LessonPlayer } from "@/components/course/lesson-player";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await getCurrentUser();
  const data = await getCourseLearnData(courseId, user!.id);
  if (!data || !data.enrollment) notFound();

  const flatLessons = data.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const currentLesson = flatLessons.find((l) => l.id === lessonId);
  if (!currentLesson) notFound();

  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;

  const currentModule = data.modules.find((m) => m.lessons.some((l) => l.id === lessonId));

  const discussions = await getLessonDiscussions(lessonId);

  return (
    <LessonPlayer
      courseId={courseId}
      courseTitle={data.course.title}
      modules={data.modules}
      lesson={currentLesson}
      quiz={currentModule?.quiz ?? null}
      prevLessonId={prevLesson?.id ?? null}
      nextLessonId={nextLesson?.id ?? null}
      progressPercent={data.enrollment.progressPercent}
      discussions={discussions.map((d) => ({ ...d, createdAt: d.createdAt.toString() }))}
      currentUser={{ id: user!.id, name: user!.name, avatarUrl: user!.avatarUrl }}
    />
  );
}
