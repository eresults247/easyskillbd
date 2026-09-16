"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Play, Sparkles, Users, BookOpen, Award, X } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";

const stats = [
  { icon: Users, label: "Active learners", value: "48K+" },
  { icon: BookOpen, label: "Expert-led courses", value: "320+" },
  { icon: Award, label: "Certificates issued", value: "12K+" },
];

export function Hero() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-24 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5" /> New cohorts starting every month
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Learn skills that
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> move your career </span>
            forward
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Skillio is an all-in-one learning platform for students, instructors and admins — with live classes,
            hands-on projects, quizzes, assignments and certificates.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LinkButton href="#courses" size="lg">
              Explore courses
            </LinkButton>
            <button
              onClick={() => setVideoOpen(true)}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:shadow-md"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-transform group-hover:scale-110">
                <Play className="h-4 w-4 fill-white" />
              </span>
              Watch intro video
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i + 0.3, duration: 0.5 }}
              >
                <s.icon className="h-5 w-5 text-indigo-600" />
                <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <button
            onClick={() => setVideoOpen(true)}
            className="group relative block w-full overflow-hidden rounded-3xl border border-slate-200 shadow-2xl shadow-indigo-900/10"
          >
            <img
              src="https://img.youtube.com/vi/eIho2S0ZahI/maxresdefault.jpg"
              alt="Watch Skillio intro"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow-xl"
            >
              <Play className="h-7 w-7 fill-indigo-600" />
            </motion.span>
            <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-left backdrop-blur">
              <p className="text-xs font-semibold text-slate-800">2:14 min · Platform overview</p>
            </div>
          </button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -right-6 -top-6 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block"
          >
            <p className="text-xs text-slate-500">Course completion</p>
            <p className="text-xl font-bold text-emerald-600">94%</p>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {videoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/eIho2S0ZahI?autoplay=1&rel=0"
                title="Skillio intro video"
                allow="accelerate; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
