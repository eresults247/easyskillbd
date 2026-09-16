import { getCurrentUser } from "@/lib/auth";
import { getStudentEnrollments } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { Video, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const demoSessions = [
  { platform: "Zoom", label: "Weekly Q&A + code review", day: "Every Tuesday, 7:00 PM", link: "https://zoom.us/j/1234567890" },
  { platform: "Google Meet", label: "Live project walkthrough", day: "Every Friday, 6:00 PM", link: "https://meet.google.com/abc-defg-hij" },
];

export default async function LiveClassesPage() {
  const user = await getCurrentUser();
  const enrollments = await getStudentEnrollments(user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
        <p className="mt-1 text-sm text-slate-500">Join scheduled live sessions with your instructors via Zoom or Google Meet.</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState icon={Video} title="No live classes scheduled" description="Enroll in a course to see upcoming live sessions." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {demoSessions.map((s) => (
            <Card key={s.label}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={s.platform === "Zoom" ? "info" : "indigo"}>{s.platform}</Badge>
                  <span className="text-xs text-slate-400">{s.day}</span>
                </div>
                <p className="mt-3 font-semibold text-slate-800">{s.label}</p>
                <p className="mt-1 text-sm text-slate-500">{enrollments[0]?.courseTitle}</p>
                <a
                  href={s.link}
                  target="_blank"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Join session <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
