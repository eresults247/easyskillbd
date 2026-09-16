"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  Download,
  MessageSquare,
  FileQuestion,
  Menu,
  X,
  Send,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getYoutubeEmbedUrl, formatDate } from "@/lib/utils";
import { toggleLessonCompleteAction, postDiscussionAction, submitQuizAttemptAction } from "@/server/actions/progress";
import { useToast } from "@/components/providers/toast-provider";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

type SidebarLesson = {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
};

type Lesson = SidebarLesson & {
  videoUrl: string | null;
  contentHtml: string | null;
  isFreePreview: boolean;
  resources: { name: string; url: string }[] | null;
  moduleTitle: string;
};

type QuizQuestion = { id: string; question: string; options: string[]; correctIndex: number };
type Quiz = { id: string; title: string; passingScore: number; questions: QuizQuestion[] } | null;

type ModuleWithLessons = {
  id: string;
  title: string;
  lessons: SidebarLesson[];
  quiz: Quiz;
};

type Discussion = {
  id: string;
  message: string;
  createdAt: string;
  parentId: string | null;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userRole: string;
};

const TABS = ["notes", "resources", "discussion", "quiz"] as const;

export function LessonPlayer({
  courseId,
  courseTitle,
  modules,
  lesson,
  quiz,
  prevLessonId,
  nextLessonId,
  progressPercent,
  discussions,
  currentUser,
}: {
  courseId: string;
  courseTitle: string;
  modules: ModuleWithLessons[];
  lesson: Lesson;
  quiz: Quiz;
  prevLessonId: string | null;
  nextLessonId: string | null;
  progressPercent: number;
  discussions: Discussion[];
  currentUser: { id: string; name: string; avatarUrl: string | null };
}) {
  const [completed, setCompleted] = useState(lesson.completed);
  const [progress, setProgress] = useState(progressPercent);
  const [tab, setTab] = useState<(typeof TABS)[number]>(quiz ? "notes" : "notes");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  const embedUrl = useMemo(() => getYoutubeEmbedUrl(lesson.videoUrl), [lesson.videoUrl]);

  function handleToggleComplete() {
    const newValue = !completed;
    setCompleted(newValue);
    startTransition(async () => {
      try {
        const res = await toggleLessonCompleteAction(lesson.id, courseId, newValue);
        setProgress(res.percent);
        push(newValue ? "Lesson marked complete" : "Marked as incomplete", "success");
        if (res.isCompleted) {
          push("🎉 Course complete! Your certificate is ready.", "success");
        }
        router.refresh();
      } catch {
        setCompleted(!newValue);
        push("Something went wrong", "error");
      }
    });
  }

  const CurriculumSidebar = (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-100 p-4">
        <Link href={`/dashboard/courses`} className="text-xs font-medium text-indigo-600 hover:underline">
          &larr; All my courses
        </Link>
        <p className="mt-1 line-clamp-1 font-semibold text-slate-800">{courseTitle}</p>
        <div className="mt-2 flex items-center gap-2">
          <Progress value={progress} />
          <span className="text-xs font-medium text-slate-500">{progress}%</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {modules.map((m, mi) => (
          <div key={m.id} className="mb-3">
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Module {mi + 1}: {m.title}
            </p>
            {m.lessons.map((l) => (
              <Link
                key={l.id}
                href={`/dashboard/courses/${courseId}/lesson/${l.id}`}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  l.id === lesson.id ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-600 hover:bg-slate-50",
                )}
              >
                {l.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <span className="line-clamp-1 flex-1">{l.title}</span>
                <span className="text-[11px] text-slate-400">{l.durationMinutes}m</span>
              </Link>
            ))}
            {m.quiz && (
              <div className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-violet-600">
                <FileQuestion className="h-4 w-4" /> {m.quiz.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-10 flex bg-slate-100">
      <aside className="hidden w-80 shrink-0 border-r border-slate-200 lg:block">{CurriculumSidebar}</aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="fixed inset-y-0 left-0 z-40 w-80 lg:hidden"
            >
              {CurriculumSidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <p className="line-clamp-1 flex-1 font-semibold text-slate-800">{lesson.title}</p>
          <Link href="/dashboard" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="bg-black">
          <div className="mx-auto aspect-video w-full max-w-5xl">
            {embedUrl ? (
              <iframe className="h-full w-full" src={embedUrl} title={lesson.title} allowFullScreen />
            ) : lesson.videoUrl ? (
              <video className="h-full w-full" src={lesson.videoUrl} controls />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <PlayCircle className="mr-2 h-6 w-6" /> No video uploaded for this lesson
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">{lesson.moduleTitle}</p>
              <h1 className="mt-1 text-xl font-bold text-slate-900">{lesson.title}</h1>
            </div>
            <Button
              variant={completed ? "secondary" : "primary"}
              onClick={handleToggleComplete}
              disabled={pending}
            >
              <CheckCircle2 className="h-4 w-4" /> {completed ? "Completed" : "Mark as complete"}
            </Button>
          </div>

          <div className="mt-6 flex gap-1 border-b border-slate-200">
            {(["notes", "resources", "discussion", ...(quiz ? (["quiz"] as const) : [])] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                  tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800",
                )}
              >
                {t === "notes" && <FileText className="h-3.5 w-3.5" />}
                {t === "resources" && <Download className="h-3.5 w-3.5" />}
                {t === "discussion" && <MessageSquare className="h-3.5 w-3.5" />}
                {t === "quiz" && <FileQuestion className="h-3.5 w-3.5" />}
                {t}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === "notes" && (
              <div className="prose-lesson max-w-none text-slate-700">
                {lesson.contentHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: lesson.contentHtml }} />
                ) : (
                  <p className="text-slate-400">No notes added for this lesson yet.</p>
                )}
              </div>
            )}

            {tab === "resources" && (
              <div className="space-y-2">
                {lesson.resources && lesson.resources.length > 0 ? (
                  lesson.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <FileText className="h-4 w-4 text-indigo-500" /> {r.name}
                      </span>
                      <Download className="h-4 w-4 text-slate-400" />
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No downloadable resources for this lesson.</p>
                )}
              </div>
            )}

            {tab === "discussion" && <DiscussionPanel lessonId={lesson.id} initial={discussions} currentUser={currentUser} />}

            {tab === "quiz" && quiz && <QuizPanel quiz={quiz} />}
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          {prevLessonId ? (
            <Link href={`/dashboard/courses/${courseId}/lesson/${prevLessonId}`}>
              <Button variant="outline"><ChevronLeft className="h-4 w-4" /> Previous</Button>
            </Link>
          ) : <span />}
          {nextLessonId ? (
            <Link href={`/dashboard/courses/${courseId}/lesson/${nextLessonId}`}>
              <Button>Next lesson <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          ) : (
            <Link href="/dashboard/certificates">
              <Button variant="secondary">Finish course <ChevronRight className="h-4 w-4" /></Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscussionPanel({
  lessonId,
  initial,
  currentUser,
}: {
  lessonId: string;
  initial: Discussion[];
  currentUser: { id: string; name: string; avatarUrl: string | null };
}) {
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  function handlePost() {
    if (!message.trim()) return;
    const optimistic: Discussion = {
      id: `temp-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      parentId: null,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      userRole: "student",
    };
    setItems((prev) => [...prev, optimistic]);
    setMessage("");
    startTransition(async () => {
      try {
        await postDiscussionAction(lessonId, optimistic.message);
      } catch {
        push("Failed to post comment", "error");
        setItems((prev) => prev.filter((i) => i.id !== optimistic.id));
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <Avatar name={currentUser.name} src={currentUser.avatarUrl} className="h-9 w-9 shrink-0" />
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this lesson..."
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={handlePost} disabled={pending || !message.trim()}>
              <Send className="h-3.5 w-3.5" /> Post
            </Button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No questions yet. Start the discussion!</p>
      ) : (
        <div className="space-y-4">
          {[...items].reverse().map((d) => (
            <div key={d.id} className="flex gap-3">
              <Avatar name={d.userName} src={d.userAvatar} className="h-9 w-9 shrink-0" />
              <div className="flex-1 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{d.userName}</p>
                  {d.userRole !== "student" && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-600">
                      {d.userRole}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{formatDate(d.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{d.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizPanel({ quiz }: { quiz: NonNullable<Quiz> }) {
  const [answers, setAnswers] = useState<number[]>(Array(quiz.questions.length).fill(-1));
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(async () => {
      const res = await submitQuizAttemptAction(quiz.id, answers);
      setResult(res);
    });
  }

  if (result) {
    const passed = result.score >= quiz.passingScore;
    return (
      <div className={cn("rounded-2xl border p-6 text-center", passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
        <p className={cn("text-3xl font-extrabold", passed ? "text-emerald-700" : "text-rose-700")}>{result.score}%</p>
        <p className="mt-1 text-sm text-slate-600">
          You answered {result.correct} out of {result.total} correctly.
        </p>
        <p className={cn("mt-2 text-sm font-semibold", passed ? "text-emerald-700" : "text-rose-700")}>
          {passed ? "🎉 You passed the quiz!" : `You need ${quiz.passingScore}% to pass. Try again!`}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => { setResult(null); setAnswers(Array(quiz.questions.length).fill(-1)); }}>
          Retake quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Passing score: {quiz.passingScore}% · {quiz.questions.length} questions</p>
      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="rounded-xl border border-slate-200 p-4">
          <p className="font-medium text-slate-800">{qi + 1}. {q.question}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                  answers[qi] === oi ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[qi] === oi}
                  onChange={() => setAnswers((prev) => prev.map((a, idx) => (idx === qi ? oi : a)))}
                  className="h-4 w-4"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={pending || answers.includes(-1)} size="lg">
        Submit quiz
      </Button>
    </div>
  );
}
