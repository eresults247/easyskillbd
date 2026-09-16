import { getCurrentUser } from "@/lib/auth";
import { getStudentAssignments } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import { AssignmentCard } from "@/components/dashboard/assignment-card";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const user = await getCurrentUser();
  const assignments = await getStudentAssignments(user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>
        <p className="mt-1 text-sm text-slate-500">Submit your work and track feedback from instructors.</p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments due" description="Enroll in a course to see assignments here." />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={{
                ...a,
                dueDate: a.dueDate ? a.dueDate.toString() : null,
                submission: a.submission
                  ? { ...a.submission, submittedAt: a.submission.submittedAt.toString() }
                  : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
