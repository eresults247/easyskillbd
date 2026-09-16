import { getAdminAnalytics } from "@/server/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, DollarSign, Radio, Eye, GraduationCap, ShieldAlert, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const a = await getAdminAnalytics();

  const stats = [
    { label: "Total users", value: a.userCount, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { label: "Students", value: a.studentCount, icon: GraduationCap, color: "bg-sky-50 text-sky-600" },
    { label: "Instructors", value: a.instructorCount, icon: Users, color: "bg-violet-50 text-violet-600" },
    { label: "Total courses", value: a.courseCount, icon: BookOpen, color: "bg-amber-50 text-amber-600" },
    { label: "Verified revenue", value: formatCurrency(a.totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Pending payments", value: a.pendingOrders, icon: Clock, color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor platform health, visitors and pending approvals.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">{a.onlineNow}</p>
              <p className="text-xs text-emerald-600">Visitors online now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50/60">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-700">{a.todayVisitors}</p>
              <p className="text-xs text-indigo-600">Unique visitors today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-700">{a.pendingCourseCount + a.pendingInstructorCount}</p>
              <p className="text-xs text-amber-600">Items awaiting approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/admin/courses" className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <p className="font-semibold text-slate-800">Review pending courses</p>
          <p className="mt-1 text-sm text-slate-500">{a.pendingCourseCount} course(s) waiting for approval</p>
        </Link>
        <Link href="/admin/payments" className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <p className="font-semibold text-slate-800">Verify bKash payments</p>
          <p className="mt-1 text-sm text-slate-500">{a.pendingOrders} payment(s) awaiting verification</p>
        </Link>
      </div>
    </div>
  );
}
