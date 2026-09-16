import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

/** Small inline/full-area spinner for async states. */
export default function Loader({ size = 24, fullScreen = false, label, className }) {
  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-2 text-secondary", className)}>
      <Loader2 style={{ width: size, height: size }} className="animate-spin text-accent" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-[50vh] flex items-center justify-center">{spinner}</div>;
  }
  return spinner;
}
