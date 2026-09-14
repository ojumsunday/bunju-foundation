import { cn } from "@/lib/utils";

export function ProgressRing({ value, size = "lg" }: { value: number; size?: "sm" | "lg" }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const dimensions = size === "lg" ? "size-40" : "size-14";

  return (
    <div className={cn("relative", dimensions)} aria-label={`${value}% complete`}>
      <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-secondary" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary"
        />
      </svg>
      <span className={cn("absolute inset-0 grid place-items-center font-mono font-semibold", size === "lg" ? "text-4xl" : "text-xs")}>
        {value}{size === "lg" && <span className="sr-only"> percent</span>}
      </span>
    </div>
  );
}