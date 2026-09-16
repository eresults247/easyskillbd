"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAssignmentAction, deleteAssignmentAction } from "@/server/actions/courses";
import { useToast } from "@/components/providers/toast-provider";
import { PlusCircle, Trash2, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";

type Assignment = { id: string; title: string; description: string | null; dueDate: string | null; maxScore: number };

export function AssignmentsManager({ courseId, assignments }: { courseId: string; assignments: Assignment[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createAssignmentAction({
        courseId,
        title: String(formData.get("title")),
        description: String(formData.get("description") || ""),
        dueDate: String(formData.get("dueDate") || "") || undefined,
        maxScore: Number(formData.get("maxScore") || 100),
      });
      push("Assignment created", "success");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAssignmentAction(id, courseId);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        {assignments.length === 0 && !open && <p className="text-sm text-slate-400">No assignments added yet.</p>}
        {assignments.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">{a.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{a.description}</p>
              {a.dueDate && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <CalendarClock className="h-3 w-3" /> Due {a.dueDate}
                </p>
              )}
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-rose-500 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {open ? (
          <form action={handleCreate} className="space-y-3 rounded-xl border border-dashed border-slate-300 p-3">
            <div>
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" name="title" required />
            </div>
            <div>
              <Label htmlFor="a-desc">Description</Label>
              <Textarea id="a-desc" name="description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="a-due">Due date</Label>
                <Input id="a-due" name="dueDate" type="date" />
              </div>
              <div>
                <Label htmlFor="a-max">Max score</Label>
                <Input id="a-max" name="maxScore" type="number" defaultValue={100} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>Add assignment</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            <PlusCircle className="h-4 w-4" /> Add assignment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
