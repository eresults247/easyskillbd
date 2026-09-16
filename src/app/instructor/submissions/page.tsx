import { getCurrentUser } from "@/lib/auth";
import { getAssignmentSubmissionsForInstructor } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";
import { GradingCard } from "@/components/instructor/grading-card";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const user = await getCurrentUser();
  const submissions = await getAssignmentSubmissionsForInstructor(user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Grading & Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">Review student submissions and provide constructive feedback.</p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No submissions yet" description="Student submissions will appear here once they submit assignments." />
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <GradingCard
              key={s.id}
              submission={{
                ...s,
                submittedAt: s.submittedAt.toString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
