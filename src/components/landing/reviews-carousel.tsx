"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export type ReviewData = {
  id: string;
  rating: number;
  comment: string | null;
  studentName: string;
  studentAvatar?: string | null;
  courseTitle: string;
};

export function ReviewsCarousel({ reviews }: { reviews: ReviewData[] }) {
  if (!reviews.length) return null;
  const loop = [...reviews, ...reviews];

  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-6 animate-marquee hover:[animation-play-state:paused]">
        {loop.map((r, i) => (
          <motion.div
            key={`${r.id}-${i}`}
            className="flex w-80 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Quote className="h-6 w-6 text-indigo-200" />
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-4 w-4 ${idx < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                />
              ))}
            </div>
            <p className="mt-3 line-clamp-4 flex-1 text-sm text-slate-600">{r.comment}</p>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <Avatar name={r.studentName} src={r.studentAvatar} className="h-9 w-9" />
              <div>
                <p className="text-sm font-semibold text-slate-800">{r.studentName}</p>
                <p className="text-xs text-slate-500">{r.courseTitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
