import "server-only";
import { db } from "@/db";
import {
  courses,
  users,
  modules,
  lessons,
  enrollments,
  reviews,
  lessonProgress,
  assignments,
  assignmentSubmissions,
  certificates,
  quizzes,
  quizQuestions,
  orders,
  orderItems,
  discussions,
  visitorPings,
} from "@/db/schema";
import { and, avg, count, desc, eq, gte, inArray, sql } from "drizzle-orm";

export async function getPublishedCourses(limit?: number) {
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      thumbnailUrl: courses.thumbnailUrl,
      category: courses.category,
      level: courses.level,
      price: courses.price,
      discountPrice: courses.discountPrice,
      instructorName: users.name,
      instructorId: users.id,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(courses.status, "published"))
    .orderBy(desc(courses.createdAt))
    .limit(limit ?? 100);

  const ids = rows.map((r) => r.id);
  const ratings = ids.length
    ? await db
        .select({ courseId: reviews.courseId, avgRating: avg(reviews.rating), count: count(reviews.id) })
        .from(reviews)
        .where(inArray(reviews.courseId, ids))
        .groupBy(reviews.courseId)
    : [];
  const enrollCounts = ids.length
    ? await db
        .select({ courseId: enrollments.courseId, total: count(enrollments.id) })
        .from(enrollments)
        .where(inArray(enrollments.courseId, ids))
        .groupBy(enrollments.courseId)
    : [];

  const ratingMap = new Map(ratings.map((r) => [r.courseId, r]));
  const enrollMap = new Map(enrollCounts.map((r) => [r.courseId, r.total]));

  return rows.map((r) => ({
    ...r,
    rating: ratingMap.get(r.id)?.avgRating ? Number(ratingMap.get(r.id)?.avgRating).toFixed(1) : "5.0",
    reviewCount: ratingMap.get(r.id)?.count ?? 0,
    enrollCount: enrollMap.get(r.id) ?? 0,
  }));
}

export async function getCourseBySlug(slug: string) {
  const [course] = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      subtitle: courses.subtitle,
      description: courses.description,
      thumbnailUrl: courses.thumbnailUrl,
      promoVideoUrl: courses.promoVideoUrl,
      category: courses.category,
      level: courses.level,
      price: courses.price,
      discountPrice: courses.discountPrice,
      status: courses.status,
      instructorId: courses.instructorId,
      instructorName: users.name,
      instructorHeadline: users.headline,
      instructorAvatar: users.avatarUrl,
      instructorBio: users.bio,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(courses.slug, slug))
    .limit(1);

  if (!course) return null;

  const moduleRows = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(modules.position);

  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(lessons.position)
    : [];

  const modulesWithLessons = moduleRows.map((m) => ({
    ...m,
    lessons: lessonRows.filter((l) => l.moduleId === m.id),
  }));

  const courseReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      studentName: users.name,
      studentAvatar: users.avatarUrl,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.studentId, users.id))
    .where(eq(reviews.courseId, course.id))
    .orderBy(desc(reviews.createdAt));

  const [enrollStat] = await db
    .select({ total: count(enrollments.id) })
    .from(enrollments)
    .where(eq(enrollments.courseId, course.id));

  const totalLessons = lessonRows.length;
  const totalMinutes = lessonRows.reduce((sum, l) => sum + l.durationMinutes, 0);

  return {
    course,
    modules: modulesWithLessons,
    reviews: courseReviews,
    enrollCount: enrollStat?.total ?? 0,
    totalLessons,
    totalMinutes,
  };
}

export async function getFeaturedReviews(limit = 8) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      studentName: users.name,
      studentAvatar: users.avatarUrl,
      courseTitle: courses.title,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.studentId, users.id))
    .innerJoin(courses, eq(reviews.courseId, courses.id))
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit);
}

export async function getStudentEnrollments(studentId: string) {
  const rows = await db
    .select({
      enrollmentId: enrollments.id,
      status: enrollments.status,
      progressPercent: enrollments.progressPercent,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      courseId: courses.id,
      courseSlug: courses.slug,
      courseTitle: courses.title,
      courseThumbnail: courses.thumbnailUrl,
      instructorName: users.name,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(enrollments.studentId, studentId))
    .orderBy(desc(enrollments.enrolledAt));
  return rows;
}

export async function getEnrollment(studentId: string, courseId: string) {
  const [row] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);
  return row ?? null;
}

export async function getCourseLearnData(courseId: string, studentId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) return null;

  const moduleRows = await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(modules.position);
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(lessons.position)
    : [];

  const quizRows = moduleIds.length
    ? await db.select().from(quizzes).where(inArray(quizzes.moduleId, moduleIds))
    : [];
  const quizIds = quizRows.map((q) => q.id);
  const questionRows = quizIds.length
    ? await db.select().from(quizQuestions).where(inArray(quizQuestions.quizId, quizIds)).orderBy(quizQuestions.position)
    : [];

  const enrollment = await getEnrollment(studentId, courseId);
  let progressRows: { lessonId: string; completed: boolean }[] = [];
  if (enrollment) {
    progressRows = await db
      .select({ lessonId: lessonProgress.lessonId, completed: lessonProgress.completed })
      .from(lessonProgress)
      .where(eq(lessonProgress.enrollmentId, enrollment.id));
  }
  const completedSet = new Set(progressRows.filter((p) => p.completed).map((p) => p.lessonId));

  const modulesWithLessons = moduleRows.map((m) => ({
    ...m,
    lessons: lessonRows.filter((l) => l.moduleId === m.id).map((l) => ({ ...l, completed: completedSet.has(l.id) })),
    quiz: quizRows
      .filter((q) => q.moduleId === m.id)
      .map((q) => ({ ...q, questions: questionRows.filter((qq) => qq.quizId === q.id) }))[0] ?? null,
  }));

  return { course, modules: modulesWithLessons, enrollment };
}

export async function getLessonById(lessonId: string) {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return lesson ?? null;
}

export async function getLessonDiscussions(lessonId: string) {
  return db
    .select({
      id: discussions.id,
      message: discussions.message,
      createdAt: discussions.createdAt,
      parentId: discussions.parentId,
      userId: discussions.userId,
      userName: users.name,
      userAvatar: users.avatarUrl,
      userRole: users.role,
    })
    .from(discussions)
    .innerJoin(users, eq(discussions.userId, users.id))
    .where(eq(discussions.lessonId, lessonId))
    .orderBy(discussions.createdAt);
}

export async function getStudentAssignments(studentId: string) {
  const enrolled = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentId));
  const courseIds = enrolled.map((e) => e.courseId);
  if (!courseIds.length) return [];

  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      dueDate: assignments.dueDate,
      maxScore: assignments.maxScore,
      courseId: assignments.courseId,
      courseTitle: courses.title,
    })
    .from(assignments)
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(inArray(assignments.courseId, courseIds))
    .orderBy(assignments.dueDate);

  const assignmentIds = rows.map((r) => r.id);
  const submissions = assignmentIds.length
    ? await db
        .select()
        .from(assignmentSubmissions)
        .where(
          and(
            inArray(assignmentSubmissions.assignmentId, assignmentIds),
            eq(assignmentSubmissions.studentId, studentId),
          ),
        )
    : [];
  const subMap = new Map(submissions.map((s) => [s.assignmentId, s]));

  return rows.map((r) => ({ ...r, submission: subMap.get(r.id) ?? null }));
}

export async function getStudentCertificates(studentId: string) {
  return db
    .select({
      id: certificates.id,
      certificateCode: certificates.certificateCode,
      issuedAt: certificates.issuedAt,
      courseTitle: courses.title,
      courseId: courses.id,
      studentName: users.name,
    })
    .from(certificates)
    .innerJoin(enrollments, eq(certificates.enrollmentId, enrollments.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(users, eq(enrollments.studentId, users.id))
    .where(eq(enrollments.studentId, studentId));
}

export async function getInstructorCourses(instructorId: string) {
  const rows = await db.select().from(courses).where(eq(courses.instructorId, instructorId)).orderBy(desc(courses.createdAt));
  const ids = rows.map((r) => r.id);
  const enrollCounts = ids.length
    ? await db
        .select({ courseId: enrollments.courseId, total: count(enrollments.id) })
        .from(enrollments)
        .where(inArray(enrollments.courseId, ids))
        .groupBy(enrollments.courseId)
    : [];
  const enrollMap = new Map(enrollCounts.map((r) => [r.courseId, r.total]));
  return rows.map((r) => ({ ...r, enrollCount: enrollMap.get(r.id) ?? 0 }));
}

export async function getInstructorAnalytics(instructorId: string) {
  const myCourses = await db.select({ id: courses.id, title: courses.title, price: courses.price }).from(courses).where(eq(courses.instructorId, instructorId));
  const courseIds = myCourses.map((c) => c.id);

  if (!courseIds.length) {
    return { totalRevenue: 0, totalEnrollments: 0, completionRate: 0, courses: [], monthlyRevenue: [] };
  }

  const enrollRows = await db.select().from(enrollments).where(inArray(enrollments.courseId, courseIds));
  const totalEnrollments = enrollRows.length;
  const completed = enrollRows.filter((e) => e.status === "completed").length;
  const completionRate = totalEnrollments ? Math.round((completed / totalEnrollments) * 100) : 0;

  const orderItemRows = await db
    .select({ price: orderItems.price, courseId: orderItems.courseId, orderId: orderItems.orderId })
    .from(orderItems)
    .where(inArray(orderItems.courseId, courseIds));

  const verifiedOrderIds = (
    await db.select({ id: orders.id, createdAt: orders.createdAt }).from(orders).where(eq(orders.status, "verified"))
  );
  const verifiedMap = new Map(verifiedOrderIds.map((o) => [o.id, o.createdAt]));

  let totalRevenue = 0;
  const monthly = new Map<string, number>();
  for (const item of orderItemRows) {
    const createdAt = verifiedMap.get(item.orderId);
    if (!createdAt) continue;
    totalRevenue += Number(item.price);
    const key = new Date(createdAt).toLocaleString("en-US", { month: "short" });
    monthly.set(key, (monthly.get(key) ?? 0) + Number(item.price));
  }

  const perCourse = myCourses.map((c) => {
    const enrolls = enrollRows.filter((e) => e.courseId === c.id);
    return {
      id: c.id,
      title: c.title,
      enrollments: enrolls.length,
      completed: enrolls.filter((e) => e.status === "completed").length,
    };
  });

  return {
    totalRevenue,
    totalEnrollments,
    completionRate,
    courses: perCourse,
    monthlyRevenue: Array.from(monthly.entries()).map(([month, revenue]) => ({ month, revenue })),
  };
}

export async function getAdminAnalytics() {
  const [userCount] = await db.select({ total: count(users.id) }).from(users);
  const [studentCount] = await db.select({ total: count(users.id) }).from(users).where(eq(users.role, "student"));
  const [instructorCount] = await db.select({ total: count(users.id) }).from(users).where(eq(users.role, "instructor"));
  const [courseCount] = await db.select({ total: count(courses.id) }).from(courses);
  const [publishedCount] = await db.select({ total: count(courses.id) }).from(courses).where(eq(courses.status, "published"));
  const [pendingCourseCount] = await db.select({ total: count(courses.id) }).from(courses).where(eq(courses.status, "pending"));
  const [pendingInstructorCount] = await db
    .select({ total: count(users.id) })
    .from(users)
    .where(and(eq(users.role, "instructor"), eq(users.status, "pending")));

  const verifiedOrders = await db.select().from(orders).where(eq(orders.status, "verified"));
  const totalRevenue = verifiedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const [pendingOrders] = await db.select({ total: count(orders.id) }).from(orders).where(eq(orders.status, "pending"));

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const todaysPings = await db.select({ sessionId: visitorPings.sessionId }).from(visitorPings).where(gte(visitorPings.createdAt, since));
  const todayVisitors = new Set(todaysPings.map((p) => p.sessionId)).size;

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlinePings = await db.select({ sessionId: visitorPings.sessionId }).from(visitorPings).where(gte(visitorPings.createdAt, fiveMinAgo));
  const onlineNow = new Set(onlinePings.map((p) => p.sessionId)).size;

  return {
    userCount: userCount?.total ?? 0,
    studentCount: studentCount?.total ?? 0,
    instructorCount: instructorCount?.total ?? 0,
    courseCount: courseCount?.total ?? 0,
    publishedCount: publishedCount?.total ?? 0,
    pendingCourseCount: pendingCourseCount?.total ?? 0,
    pendingInstructorCount: pendingInstructorCount?.total ?? 0,
    totalRevenue,
    pendingOrders: pendingOrders?.total ?? 0,
    todayVisitors,
    onlineNow,
  };
}

export async function getCartItemsForUser(userId: string) {
  const { cartItems } = await import("@/db/schema");
  const rows = await db
    .select({
      id: cartItems.id,
      courseId: courses.id,
      title: courses.title,
      slug: courses.slug,
      thumbnailUrl: courses.thumbnailUrl,
      price: courses.price,
      discountPrice: courses.discountPrice,
      instructorName: users.name,
    })
    .from(cartItems)
    .innerJoin(courses, eq(cartItems.courseId, courses.id))
    .innerJoin(users, eq(courses.instructorId, users.id))
    .where(eq(cartItems.userId, userId));
  return rows;
}

export async function isEnrolled(studentId: string, courseId: string) {
  const row = await getEnrollment(studentId, courseId);
  return !!row;
}

export async function courseWithSlugExists(slug: string) {
  const [row] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1);
  return !!row;
}

export async function getOrdersForAdmin() {
  const rows = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      bkashNumber: orders.bkashNumber,
      transactionId: orders.transactionId,
      createdAt: orders.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  const orderIds = rows.map((r) => r.id);
  const items = orderIds.length
    ? await db
        .select({ orderId: orderItems.orderId, courseTitle: courses.title })
        .from(orderItems)
        .innerJoin(courses, eq(orderItems.courseId, courses.id))
        .where(inArray(orderItems.orderId, orderIds))
    : [];

  return rows.map((r) => ({
    ...r,
    items: items.filter((i) => i.orderId === r.id).map((i) => i.courseTitle),
  }));
}

export async function getAllUsersForAdmin() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllCoursesForAdmin() {
  const rows = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      status: courses.status,
      price: courses.price,
      category: courses.category,
      createdAt: courses.createdAt,
      instructorName: users.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .orderBy(desc(courses.createdAt));
  return rows;
}

export async function getAssignmentSubmissionsForInstructor(instructorId: string) {
  const myCourses = await db.select({ id: courses.id, title: courses.title }).from(courses).where(eq(courses.instructorId, instructorId));
  const courseIds = myCourses.map((c) => c.id);
  if (!courseIds.length) return [];

  const assignmentRows = await db.select().from(assignments).where(inArray(assignments.courseId, courseIds));
  const assignmentIds = assignmentRows.map((a) => a.id);
  if (!assignmentIds.length) return [];

  const submissions = await db
    .select({
      id: assignmentSubmissions.id,
      content: assignmentSubmissions.content,
      fileUrl: assignmentSubmissions.fileUrl,
      submittedAt: assignmentSubmissions.submittedAt,
      grade: assignmentSubmissions.grade,
      feedback: assignmentSubmissions.feedback,
      assignmentId: assignmentSubmissions.assignmentId,
      studentName: users.name,
      studentAvatar: users.avatarUrl,
    })
    .from(assignmentSubmissions)
    .innerJoin(users, eq(assignmentSubmissions.studentId, users.id))
    .where(inArray(assignmentSubmissions.assignmentId, assignmentIds))
    .orderBy(desc(assignmentSubmissions.submittedAt));

  const courseMap = new Map(myCourses.map((c) => [c.id, c.title]));
  const assignmentMap = new Map(assignmentRows.map((a) => [a.id, a]));

  return submissions.map((s) => ({
    ...s,
    assignmentTitle: assignmentMap.get(s.assignmentId)?.title ?? "",
    courseTitle: courseMap.get(assignmentMap.get(s.assignmentId)?.courseId ?? "") ?? "",
    maxScore: assignmentMap.get(s.assignmentId)?.maxScore ?? 100,
  }));
}

export const dbHelpers = { sql };
