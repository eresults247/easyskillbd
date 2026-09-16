import Link from "next/link";
import { GraduationCap, Globe, MessageCircle, PlaySquare, Camera } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold text-white">Skillio</span>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            Learn in-demand skills from world-class instructors. Build your career with hands-on courses.
          </p>
          <div className="mt-5 flex gap-3">
            {[Globe, MessageCircle, PlaySquare, Camera].map((Icon, i) => (
              <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Platform</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="/#courses" className="hover:text-white">Browse Courses</a></li>
            <li><a href="/#become-instructor" className="hover:text-white">Teach on Skillio</a></li>
            <li><Link href="/sign-up" className="hover:text-white">Create account</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Support</p>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>help@skillio.dev</li>
            <li>+880 1234-567890</li>
            <li>Dhaka, Bangladesh</li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Payments</p>
          <p className="text-sm text-slate-400">We accept manual bKash payments. Submit your transaction ID at checkout and get enrolled after verification.</p>
        </div>
      </div>
      <div className="border-t border-slate-900 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Skillio. All rights reserved.
      </div>
    </footer>
  );
}
