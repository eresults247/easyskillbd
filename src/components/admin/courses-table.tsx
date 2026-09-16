"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateCourseStatusAction } from "@/server/actions/admin";
import { useToast } from "@/components/providers/toast-provider";
import { Check, X, Eye } from "lucide-react";
import Link from "next/link";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "pending" | "published" | "rejected";
  price: string;
  category: string;
  createdAt: string;
  instructorName: string;
};

const statusColor = { draft: "default", pending: "warning", published: "success", rejected: "danger" } as const;

export function AdminCoursesTable({ courses }: { courses: CourseRow[] }) {
  const [rows, setRows] = useState(courses);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const [filter, setFilter] = useState<"all" | CourseRow["status"]>("all");

  const filtered = filter === "all" ? rows : rows.filter((c) => c.status === filter);

  function updateStatus(id: string, status: CourseRow["status"]) {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    startTransition(async () => {
      await updateCourseStatusAction(id, status);
      push(`Course ${status}`, "success");
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        {(["all", "pending", "published", "draft", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.category} · {formatDate(c.createdAt)}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.instructorName}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(c.price)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusColor[c.status]} className="capitalize">{c.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${c.slug}`} target="_blank" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                      <Eye className="h-4 w-4" />
                    </Link>
                    {c.status === "pending" && (
                      <>
                        <Button size="sm" variant="primary" onClick={() => updateStatus(c.id, "published")} disabled={pending}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => updateStatus(c.id, "rejected")} disabled={pending}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    {c.status === "published" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "draft")} disabled={pending}>
                        Unpublish
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
