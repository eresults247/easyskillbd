import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell, NavGroup } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, BookOpen, PlusCircle, ClipboardCheck } from "lucide-react";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/instructor");
  if (user.role === "student") redirect("/dashboard");
  if (user.role === "admin") {
    // Admins can preview instructor studio too, no redirect needed
  }

  const navGroups: NavGroup[] = [
    {
      title: "Studio",
      items: [
        { label: "Analytics", href: "/instructor", icon: LayoutDashboard },
        { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
        { label: "Create Course", href: "/instructor/courses/new", icon: PlusCircle },
        { label: "Grading", href: "/instructor/submissions", icon: ClipboardCheck },
      ],
    },
  ];

  return (
    <DashboardShell
      navGroups={navGroups}
      roleLabel="Instructor"
      roleBadgeColor="bg-violet-500/20 text-violet-300"
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {user.status === "pending" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your instructor account is pending admin approval. You can build courses now, but publishing requires approval.
        </div>
      )}
      {children}
    </DashboardShell>
  );
}
