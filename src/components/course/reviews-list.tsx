import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  studentName: string;
  studentAvatar?: string | null;
};

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <EmptyState icon={MessageSquare} title="No reviews yet" description="Be the first student to review this course after enrolling." />;
  }

  return (
    <div className="space-y-5">
      {reviews.map((r) => (
        <div key={r.id} className="flex gap-3 rounded-xl border border-slate-200 p-4">
          <Avatar name={r.studentName} src={r.studentAvatar} className="h-10 w-10 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{r.studentName}</p>
              <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
            </div>
            <div className="mt-1 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} className={`h-3.5 w-3.5 ${idx < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
