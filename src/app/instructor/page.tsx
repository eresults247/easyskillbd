import { getCurrentUser } from "@/lib/auth";
import { getInstructorAnalytics } from "@/server/queries";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Users, BookOpen, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/instructor/revenue-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function InstructorAnalyticsPage() {
  const user = await getCurrentUser();
  const analytics = await getInstructorAnalytics(user!.id);

  const stats = [
    { label: "Total revenue", value: formatCurrency(analytics.totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total enrollments", value: analytics.totalEnrollments, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Completion rate", value: `${analytics.completionRate}%`, icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
    { label: "Published courses", value: analytics.courses.length, icon: BookOpen, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Instructor Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Track your revenue, enrollments and student performance.</p>
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

      {analytics.courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start tracking analytics."
          action={<LinkButton href="/instructor/courses/new">Create a course</LinkButton>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent>
              <p className="mb-4 font-semibold text-slate-800">Revenue overview</p>
              <RevenueChart data={analytics.monthlyRevenue} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="mb-4 font-semibold text-slate-800">Course performance</p>
              <div className="space-y-4">
                {analytics.courses.map((c) => (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="line-clamp-1 font-medium text-slate-700">{c.title}</span>
                      <span className="text-slate-500">{c.enrollments} students</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${c.enrollments ? Math.round((c.completed / c.enrollments) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
