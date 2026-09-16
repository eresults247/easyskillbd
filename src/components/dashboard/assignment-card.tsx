"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { CalendarClock, CheckCircle2, Star } from "lucide-react";
import { submitAssignmentAction } from "@/server/actions/assignments";
import { useToast } from "@/components/providers/toast-provider";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  courseTitle: string;
  submission: { content: string | null; fileUrl: string | null; submittedAt: string; grade: number | null; feedback: string | null } | null;
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [content, setContent] = useState(assignment.submission?.content ?? "");
  const [fileUrl, setFileUrl] = useState(assignment.submission?.fileUrl ?? "");
  const [submission, setSubmission] = useState(assignment.submission);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleSubmit() {
    startTransition(async () => {
      const res = await submitAssignmentAction(assignment.id, content, fileUrl);
      if (res?.error) {
        push(res.error, "error");
      } else {
        setSubmission({ content, fileUrl, submittedAt: new Date().toISOString(), grade: null, feedback: null });
        push("Assignment submitted!", "success");
      }
    });
  }

  const isPastDue = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{assignment.courseTitle}</p>
            <p className="mt-1 font-semibold text-slate-800">{assignment.title}</p>
          </div>
          {submission ? (
            <Badge variant="success">Submitted</Badge>
          ) : isPastDue ? (
            <Badge variant="danger">Overdue</Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          )}
        </div>
        <p className="text-sm text-slate-600">{assignment.description}</p>
        {assignment.dueDate && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarClock className="h-3.5 w-3.5" /> Due {formatDate(assignment.dueDate)} · Max score {assignment.maxScore}
          </p>
        )}

        {submission?.grade != null ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            <p className="flex items-center gap-1.5 font-semibold">
              <Star className="h-4 w-4" /> Graded: {submission.grade}/{assignment.maxScore}
            </p>
            {submission.feedback && <p className="mt-1 text-emerald-700">{submission.feedback}</p>}
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your submission or paste a summary..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Input placeholder="Optional link to file/repo (Google Drive, GitHub...)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            <Button size="sm" onClick={handleSubmit} disabled={pending || !content.trim()}>
              <CheckCircle2 className="h-4 w-4" /> {submission ? "Update submission" : "Submit assignment"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
