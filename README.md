# 🚀 EasySkillBD - Deploy & Setup Guide (স্থানীয় সার্ভার এবং Vercel ডেপ্লয়মেন্ট গাইড)

**EasySkillBD** হলো Next.js (App Router), Supabase এবং Prisma দিয়ে তৈরি একটি আধুনিক লার্নিং ম্যানেজমেন্ট সিস্টেম (LMS)। এই ডকুমেন্টেশনে সহজ ভাষায় ধাপে ধাপে দেখানো হয়েছে কীভাবে প্রজেক্টটি লোকালহোস্টে রান করবেন এবং Vercel-এ লাইভ ডেপ্লয় করবেন।

---

## 📋 সূচিপত্র (Table of Contents)
1. [প্রয়োজনীয় টুলস (Prerequisites)](#-প্রয়োজনীয়-টুলস-prerequisites)
2. [লোকালহোস্ট ইনস্টলেশন ও সেটআপ (Local Host Setup)](#-লোকালহোস্ট-ইনস্টলেশন-ও-সেটআপ-local-host-setup)
3. [Supabase ও Prisma ডাটাবেস সেটআপ (Database Setup)](#-supabase-ও-prisma-ডাটাবেস-সেটআপ-database-setup)
4. [Vercel-এ লাইভ ডেপ্লয়মেন্ট (Vercel Deployment)](#-vercel-এ-লাইভ-ডেপ্লয়মেন্ট-vercel-deployment)
5. [পরিবেশ ভেরিয়েবল নির্দেশিকা (Environment Variables)](#-পরিবেশ-ভেরিয়েবল-নির্দেশিকা-environment-variables)
6. [সাধারণ সমস্যা ও সমাধান (Troubleshooting)](#-সাধারণ-সমস্যা-ও-সমাধান-troubleshooting)

---

## 🛠️ প্রয়োজনীয় টুলস (Prerequisites)

প্রজেক্টটি শুরু করার আগে আপনার পিসিতে নিচের টুলসগুলো ইনস্টল করা থাকতে হবে:

- **Node.js** (Version 18.0.0 বা তার উপরে) -> [Download Node.js](https://nodejs.org/)
- **Git** -> [Download Git](https://git-scm.com/)
- **Supabase Account** -> [Create Supabase Account](https://supabase.com/)
- **Vercel Account** -> [Create Vercel Account](https://vercel.com/)
- **Code Editor** (VS Code বা Cursor)

---

## 💻 লোকালহোস্ট ইনস্টলেশন ও সেটআপ (Local Host Setup)

### ধাপ ১: প্রজেক্ট ক্লোন করুন
টার্মিনাল বা কমান্ড প্রম্পট খুলে কমান্ডটি রান করুন:
```bash
git clone https://github.com/your-username/easyskillbd.git
cd easyskillbd
```

### ধাপ ২: ডিপেন্ডেন্সি প্যাকেজ ইনস্টল করুন
```bash
npm install
# অথবা
yarn install
# অথবা
pnpm install
```

### ধাপ ৩: Environment Variables (.env) ফাইল তৈরি করুন
প্রজেক্টের রুট ডিরেক্টরিতে একটি `.env.local` ফাইল তৈরি করুন এবং নিচের মানগুলো বসান:

```env
# Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Prisma Database Connections (Direct & Pooled)
DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth / App Secret
NEXTAUTH_SECRET=your-random-super-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### ধাপ ৪: ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
এখন আপনার ব্রাউজারে `http://localhost:3000` ওপেন করলে EasySkillBD প্রজেক্টটি দেখতে পাবেন।

---

## 🗄️ Supabase ও Prisma ডাটাবেস সেটআপ (Database Setup)

১. **Supabase Project তৈরি:**
   - Supabase ড্যাশবোর্ডে গিয়ে নতুন প্রজেক্ট তৈরি করুন।
   - **Database Password** টি সাবধানে সংরক্ষণ করুন।

2. **Prisma Migration ও Database Push:**
   আপনার ডাটাবেসে স্কিমা টেবিল তৈরি করতে লোকাল টার্মিনালে নিচের কমান্ডটি দিন:
   ```bash
   npx prisma db push
   ```

৩. **ডামি ডাটা বা Seed Data যোগ করা:**
   প্রজেক্টে ৩টি ডেমো কোর্স, রিভিউ এবং সাইট সেটিংস যোগ করতে রান করুন:
   ```bash
   npx prisma db seed
   ```

৪. **Supabase Storage Bucket তৈরি:**
   - Supabase Dashboard -> **Storage**-এ যান।
   - `course-media`, `thumbnails`, এবং `avatars` নামে Public Buckets তৈরি করুন যাতে ছবি ও ফাইল আপলোড করা যায়।

---

## 🚀 Vercel-এ লাইভ ডেপ্লয়মেন্ট (Vercel Deployment)

### ধাপ ১: প্রজেক্ট GitHub-এ পুশ করুন
আপনার সমস্ত কোড GitHub রিপোজিটরিতে আপডেট করুন:
```bash
git add .
git commit -m "Ready for Vercel Deployment"
git push origin main
```

### ধাপ ২: Vercel-এ প্রজেক্ট ইম্পোর্ট করুন
১. [Vercel Dashboard](https://vercel.com/dashboard)-এ যান এবং **"Add New..."** -> **"Project"** এ ক্লিক করুন।
২. আপনার GitHub অ্যাকাউন্ট কানেক্ট করে **`easyskillbd`** রিপোজিটরিটি চয়ন (Select) করুন।

### ধাপ ৩: Environment Variables যোগ করুন
Vercel-এর **Environment Variables** সেকশনে আপনার `.env.local` ফাইলের সবকটি Key এবং Value কপি করে পেস্ট করে দিন:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` (এখানে Vercel-এর দেওয়া ডোমেইন বসাবেন, যেমন: `https://easyskillbd.vercel.app`)

### ধাপ ৪: Build Command সামঞ্জস্য করা (Prisma Integration)
Vercel যেন বিল্ড হওয়ার সময় Prisma Client সঠিকভাবে জেনারেট করতে পারে, সে জন্য `package.json` ফাইলের `scripts` সেকশনে নিচের মতো করে নিন:
```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "next lint"
}
```

### ধাপ ৫: Deploy-এ ক্লিক করুন
সবকিছু ঠিক থাকলে **"Deploy"** বাটনে ক্লিক করুন। ২-৩ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে! 🎉

---

## 🔑 পরিবেশ ভেরিয়েবল নির্দেশিকা (Environment Variables)

| Variable Name | বিবরণ (Description) |
| :--- | :--- |
| `DATABASE_URL` | Supabase Transaction Connection String (Port 6543 - PgBouncer) |
| `DIRECT_URL` | Supabase Direct Session Connection String (Port 5432 - Prisma Migration-এর জন্য) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Client Key |
| `NEXTAUTH_SECRET` | সেশন সিকিউরিটির জন্য র্যান্ডম হ্যাশ স্ট্রিং (`openssl rand -base64 32` দিয়ে বানাতে পারেন) |

---

## ❓ সাধারণ সমস্যা ও সমাধান (Troubleshooting)

### ১. Prisma Engine Error / Vercel Build Failure
**সমস্যা:** Vercel বিল্ড হওয়ার সময় Prisma Engine খুঁজে না পাওয়া।
**সমাধান:** `schema.prisma` ফাইলে `binaryTargets` চেক করুন:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]
}
```

### ২. Supabase Database Connection Timeout
**সমস্যা:** `DATABASE_URL` কানেক্ট হতে বেশি সময় নিচ্ছে।
**সমাধান:** Vercel Serverless Function-এর ক্ষেত্রে অবশ্যই Connection Pooling URL (`Port 6543` / PgBouncer) ব্যবহার করবেন এবং `DIRECT_URL`-এ Direct Connection (`Port 5432`) ব্যবহার করবেন।

### ৩. CORS or Image Optimization Error
**সমস্যা:** Supabase Storage-এর ছবি বা থাম্বনেল লোড হচ্ছে না।
**সমাধান:** `next.config.js` ফাইলে Supabase ডোমেইন এলাউ করুন:
```js
/** @type {import('next').NextModel} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
```

---

**EasySkillBD Contact & Support:**
- 📞 Phone: +8801715710019
- ✉️ Email: info.easyskill@gmail.com
- 📍 Address: Ghatail-1980, Tangail, Dhaka, Bangladesh
