"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { submitCourseForReviewAction } from "@/server/actions/courses";
import { useToast } from "@/components/providers/toast-provider";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

const statusVariant = {
  draft: "default",
  pending: "warning",
  published: "success",
  rejected: "danger",
} as const;

export function CoursePublishPanel({ courseId, status }: { courseId: string; status: keyof typeof statusVariant }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleSubmit() {
    startTransition(async () => {
      await submitCourseForReviewAction(courseId);
      push("Submitted for admin review", "success");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Badge variant={statusVariant[status]} className="capitalize">
        {status}
      </Badge>
      {(status === "draft" || status === "rejected") && (
        <Button size="sm" onClick={handleSubmit} disabled={pending}>
          <Send className="h-3.5 w-3.5" /> Submit for review
        </Button>
      )}
    </div>
  );
}
