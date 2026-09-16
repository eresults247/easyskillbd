import { db } from "@/db";
import { certificates, enrollments, courses, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { GraduationCap, Award } from "lucide-react";
import { PrintButton } from "@/components/dashboard/print-button";

export const dynamic = "force-dynamic";

export default async function CertificatePrintPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;

  const [row] = await db
    .select({
      code: certificates.certificateCode,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
      studentName: users.name,
      instructorId: courses.instructorId,
    })
    .from(certificates)
    .innerJoin(enrollments, eq(certificates.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(certificates.id, certId));

  if (!row) notFound();

  const [instructor] = await db.select({ name: users.name }).from(users).where(eq(users.id, row.instructorId));

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex justify-end print:hidden">
          <PrintButton />
        </div>
        <div className="relative border-[10px] border-double border-indigo-200 bg-white p-14 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Skillio Learning Platform</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-amber-500">
            <Award className="h-8 w-8" />
            <p className="text-2xl font-bold uppercase tracking-widest text-slate-800">Certificate of Completion</p>
          </div>
          <p className="mt-8 text-sm text-slate-500">This certifies that</p>
          <p className="mt-2 font-serif text-4xl font-bold text-indigo-700">{row.studentName}</p>
          <p className="mt-4 text-sm text-slate-500">has successfully completed the course</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{row.courseTitle}</p>
          <div className="mt-10 flex items-center justify-between px-10 text-sm text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">{instructor?.name}</p>
              <p className="border-t border-slate-300 pt-1">Instructor</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{formatDate(row.issuedAt)}</p>
              <p className="border-t border-slate-300 pt-1">Date issued</p>
            </div>
          </div>
          <p className="mt-8 text-xs text-slate-400">Certificate ID: {row.code}</p>
        </div>
      </div>
    </div>
  );
}
