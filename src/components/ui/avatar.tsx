import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import Image from "next/image";

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={40}
        height={40}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white",
        className,
      )}
    >
      {initials(name || "U")}
    </div>
  );
}
