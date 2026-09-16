"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  PlusCircle,
  Trash2,
  ChevronDown,
  Video,
  FileQuestion,
  Save,
} from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import {
  createModuleAction,
  deleteModuleAction,
  reorderModulesAction,
  createLessonAction,
  updateLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
  createQuizAction,
  addQuizQuestionAction,
} from "@/server/actions/courses";

type LessonData = {
  id: string;
  title: string;
  videoUrl: string | null;
  contentHtml: string | null;
  durationMinutes: number;
  isFreePreview: boolean;
};

type QuizData = {
  id: string;
  title: string;
  passingScore: number;
  questions: { id: string; question: string; options: string[]; correctIndex: number }[];
};

type ModuleData = {
  id: string;
  title: string;
  lessons: LessonData[];
  quiz: QuizData | null;
};

export function CurriculumBuilder({ courseId, modules }: { courseId: string; modules: ModuleData[] }) {
  const [items, setItems] = useState(modules);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleModuleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id);
      const newIndex = prev.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      startTransition(() => reorderModulesAction(courseId, reordered.map((m) => m.id)));
      return reordered;
    });
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    startTransition(async () => {
      const mod = await createModuleAction(courseId, newModuleTitle.trim());
      setItems((prev) => [...prev, { id: mod.id, title: mod.title, lessons: [], quiz: null }]);
      setNewModuleTitle("");
      push("Module added", "success");
    });
  }

  function handleDeleteModule(id: string) {
    setItems((prev) => prev.filter((m) => m.id !== id));
    startTransition(() => deleteModuleAction(id, courseId));
  }

  function updateModuleLessons(moduleId: string, lessons: LessonData[]) {
    setItems((prev) => prev.map((m) => (m.id === moduleId ? { ...m, lessons } : m)));
  }

  function updateModuleQuiz(moduleId: string, quiz: QuizData) {
    setItems((prev) => prev.map((m) => (m.id === moduleId ? { ...m, quiz } : m)));
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {items.map((m, idx) => (
            <SortableModule
              key={m.id}
              module={m}
              index={idx}
              courseId={courseId}
              onDelete={() => handleDeleteModule(m.id)}
              onLessonsChange={(lessons) => updateModuleLessons(m.id, lessons)}
              onQuizChange={(quiz) => updateModuleQuiz(m.id, quiz)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white p-3">
        <Input
          placeholder="New module title, e.g. Getting Started"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
        />
        <Button onClick={handleAddModule} disabled={pending || !newModuleTitle.trim()}>
          <PlusCircle className="h-4 w-4" /> Add module
        </Button>
      </div>
    </div>
  );
}

function SortableModule({
  module,
  index,
  courseId,
  onDelete,
  onLessonsChange,
  onQuizChange,
}: {
  module: ModuleData;
  index: number;
  courseId: string;
  onDelete: () => void;
  onLessonsChange: (lessons: LessonData[]) => void;
  onQuizChange: (quiz: QuizData) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id });
  const [expanded, setExpanded] = useState(true);
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("rounded-2xl border border-slate-200 bg-white", isDragging && "shadow-lg ring-2 ring-indigo-300")}
    >
      <div className="flex items-center gap-2 p-4">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={() => setExpanded((v) => !v)} className="flex flex-1 items-center gap-2 text-left">
          <span className="font-semibold text-slate-800">
            Module {index + 1}: {module.title}
          </span>
          <span className="text-xs text-slate-400">({module.lessons.length} lessons)</span>
        </button>
        <ChevronDown onClick={() => setExpanded((v) => !v)} className={cn("h-4 w-4 cursor-pointer text-slate-400 transition-transform", expanded && "rotate-180")} />
        <button onClick={onDelete} className="text-rose-500 hover:text-rose-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {expanded && (
        <div className="space-y-4 border-t border-slate-100 p-4">
          <LessonManager courseId={courseId} moduleId={module.id} lessons={module.lessons} onChange={onLessonsChange} />
          <QuizManager courseId={courseId} moduleId={module.id} quiz={module.quiz} onChange={onQuizChange} />
        </div>
      )}
    </div>
  );
}

function LessonManager({
  courseId,
  moduleId,
  lessons,
  onChange,
}: {
  courseId: string;
  moduleId: string;
  lessons: LessonData[];
  onChange: (lessons: LessonData[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const { push } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(lessons, oldIndex, newIndex);
    onChange(reordered);
    startTransition(() => reorderLessonsAction(courseId, reordered.map((l) => l.id)));
  }

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const lesson = await createLessonAction({
        moduleId,
        courseId,
        title: String(formData.get("title")),
        videoUrl: String(formData.get("videoUrl") || ""),
        contentHtml: String(formData.get("contentHtml") || ""),
        durationMinutes: Number(formData.get("durationMinutes") || 5),
        isFreePreview: formData.get("isFreePreview") === "on",
      });
      onChange([...lessons, lesson]);
      setAdding(false);
      push("Lesson added", "success");
    });
  }

  function handleDelete(id: string) {
    onChange(lessons.filter((l) => l.id !== id));
    startTransition(() => deleteLessonAction(id, courseId));
  }

  function handleUpdate(id: string, data: Partial<LessonData>) {
    onChange(lessons.map((l) => (l.id === id ? { ...l, ...data } : l)));
    startTransition(() => updateLessonAction(id, courseId, data));
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {lessons.map((l) => (
            <SortableLesson key={l.id} lesson={l} onDelete={() => handleDelete(l.id)} onUpdate={(data) => handleUpdate(l.id, data)} />
          ))}
        </SortableContext>
      </DndContext>

      {adding ? (
        <form action={handleCreate} className="space-y-2 rounded-xl border border-dashed border-slate-300 p-3">
          <Input name="title" placeholder="Lesson title" required />
          <Input name="videoUrl" placeholder="Video URL (YouTube or mp4 link)" />
          <Textarea name="contentHtml" placeholder="Lesson notes (HTML supported)" rows={2} />
          <div className="flex items-center gap-3">
            <Input name="durationMinutes" type="number" placeholder="Minutes" defaultValue={5} className="w-28" />
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" name="isFreePreview" /> Free preview
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>Add lesson</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusCircle className="h-3.5 w-3.5" /> Add lesson
        </Button>
      )}
    </div>
  );
}

function SortableLesson({
  lesson,
  onDelete,
  onUpdate,
}: {
  lesson: LessonData;
  onDelete: () => void;
  onUpdate: (data: Partial<LessonData>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const [editing, setEditing] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={cn("rounded-xl border border-slate-200 bg-slate-50/60", isDragging && "ring-2 ring-indigo-300")}>
      <div className="flex items-center gap-2 p-2.5">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <Video className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
        <button onClick={() => setEditing((v) => !v)} className="flex-1 text-left text-sm font-medium text-slate-700">
          {lesson.title}
        </button>
        <span className="text-xs text-slate-400">{lesson.durationMinutes}m</span>
        <button onClick={onDelete} className="text-rose-500 hover:text-rose-600">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {editing && (
        <div className="space-y-2 border-t border-slate-200 p-3">
          <Input defaultValue={lesson.title} onBlur={(e) => onUpdate({ title: e.target.value })} placeholder="Title" />
          <Input defaultValue={lesson.videoUrl ?? ""} onBlur={(e) => onUpdate({ videoUrl: e.target.value })} placeholder="Video URL" />
          <Textarea defaultValue={lesson.contentHtml ?? ""} onBlur={(e) => onUpdate({ contentHtml: e.target.value })} placeholder="Lesson notes" rows={3} />
          <div className="flex items-center gap-3">
            <Input
              type="number"
              defaultValue={lesson.durationMinutes}
              onBlur={(e) => onUpdate({ durationMinutes: Number(e.target.value) })}
              className="w-28"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" defaultChecked={lesson.isFreePreview} onChange={(e) => onUpdate({ isFreePreview: e.target.checked })} />
              Free preview
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizManager({
  courseId,
  moduleId,
  quiz,
  onChange,
}: {
  courseId: string;
  moduleId: string;
  quiz: QuizData | null;
  onChange: (quiz: QuizData) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [addingQuestion, setAddingQuestion] = useState(false);
  const { push } = useToast();

  function handleCreateQuiz() {
    startTransition(async () => {
      const created = await createQuizAction({ moduleId, courseId, title: `${quiz ? "Quiz" : "Module Quiz"}`, passingScore: 60 });
      onChange({ id: created.id, title: created.title, passingScore: created.passingScore, questions: [] });
      push("Quiz created", "success");
    });
  }

  function handleAddQuestion(formData: FormData) {
    if (!quiz) return;
    const options = [
      String(formData.get("opt0") || ""),
      String(formData.get("opt1") || ""),
      String(formData.get("opt2") || ""),
      String(formData.get("opt3") || ""),
    ].filter(Boolean);
    const correctIndex = Number(formData.get("correct"));
    startTransition(async () => {
      await addQuizQuestionAction({ quizId: quiz.id, courseId, question: String(formData.get("question")), options, correctIndex });
      onChange({ ...quiz, questions: [...quiz.questions, { id: `temp-${Date.now()}`, question: String(formData.get("question")), options, correctIndex }] });
      setAddingQuestion(false);
      push("Question added", "success");
    });
  }

  if (!quiz) {
    return (
      <Button variant="subtle" size="sm" onClick={handleCreateQuiz} disabled={pending}>
        <FileQuestion className="h-3.5 w-3.5" /> Add module quiz
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-violet-700">
        <FileQuestion className="h-4 w-4" /> {quiz.title} · Passing score {quiz.passingScore}%
      </p>
      <div className="mt-2 space-y-1.5">
        {quiz.questions.map((q, i) => (
          <p key={q.id} className="text-xs text-slate-600">
            {i + 1}. {q.question}
          </p>
        ))}
      </div>
      {addingQuestion ? (
        <form action={handleAddQuestion} className="mt-3 space-y-2 rounded-lg bg-white p-3">
          <Input name="question" placeholder="Question" required />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" value={i} defaultChecked={i === 0} />
              <Input name={`opt${i}`} placeholder={`Option ${i + 1}`} required={i < 2} />
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}><Save className="h-3.5 w-3.5" /> Save question</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddingQuestion(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setAddingQuestion(true)}>
          <PlusCircle className="h-3.5 w-3.5" /> Add question
        </Button>
      )}
    </div>
  );
}
