import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/landing/hero";
import { CourseCard } from "@/components/landing/course-card";
import { ReviewsCarousel } from "@/components/landing/reviews-carousel";
import { getPublishedCourses, getFeaturedReviews, getCartItemsForUser } from "@/server/queries";
import { getSession } from "@/lib/auth";
import { LinkButton } from "@/components/ui/button";
import {
  PlayCircle,
  FileCheck2,
  Trophy,
  Video,
  MessagesSquare,
  BarChart3,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

const features = [
  { icon: Video, title: "HD Video Lessons", desc: "Stream lessons with auto-progress tracking and downloadable resources." },
  { icon: MessagesSquare, title: "Live Q&A Forums", desc: "Ask questions under every lesson and get answers from instructors." },
  { icon: FileCheck2, title: "Assignments & Quizzes", desc: "Practice with real-time scored quizzes and instructor-graded assignments." },
  { icon: Trophy, title: "Certificates", desc: "Earn a verifiable certificate automatically once you complete a course." },
  { icon: BarChart3, title: "Instructor Analytics", desc: "Instructors track revenue, completion rates and student performance." },
  { icon: ShieldCheck, title: "Admin Controls", desc: "Admins approve instructors, publish courses, and manage payouts." },
];

const categories = ["Web Development", "UI/UX Design", "Data Science", "Marketing", "Business", "Photography"];

export default async function HomePage() {
  const [courses, reviews, session] = await Promise.all([
    getPublishedCourses(8),
    getFeaturedReviews(10),
    getSession(),
  ]);

  const cartItems = session ? await getCartItemsForUser(session.userId) : [];
  const dashboardHref = session?.role === "admin" ? "/admin" : session?.role === "instructor" ? "/instructor" : "/dashboard";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader isAuthenticated={!!session} dashboardHref={dashboardHref} cartCount={cartItems.length} />
      <Hero />

      {/* Categories */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3 px-4 sm:px-6 lg:px-8">
          {categories.map((c) => (
            <span key={c} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Catalog</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Popular courses to get you started</h2>
          </div>
          <p className="max-w-md text-sm text-slate-500">
            Hand-picked, expert-led courses spanning web development, design, and data — complete with projects and certificates.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center text-slate-500">
            New courses are being prepared. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                isAuthenticated={!!session}
                course={{
                  ...course,
                  price: String(course.price),
                  discountPrice: course.discountPrice ? String(course.discountPrice) : null,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section id="how-it-works" className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-400">Why Skillio</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Everything you need to teach and learn online</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-semibold">{f.title}</p>
                <p className="mt-1.5 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Loved by students worldwide</h2>
          </div>
        </div>
        {reviews.length > 0 ? (
          <ReviewsCarousel
            reviews={reviews.map((r) => ({ ...r, comment: r.comment, studentAvatar: r.studentAvatar }))}
          />
        ) : (
          <p className="text-center text-slate-500">Be the first to leave a review!</p>
        )}
      </section>

      {/* Become instructor CTA */}
      <section id="become-instructor" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white sm:p-14 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <PlayCircle className="h-3.5 w-3.5" /> Become an instructor
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Share your expertise. Earn while you teach.</h2>
            <p className="mt-3 max-w-lg text-indigo-100">
              Create engaging courses with our drag-and-drop curriculum builder, track your revenue in real time, and
              get paid out securely.
            </p>
            <div className="mt-6">
              <LinkButton href="/sign-up?role=instructor" size="lg" variant="secondary" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Start teaching today
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-5">
              <Wallet className="h-6 w-6" />
              <p className="mt-3 text-2xl font-bold">70%</p>
              <p className="text-sm text-indigo-100">Revenue share for instructors</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <BarChart3 className="h-6 w-6" />
              <p className="mt-3 text-2xl font-bold">Real-time</p>
              <p className="text-sm text-indigo-100">Analytics dashboard</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
