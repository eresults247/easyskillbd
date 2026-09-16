import { getCurrentUser } from "@/lib/auth";
import { getStudentEnrollments } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  const enrollments = await getStudentEnrollments(user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <p className="mt-1 text-sm text-slate-500">All the courses you&apos;re enrolled in.</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses"
          description="Browse our catalog and start learning something new today."
          action={<LinkButton href="/#courses">Browse courses</LinkButton>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Link
              key={e.enrollmentId}
              href={`/dashboard/courses/${e.courseId}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative h-36 w-full bg-slate-100">
                {e.courseThumbnail && <Image src={e.courseThumbnail} alt={e.courseTitle} fill className="object-cover" />}
                <Badge variant={e.status === "completed" ? "success" : "indigo"} className="absolute left-3 top-3">
                  {e.status}
                </Badge>
              </div>
              <div className="p-4">
                <p className="line-clamp-1 font-semibold text-slate-800">{e.courseTitle}</p>
                <p className="text-xs text-slate-500">by {e.instructorName}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Progress value={e.progressPercent} />
                  <span className="text-xs font-medium text-slate-500">{e.progressPercent}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
