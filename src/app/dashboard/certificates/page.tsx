import { getCurrentUser } from "@/lib/auth";
import { getStudentCertificates } from "@/server/queries";
import { EmptyState } from "@/components/ui/empty-state";
import { Award, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  const certificates = await getStudentCertificates(user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
        <p className="mt-1 text-sm text-slate-500">Earned automatically when you complete 100% of a course.</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState icon={Award} title="No certificates yet" description="Complete a course to earn your first certificate." />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {certificates.map((c) => (
            <div key={c.id} className="relative overflow-hidden rounded-2xl border-4 border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-8 text-center shadow-sm">
              <Award className="mx-auto h-10 w-10 text-amber-500" />
              <p className="mt-3 text-xs uppercase tracking-widest text-slate-400">Certificate of Completion</p>
              <p className="mt-2 text-xl font-bold text-slate-900">{c.courseTitle}</p>
              <p className="mt-1 text-sm text-slate-500">awarded to</p>
              <p className="text-lg font-semibold text-indigo-700">{c.studentName}</p>
              <p className="mt-3 text-xs text-slate-400">Issued {formatDate(c.issuedAt)} · Code: {c.certificateCode}</p>
              <a
                href={`/dashboard/certificates/${c.id}/print`}
                target="_blank"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" /> View & print
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
