import { getAllCoursesForAdmin } from "@/server/queries";
import { AdminCoursesTable } from "@/components/admin/courses-table";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getAllCoursesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Review and publish courses submitted by instructors.</p>
      </div>
      <AdminCoursesTable
        courses={courses.map((c) => ({ ...c, price: String(c.price), createdAt: c.createdAt.toString() }))}
      />
    </div>
  );
}
