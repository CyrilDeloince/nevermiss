import { cn } from "@/lib/utils";

/** Garden + butterflies mark for Jardin. */
export function JardinMark({
  className,
  title = "Jardin",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="32" cy="32" r="30" fill="#1f4a3a" />
      <path
        d="M18 44c4-10 10-16 14-18 4 2 10 8 14 18"
        stroke="#c9a25c"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 42V26"
        stroke="#e6d3a4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M32 30c-4-2-7-1-9 2 3 1 6 3 9 5 3-2 6-4 9-5-2-3-5-4-9-2Z"
        fill="#7a9e7e"
      />
      <path
        d="M22 16c2.2-3.2 5.5-2.8 6.2.6-.8 2.8-3.2 4.2-5.6 3.4-1.6-.6-2-2.2-.6-4Z"
        fill="#c9a25c"
      />
      <path
        d="M40 14c2.4-2.8 5.4-2.2 5.8.8-.6 2.6-2.8 3.8-5 3-1.6-.6-2.2-2-.8-3.8Z"
        fill="#d4b06e"
      />
      <path
        d="M34 20c1.8-2.4 4.4-2 4.8.6-.5 2.1-2.4 3.1-4.2 2.5-1.3-.5-1.8-1.7-.6-3.1Z"
        fill="#e6d3a4"
      />
    </svg>
  );
}
