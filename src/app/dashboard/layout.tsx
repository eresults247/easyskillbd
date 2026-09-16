import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell, NavGroup } from "@/components/layout/dashboard-shell";
import { LayoutDashboard, BookOpen, ClipboardList, Award, MessageSquare, Video } from "lucide-react";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "instructor") redirect("/instructor");

  const navGroups: NavGroup[] = [
    {
      title: "Learning",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
        { label: "Assignments", href: "/dashboard/assignments", icon: ClipboardList },
        { label: "Live Classes", href: "/dashboard/live", icon: Video },
        { label: "Certificates", href: "/dashboard/certificates", icon: Award },
      ],
    },
  ];

  return (
    <DashboardShell
      navGroups={navGroups}
      roleLabel="Student"
      roleBadgeColor="bg-indigo-500/20 text-indigo-300"
      user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}
    >
      {children}
    </DashboardShell>
  );
}
