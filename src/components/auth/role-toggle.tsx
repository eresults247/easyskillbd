"use client";

import { useState } from "react";
import { GraduationCap, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleToggle({ defaultRole }: { defaultRole: "student" | "instructor" }) {
  const [role, setRole] = useState(defaultRole);

  return (
    <div>
      <input type="hidden" name="role" value={role} />
      <label className="mb-1.5 block text-sm font-medium text-slate-700">I want to join as</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors",
            role === "student" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300",
          )}
        >
          <GraduationCap className="h-5 w-5" /> Student
        </button>
        <button
          type="button"
          onClick={() => setRole("instructor")}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors",
            role === "instructor" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300",
          )}
        >
          <Presentation className="h-5 w-5" /> Instructor
        </button>
      </div>
      {role === "instructor" && (
        <p className="mt-2 text-xs text-amber-600">Instructor accounts require admin approval before publishing courses.</p>
      )}
    </div>
  );
}
