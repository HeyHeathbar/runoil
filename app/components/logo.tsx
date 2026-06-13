import {
  MARK_VIEWBOX,
  MARK_LEFT_PATH,
  MARK_RIGHT_PATH,
} from "~/lib/brand-mark";

// The RunOil mark — a ring split by a diagonal seam: navy leads, violet
// completes (white + lilac on dark surfaces). Never close the gap.
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      role="img"
      aria-label="RunOil"
    >
      <path d={MARK_LEFT_PATH} className="fill-[#0B2545] dark:fill-white" />
      <path
        d={MARK_RIGHT_PATH}
        className="fill-[#7C3AED] dark:fill-[#A78BFA]"
      />
    </svg>
  );
}

// The split wordmark: "Run" + the mark as the "O" + "il".
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-lg font-semibold tracking-tight text-[#0B2545] dark:text-white ${className ?? ""}`}
    >
      Run
      <Mark className="mx-px size-[0.9em]" />
      il
    </span>
  );
}
