import "dotenv/config";
import { db, pool } from "@/db";
import {
  users,
  courses,
  modules,
  lessons,
  enrollments,
  lessonProgress,
  reviews,
  certificates,
  discussions,
  quizzes,
  quizQuestions,
  assignments,
  assignmentSubmissions,
  orders,
  orderItems,
  cartItems,
} from "@/db/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean tables (order matters due to FKs, but cascade handles most)
  await db.delete(users);

  const password = await hash("password123");

  // ---------- Users ----------
  const [admin] = await db
    .insert(users)
    .values({
      name: "Nadia Rahman",
      email: "admin@skillio.dev",
      passwordHash: password,
      role: "admin",
      status: "active",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      headline: "Platform Administrator",
    })
    .returning();

  const [sarah, marcus, priya] = await db
    .insert(users)
    .values([
      {
        name: "Sarah Chen",
        email: "sarah.instructor@skillio.dev",
        passwordHash: password,
        role: "instructor",
        status: "active",
        avatarUrl: "https://i.pravatar.cc/150?img=32",
        headline: "Senior Full-Stack Engineer @ Stripe",
        bio: "10+ years building web applications. Passionate about teaching modern JavaScript and React.",
      },
      {
        name: "Marcus Lee",
        email: "marcus.instructor@skillio.dev",
        passwordHash: password,
        role: "instructor",
        status: "active",
        avatarUrl: "https://i.pravatar.cc/150?img=13",
        headline: "Lead Product Designer @ Figma",
        bio: "Design systems expert helping thousands of students master UI/UX.",
      },
      {
        name: "Dr. Priya Sharma",
        email: "priya.instructor@skillio.dev",
        passwordHash: password,
        role: "instructor",
        status: "pending",
        avatarUrl: "https://i.pravatar.cc/150?img=45",
        headline: "Data Scientist @ Google",
        bio: "PhD in Machine Learning. Loves teaching Python and data science to beginners.",
      },
    ])
    .returning();

  const studentNames = [
    ["Alex Johnson", "alex.student@skillio.dev"],
    ["Emma Wilson", "emma.wilson@skillio.dev"],
    ["Liam Brown", "liam.brown@skillio.dev"],
    ["Olivia Davis", "olivia.davis@skillio.dev"],
    ["Noah Martinez", "noah.martinez@skillio.dev"],
    ["Ava Garcia", "ava.garcia@skillio.dev"],
    ["Ethan Miller", "ethan.miller@skillio.dev"],
    ["Sophia Anderson", "sophia.anderson@skillio.dev"],
  ];

  const studentRows = await db
    .insert(users)
    .values(
      studentNames.map(([name, email], i) => ({
        name,
        email,
        passwordHash: password,
        role: "student" as const,
        status: "active" as const,
        avatarUrl: `https://i.pravatar.cc/150?img=${i + 1}`,
      })),
    )
    .returning();

  const [alex, emma, liam, olivia, noah, ava, ethan, sophia] = studentRows;

  // ---------- Courses ----------
  const [webDevCourse] = await db
    .insert(courses)
    .values({
      title: "Full-Stack Web Development Bootcamp",
      slug: "full-stack-web-development-bootcamp",
      subtitle: "Build and deploy modern web apps with React, Node.js, and PostgreSQL",
      description:
        "Go from zero to hero in full-stack web development. Learn HTML, CSS, JavaScript, React, Node.js, Express, and PostgreSQL while building real-world projects including an e-commerce store and a social media app. By the end, you'll have a professional portfolio ready for job applications.",
      thumbnailUrl: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
      promoVideoUrl: "https://www.youtube.com/watch?v=eIho2S0ZahI",
      category: "Web Development",
      level: "beginner",
      price: "89.99",
      discountPrice: "49.99",
      status: "published",
      instructorId: sarah.id,
    })
    .returning();

  const [uiuxCourse] = await db
    .insert(courses)
    .values({
      title: "UI/UX Design Masterclass",
      slug: "ui-ux-design-masterclass",
      subtitle: "Design beautiful, user-friendly interfaces from scratch using Figma",
      description:
        "Master the principles of user experience and interface design. This course covers design thinking, wireframing, prototyping, usability testing, and how to build a stunning design portfolio using industry-standard tools like Figma.",
      thumbnailUrl: "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg",
      promoVideoUrl: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
      category: "UI/UX Design",
      level: "intermediate",
      price: "69.99",
      discountPrice: "39.99",
      status: "published",
      instructorId: marcus.id,
    })
    .returning();

  const [dataScienceCourse] = await db
    .insert(courses)
    .values({
      title: "Data Science with Python",
      slug: "data-science-with-python",
      subtitle: "Analyze data, build ML models, and tell stories with data",
      description:
        "Learn data science from the ground up using Python, Pandas, NumPy, Matplotlib and Scikit-learn. Includes hands-on projects in data cleaning, visualization, and machine learning model building for real-world datasets.",
      thumbnailUrl: "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg",
      promoVideoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      category: "Data Science",
      level: "advanced",
      price: "99.99",
      discountPrice: "59.99",
      status: "published",
      instructorId: priya.id,
    })
    .returning();

  const [marketingCourse] = await db
    .insert(courses)
    .values({
      title: "Digital Marketing Fundamentals",
      slug: "digital-marketing-fundamentals",
      subtitle: "SEO, social media, and paid ads for absolute beginners",
      description:
        "Understand the fundamentals of digital marketing including SEO, content marketing, social media strategy, and running effective ad campaigns on Google and Meta.",
      thumbnailUrl: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg",
      promoVideoUrl: "https://www.youtube.com/watch?v=nU-IIXBWlS4",
      category: "Marketing",
      level: "beginner",
      price: "0",
      status: "published",
      instructorId: sarah.id,
    })
    .returning();

  // ---------- Helper to build modules + lessons ----------
  async function buildCurriculum(
    courseId: string,
    data: { title: string; lessons: { title: string; duration: number; free?: boolean; content: string; video: string }[] }[],
  ) {
    const createdModules = [];
    for (let i = 0; i < data.length; i++) {
      const [mod] = await db.insert(modules).values({ courseId, title: data[i].title, position: i }).returning();
      const lessonRows = await db
        .insert(lessons)
        .values(
          data[i].lessons.map((l, li) => ({
            moduleId: mod.id,
            title: l.title,
            contentHtml: `<p>${l.content}</p><ul><li>Key concept walkthrough</li><li>Live coding demo</li><li>Practice challenge</li></ul>`,
            videoUrl: l.video,
            durationMinutes: l.duration,
            position: li,
            isFreePreview: !!l.free,
            resources: [
              { name: "Lesson slides.pdf", url: "https://example.com/resources/slides.pdf" },
              { name: "Starter code.zip", url: "https://example.com/resources/starter-code.zip" },
            ],
          })),
        )
        .returning();
      createdModules.push({ module: mod, lessons: lessonRows });
    }
    return createdModules;
  }

  const sampleVideo = "https://www.youtube.com/watch?v=eIho2S0ZahI";

  const webDevModules = await buildCurriculum(webDevCourse.id, [
    {
      title: "Getting Started with the Web",
      lessons: [
        { title: "How the internet works", duration: 8, free: true, content: "Understand clients, servers and HTTP.", video: sampleVideo },
        { title: "Setting up your dev environment", duration: 12, free: true, content: "Install VS Code, Node.js and Git.", video: sampleVideo },
        { title: "HTML & CSS crash course", duration: 20, content: "Structure and style your first web page.", video: sampleVideo },
      ],
    },
    {
      title: "JavaScript Essentials",
      lessons: [
        { title: "Variables, types & functions", duration: 18, content: "Core JS building blocks.", video: sampleVideo },
        { title: "DOM manipulation", duration: 22, content: "Make pages interactive.", video: sampleVideo },
        { title: "Async JS & fetch API", duration: 25, content: "Working with promises and APIs.", video: sampleVideo },
      ],
    },
    {
      title: "React & Front-End Architecture",
      lessons: [
        { title: "React components & props", duration: 20, content: "Build reusable UI components.", video: sampleVideo },
        { title: "State & hooks", duration: 24, content: "Manage state with useState and useEffect.", video: sampleVideo },
      ],
    },
    {
      title: "Back-End with Node & PostgreSQL",
      lessons: [
        { title: "Building REST APIs with Express", duration: 26, content: "Design and build APIs.", video: sampleVideo },
        { title: "Database design with PostgreSQL", duration: 22, content: "Model relational data.", video: sampleVideo },
        { title: "Deploying your full-stack app", duration: 15, content: "Ship your app to production.", video: sampleVideo },
      ],
    },
  ]);

  const uiuxModules = await buildCurriculum(uiuxCourse.id, [
    {
      title: "Design Thinking Foundations",
      lessons: [
        { title: "What is UX design?", duration: 10, free: true, content: "Introduction to UX principles.", video: sampleVideo },
        { title: "User research methods", duration: 16, content: "Interviews, surveys and personas.", video: sampleVideo },
      ],
    },
    {
      title: "Wireframing & Prototyping",
      lessons: [
        { title: "Low-fidelity wireframes", duration: 14, content: "Sketch your first wireframes.", video: sampleVideo },
        { title: "Figma fundamentals", duration: 20, content: "Master the Figma toolkit.", video: sampleVideo },
        { title: "Interactive prototypes", duration: 18, content: "Bring your designs to life.", video: sampleVideo },
      ],
    },
    {
      title: "Visual Design & Design Systems",
      lessons: [
        { title: "Typography & color theory", duration: 15, content: "Build a strong visual language.", video: sampleVideo },
        { title: "Building a design system", duration: 22, content: "Create reusable components.", video: sampleVideo },
      ],
    },
  ]);

  const dsModules = await buildCurriculum(dataScienceCourse.id, [
    {
      title: "Python for Data Science",
      lessons: [
        { title: "Python basics refresher", duration: 15, free: true, content: "Variables, loops, functions.", video: sampleVideo },
        { title: "NumPy & Pandas essentials", duration: 24, content: "Data manipulation basics.", video: sampleVideo },
      ],
    },
    {
      title: "Data Visualization",
      lessons: [
        { title: "Matplotlib & Seaborn", duration: 20, content: "Create compelling visualizations.", video: sampleVideo },
        { title: "Exploratory data analysis", duration: 22, content: "Uncover insights from data.", video: sampleVideo },
      ],
    },
    {
      title: "Machine Learning Basics",
      lessons: [
        { title: "Intro to Scikit-learn", duration: 25, content: "Build your first ML model.", video: sampleVideo },
        { title: "Regression & classification", duration: 28, content: "Supervised learning techniques.", video: sampleVideo },
        { title: "Model evaluation", duration: 18, content: "Measure and improve accuracy.", video: sampleVideo },
      ],
    },
  ]);

  const marketingModules = await buildCurriculum(marketingCourse.id, [
    {
      title: "Marketing Foundations",
      lessons: [
        { title: "Digital marketing overview", duration: 10, free: true, content: "The digital marketing landscape.", video: sampleVideo },
        { title: "Understanding your audience", duration: 12, content: "Building buyer personas.", video: sampleVideo },
      ],
    },
    {
      title: "SEO & Content",
      lessons: [
        { title: "SEO fundamentals", duration: 18, content: "Rank higher on search engines.", video: sampleVideo },
        { title: "Content marketing strategy", duration: 16, content: "Create content that converts.", video: sampleVideo },
      ],
    },
  ]);

  // ---------- Quizzes ----------
  async function addQuiz(moduleId: string, title: string, questions: { q: string; options: string[]; correct: number }[]) {
    const [quiz] = await db.insert(quizzes).values({ moduleId, title, passingScore: 70 }).returning();
    await db.insert(quizQuestions).values(
      questions.map((q, i) => ({
        quizId: quiz.id,
        question: q.q,
        options: q.options,
        correctIndex: q.correct,
        position: i,
      })),
    );
    return quiz;
  }

  await addQuiz(webDevModules[1].module.id, "JavaScript Essentials Quiz", [
    { q: "Which keyword declares a block-scoped variable?", options: ["var", "let", "function", "global"], correct: 1 },
    { q: "What does DOM stand for?", options: ["Data Object Model", "Document Object Model", "Display Object Mode", "Digital Object Method"], correct: 1 },
    { q: "Which method fetches data from an API?", options: ["fetch()", "get()", "request()", "load()"], correct: 0 },
  ]);

  await addQuiz(uiuxModules[0].module.id, "UX Foundations Quiz", [
    { q: "What is the primary goal of UX design?", options: ["Make things pretty", "Improve user satisfaction", "Increase code speed", "Reduce server cost"], correct: 1 },
    { q: "Which is a common user research method?", options: ["Compiling", "A/B testing servers", "User interviews", "Refactoring"], correct: 2 },
  ]);

  await addQuiz(dsModules[0].module.id, "Python Basics Quiz", [
    { q: "Which library is used for numerical computing in Python?", options: ["NumPy", "Django", "Flask", "Bootstrap"], correct: 0 },
    { q: "Pandas DataFrame is best described as?", options: ["A single number", "A 2D labeled data structure", "A CSS style", "A loop type"], correct: 1 },
  ]);

  // ---------- Assignments ----------
  const [webAssignment1] = await db
    .insert(assignments)
    .values({
      courseId: webDevCourse.id,
      title: "Build a personal portfolio landing page",
      description: "Create a responsive landing page using HTML & CSS showcasing your projects and skills.",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    })
    .returning();

  const [webAssignment2] = await db
    .insert(assignments)
    .values({
      courseId: webDevCourse.id,
      title: "REST API for a Todo app",
      description: "Build a CRUD REST API using Express and PostgreSQL for a todo list application.",
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    })
    .returning();

  const [uiuxAssignment] = await db
    .insert(assignments)
    .values({
      courseId: uiuxCourse.id,
      title: "Redesign a mobile app screen",
      description: "Pick an existing app and redesign one screen applying the design principles learned.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    })
    .returning();

  const [dsAssignment] = await db
    .insert(assignments)
    .values({
      courseId: dataScienceCourse.id,
      title: "Exploratory Data Analysis Report",
      description: "Analyze a public dataset and present your findings with visualizations.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxScore: 100,
    })
    .returning();

  // ---------- Enrollments with varied progress ----------
  async function enroll(studentId: string, courseId: string, progress: number, courseModules: { lessons: { id: string }[] }[]) {
    const status = progress >= 100 ? "completed" : "active";
    const [enrollment] = await db
      .insert(enrollments)
      .values({ studentId, courseId, progressPercent: progress, status, completedAt: progress >= 100 ? new Date() : null })
      .returning();

    const allLessons = courseModules.flatMap((m) => m.lessons);
    const completeCount = Math.round((progress / 100) * allLessons.length);
    for (let i = 0; i < allLessons.length; i++) {
      await db.insert(lessonProgress).values({
        enrollmentId: enrollment.id,
        lessonId: allLessons[i].id,
        completed: i < completeCount,
        completedAt: i < completeCount ? new Date() : null,
      });
    }

    if (progress >= 100) {
      await db.insert(certificates).values({ enrollmentId: enrollment.id, certificateCode: `CERT-${nanoid(10).toUpperCase()}` });
    }

    return enrollment;
  }

  await enroll(alex.id, webDevCourse.id, 100, webDevModules);
  await enroll(alex.id, uiuxCourse.id, 45, uiuxModules);
  await enroll(alex.id, marketingCourse.id, 20, marketingModules);

  await enroll(emma.id, webDevCourse.id, 65, webDevModules);
  await enroll(emma.id, dataScienceCourse.id, 30, dsModules);

  await enroll(liam.id, uiuxCourse.id, 100, uiuxModules);
  await enroll(liam.id, webDevCourse.id, 10, webDevModules);

  await enroll(olivia.id, dataScienceCourse.id, 80, dsModules);
  await enroll(olivia.id, marketingCourse.id, 100, marketingModules);

  await enroll(noah.id, webDevCourse.id, 40, webDevModules);
  await enroll(ava.id, uiuxCourse.id, 15, uiuxModules);
  await enroll(ethan.id, dataScienceCourse.id, 55, dsModules);
  await enroll(sophia.id, webDevCourse.id, 90, webDevModules);
  await enroll(sophia.id, uiuxCourse.id, 100, uiuxModules);

  // ---------- Reviews ----------
  await db.insert(reviews).values([
    { courseId: webDevCourse.id, studentId: alex.id, rating: 5, comment: "This bootcamp completely changed my career. I landed a job as a junior dev right after finishing!" },
    { courseId: webDevCourse.id, studentId: emma.id, rating: 5, comment: "Sarah explains complex concepts so clearly. The projects are portfolio-ready." },
    { courseId: webDevCourse.id, studentId: noah.id, rating: 4, comment: "Great course overall, would love more advanced deployment content." },
    { courseId: webDevCourse.id, studentId: sophia.id, rating: 5, comment: "Best full-stack course I've taken online. Highly recommend!" },
    { courseId: uiuxCourse.id, studentId: liam.id, rating: 5, comment: "Marcus is an amazing teacher. My Figma skills are on another level now." },
    { courseId: uiuxCourse.id, studentId: ava.id, rating: 4, comment: "Loved the design system module, super practical." },
    { courseId: uiuxCourse.id, studentId: sophia.id, rating: 5, comment: "Beautifully structured course with real design challenges." },
    { courseId: dataScienceCourse.id, studentId: olivia.id, rating: 5, comment: "Finally a data science course that makes ML approachable!" },
    { courseId: dataScienceCourse.id, studentId: ethan.id, rating: 4, comment: "Solid content, the EDA project was very insightful." },
    { courseId: marketingCourse.id, studentId: olivia.id, rating: 5, comment: "Free and incredibly valuable. Great intro to digital marketing." },
  ]);

  // ---------- Discussions ----------
  const firstWebLesson = webDevModules[0].lessons[0];
  const firstUiuxLesson = uiuxModules[0].lessons[0];

  await db.insert(discussions).values([
    { lessonId: firstWebLesson.id, userId: alex.id, message: "Great intro! Quick question — does HTTP/2 change how we should structure requests?" },
    { lessonId: firstWebLesson.id, userId: sarah.id, message: "Great question! HTTP/2 allows multiplexing, so bundling isn't as critical as before. We'll cover this more in the deployment module." },
    { lessonId: firstWebLesson.id, userId: emma.id, message: "This cleared up so much confusion for me, thank you!" },
    { lessonId: firstUiuxLesson.id, userId: liam.id, message: "What tool do you recommend for user interviews when working remotely?" },
    { lessonId: firstUiuxLesson.id, userId: marcus.id, message: "I recommend Zoom + Notion for notes, or dedicated tools like UserTesting.com for larger studies." },
  ]);

  // ---------- Assignment submissions ----------
  await db.insert(assignmentSubmissions).values([
    {
      assignmentId: webAssignment1.id,
      studentId: alex.id,
      content: "Here's my portfolio landing page built with semantic HTML and flexbox layout. Link: https://github.com/alex/portfolio",
      fileUrl: "https://github.com/alex/portfolio",
      grade: 95,
      feedback: "Excellent work! Clean structure and great responsive behavior. Consider adding more micro-interactions.",
      gradedAt: new Date(),
    },
    {
      assignmentId: webAssignment1.id,
      studentId: emma.id,
      content: "Submitted my landing page, used CSS grid for the projects section.",
      fileUrl: "https://github.com/emma/landing-page",
    },
    {
      assignmentId: webAssignment2.id,
      studentId: sophia.id,
      content: "Built the Todo REST API with full CRUD and JWT auth.",
      fileUrl: "https://github.com/sophia/todo-api",
      grade: 88,
      feedback: "Solid implementation. Add input validation middleware next time.",
      gradedAt: new Date(),
    },
    {
      assignmentId: uiuxAssignment.id,
      studentId: liam.id,
      content: "Redesigned the Spotify mobile player screen focusing on accessibility contrast.",
      fileUrl: "https://figma.com/liam-redesign",
      grade: 92,
      feedback: "Beautiful redesign! Great use of color contrast and spacing.",
      gradedAt: new Date(),
    },
    {
      assignmentId: dsAssignment.id,
      studentId: olivia.id,
      content: "Analyzed the Titanic dataset with full EDA notebook and visualizations.",
      fileUrl: "https://github.com/olivia/titanic-eda",
    },
  ]);

  // ---------- Orders (bKash payments) ----------
  const [verifiedOrder] = await db
    .insert(orders)
    .values({
      userId: noah.id,
      totalAmount: "49.99",
      status: "verified",
      paymentMethod: "bkash",
      bkashNumber: "01812345678",
      transactionId: "8N3K7L2QRT",
      verifiedAt: new Date(),
    })
    .returning();
  await db.insert(orderItems).values({ orderId: verifiedOrder.id, courseId: webDevCourse.id, price: "49.99" });

  const [pendingOrder] = await db
    .insert(orders)
    .values({
      userId: ava.id,
      totalAmount: "39.99",
      status: "pending",
      paymentMethod: "bkash",
      bkashNumber: "01911223344",
      transactionId: "9F3K7L2QRT",
    })
    .returning();
  await db.insert(orderItems).values({ orderId: pendingOrder.id, courseId: uiuxCourse.id, price: "39.99" });

  const [pendingOrder2] = await db
    .insert(orders)
    .values({
      userId: ethan.id,
      totalAmount: "59.99",
      status: "pending",
      paymentMethod: "bkash",
      bkashNumber: "01755667788",
      transactionId: "7X9M2P4LQR",
    })
    .returning();
  await db.insert(orderItems).values({ orderId: pendingOrder2.id, courseId: dataScienceCourse.id, price: "59.99" });

  // ---------- Cart items ----------
  await db.insert(cartItems).values([{ userId: noah.id, courseId: dataScienceCourse.id }]);

  console.log("✅ Seed complete!");
  console.log(`Admin: admin@skillio.dev / password123`);
  console.log(`Instructor: sarah.instructor@skillio.dev / password123`);
  console.log(`Student: alex.student@skillio.dev / password123`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
