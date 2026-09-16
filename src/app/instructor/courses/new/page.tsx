import { CreateCourseForm } from "@/components/instructor/create-course-form";

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create a new course</h1>
        <p className="mt-1 text-sm text-slate-500">Start with the basics — you can add modules and lessons next.</p>
      </div>
      <CreateCourseForm />
    </div>
  );
}
