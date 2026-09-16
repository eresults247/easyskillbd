import { getCurrentUser } from "@/lib/auth";
import { getInstructorCourses } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusVariant = {
  draft: "default",
  pending: "warning",
  published: "success",
  rejected: "danger",
} as const;

export default async function InstructorCoursesPage() {
  const user = await getCurrentUser();
  const courses = await getInstructorCourses(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your curriculum, pricing and publishing status.</p>
        </div>
        <LinkButton href="/instructor/courses/new">
          <PlusCircle className="h-4 w-4" /> New course
        </LinkButton>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Start building your first course with our curriculum builder."
          action={<LinkButton href="/instructor/courses/new">Create a course</LinkButton>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/instructor/courses/${c.id}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative h-36 w-full bg-slate-100">
                {c.thumbnailUrl && <Image src={c.thumbnailUrl} alt={c.title} fill className="object-cover" />}
                <Badge variant={statusVariant[c.status]} className="absolute left-3 top-3 capitalize">
                  {c.status}
                </Badge>
              </div>
              <div className="p-4">
                <p className="line-clamp-1 font-semibold text-slate-800">{c.title}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.enrollCount} students</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(c.price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
