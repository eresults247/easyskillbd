"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { gradeSubmissionAction } from "@/server/actions/assignments";
import { useToast } from "@/components/providers/toast-provider";
import { CheckCircle2, ExternalLink } from "lucide-react";

type Submission = {
  id: string;
  content: string | null;
  fileUrl: string | null;
  submittedAt: string;
  grade: number | null;
  feedback: string | null;
  studentName: string;
  studentAvatar: string | null;
  assignmentTitle: string;
  courseTitle: string;
  maxScore: number;
};

export function GradingCard({ submission }: { submission: Submission }) {
  const [grade, setGrade] = useState(submission.grade ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [graded, setGraded] = useState(submission.grade != null);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handleGrade() {
    startTransition(async () => {
      await gradeSubmissionAction(submission.id, Number(grade), feedback);
      setGraded(true);
      push("Feedback submitted", "success");
    });
  }

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar name={submission.studentName} src={submission.studentAvatar} className="h-9 w-9" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{submission.studentName}</p>
              <p className="text-xs text-slate-500">
                {submission.assignmentTitle} · {submission.courseTitle}
              </p>
            </div>
          </div>
          <Badge variant={graded ? "success" : "warning"}>{graded ? "Graded" : "Pending review"}</Badge>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          {submission.content}
          {submission.fileUrl && (
            <a href={submission.fileUrl} target="_blank" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline">
              <ExternalLink className="h-3.5 w-3.5" /> View attached file
            </a>
          )}
        </div>
        <p className="text-xs text-slate-400">Submitted {formatDate(submission.submittedAt)}</p>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Grade (out of {submission.maxScore})</label>
            <Input type="number" className="w-28" value={grade} onChange={(e) => setGrade(e.target.value)} max={submission.maxScore} min={0} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600">Feedback</label>
            <Textarea rows={1} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Constructive feedback..." />
          </div>
          <Button size="sm" onClick={handleGrade} disabled={pending || grade === ""}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Save grade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
