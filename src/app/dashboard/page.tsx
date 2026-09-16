import { getCurrentUser } from "@/lib/auth";
import { getStudentEnrollments, getStudentAssignments } from "@/server/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Flame, Trophy, Clock, CalendarClock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const [enrollments, assignments] = await Promise.all([
    getStudentEnrollments(user!.id),
    getStudentAssignments(user!.id),
  ]);

  const activeCourses = enrollments.filter((e) => e.status === "active");
  const completedCourses = enrollments.filter((e) => e.status === "completed");
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length)
    : 0;

  const upcoming = assignments
    .filter((a) => !a.submission && a.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  const stats = [
    { label: "Enrolled courses", value: enrollments.length, icon: BookOpen, color: "bg-indigo-50 text-indigo-600" },
    { label: "In progress", value: activeCourses.length, icon: Flame, color: "bg-amber-50 text-amber-600" },
    { label: "Completed", value: completedCourses.length, icon: Trophy, color: "bg-emerald-50 text-emerald-600" },
    { label: "Avg. progress", value: `${avgProgress}%`, icon: Clock, color: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user!.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your learning today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Continue learning</h2>
            <Link href="/dashboard/courses" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No enrolled courses yet"
              description="Browse our catalog and start learning something new today."
              action={<LinkButton href="/#courses">Browse courses</LinkButton>}
            />
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 4).map((e) => (
                <Link
                  key={e.enrollmentId}
                  href={`/dashboard/courses/${e.courseId}`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {e.courseThumbnail && <Image src={e.courseThumbnail} alt={e.courseTitle} fill className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{e.courseTitle}</p>
                    <p className="text-xs text-slate-500">by {e.instructorName}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={e.progressPercent} className="max-w-[180px]" />
                      <span className="text-xs font-medium text-slate-500">{e.progressPercent}%</span>
                    </div>
                  </div>
                  <Badge variant={e.status === "completed" ? "success" : "indigo"}>{e.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No assignments due" description="You're all caught up!" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.courseTitle}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                      <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(a.dueDate)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
