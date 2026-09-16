"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, Lock, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

type Lesson = { id: string; title: string; durationMinutes: number; isFreePreview: boolean };
type ModuleData = { id: string; title: string; lessons: Lesson[]; quiz?: unknown };

export function CourseCurriculum({ modules }: { modules: ModuleData[] }) {
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null);

  if (!modules.length) {
    return <p className="text-sm text-slate-500">Curriculum coming soon.</p>;
  }

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
      {modules.map((m, idx) => {
        const open = openId === m.id;
        const totalMinutes = m.lessons.reduce((s, l) => s + l.durationMinutes, 0);
        return (
          <div key={m.id} className="bg-white">
            <button
              onClick={() => setOpenId(open ? null : m.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  Module {idx + 1}: {m.title}
                </p>
                <p className="text-xs text-slate-500">
                  {m.lessons.length} lessons · {totalMinutes}m {m.quiz ? "· includes quiz" : ""}
                </p>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2">
                {m.lessons.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      {l.isFreePreview ? <PlayCircle className="h-4 w-4 text-indigo-500" /> : <Lock className="h-4 w-4 text-slate-400" />}
                      {l.title}
                      {l.isFreePreview && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">Preview</span>}
                    </span>
                    <span className="text-xs text-slate-400">{l.durationMinutes}m</span>
                  </div>
                ))}
                {!!m.quiz && (
                  <div className="flex items-center gap-2 py-2.5 text-sm text-slate-700">
                    <FileQuestion className="h-4 w-4 text-violet-500" /> Module quiz
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
