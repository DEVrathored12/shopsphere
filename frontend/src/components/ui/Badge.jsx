import { cn } from "../../lib/cn";

const TONES = {
  neutral: "bg-border/60 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  danger: "bg-danger/10 text-danger",
};

/** Small pill label — availability, status, category tags, etc. */
export default function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
