import { getCourseBySlug, getCartItemsForUser, isEnrolled } from "@/server/queries";
import { getSession } from "@/lib/auth";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Users, Clock, PlayCircle, CheckCircle2, BarChart3, Globe, Award } from "lucide-react";
import { formatCurrency, getYoutubeEmbedUrl } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { CourseCurriculum } from "@/components/course/course-curriculum";
import { CoursePurchaseCard } from "@/components/course/course-purchase-card";
import { ReviewsList } from "@/components/course/reviews-list";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, session] = await Promise.all([getCourseBySlug(slug), getSession()]);
  if (!data || (data.course.status !== "published" && session?.role !== "admin" && session?.userId !== data.course.instructorId)) {
    notFound();
  }

  const { course, modules, reviews, enrollCount, totalLessons, totalMinutes } = data;
  const embedUrl = getYoutubeEmbedUrl(course.promoVideoUrl);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

  const cartItems = session ? await getCartItemsForUser(session.userId) : [];
  const alreadyInCart = cartItems.some((i) => i.courseId === course.id);
  const alreadyEnrolled = session ? await isEnrolled(session.userId, course.id) : false;
  const dashboardHref = session?.role === "admin" ? "/admin" : session?.role === "instructor" ? "/instructor" : "/dashboard";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader isAuthenticated={!!session} dashboardHref={dashboardHref} cartCount={cartItems.length} />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">{course.category}</span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{course.title}</h1>
            {course.subtitle && <p className="mt-3 text-lg text-slate-300">{course.subtitle}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" /> {avgRating} <span className="text-slate-400">({reviews.length} reviews)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {enrollCount} students
              </span>
              <span className="flex items-center gap-1.5 capitalize">
                <BarChart3 className="h-4 w-4" /> {course.level}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> English
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Avatar name={course.instructorName} src={course.instructorAvatar} className="h-10 w-10" />
              <div>
                <p className="text-sm font-semibold">{course.instructorName}</p>
                <p className="text-xs text-slate-400">{course.instructorHeadline || "Instructor"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-10 lg:col-span-2">
          {embedUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 shadow-md">
              <iframe className="h-full w-full" src={embedUrl} title={course.title} allowFullScreen />
            </div>
          ) : course.thumbnailUrl ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200">
              <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
            </div>
          ) : null}

          <div>
            <h2 className="text-xl font-bold text-slate-900">About this course</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600">{course.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-4">
            <div>
              <PlayCircle className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-lg font-bold text-slate-900">{totalLessons}</p>
              <p className="text-xs text-slate-500">Lessons</p>
            </div>
            <div>
              <Clock className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-lg font-bold text-slate-900">{totalMinutes}m</p>
              <p className="text-xs text-slate-500">Total length</p>
            </div>
            <div>
              <Award className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-lg font-bold text-slate-900">Yes</p>
              <p className="text-xs text-slate-500">Certificate</p>
            </div>
            <div>
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-lg font-bold text-slate-900">Lifetime</p>
              <p className="text-xs text-slate-500">Access</p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Course curriculum</h2>
            <CourseCurriculum modules={modules} />
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Student reviews</h2>
            <ReviewsList reviews={reviews} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <CoursePurchaseCard
            course={{
              id: course.id,
              price: String(course.price),
              discountPrice: course.discountPrice ? String(course.discountPrice) : null,
              thumbnailUrl: course.thumbnailUrl,
            }}
            isAuthenticated={!!session}
            alreadyInCart={alreadyInCart}
            alreadyEnrolled={alreadyEnrolled}
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
