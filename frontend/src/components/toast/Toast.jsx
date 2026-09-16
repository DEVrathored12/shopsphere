import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const TONES = {
  success: "border-success/30 text-success",
  error: "border-danger/30 text-danger",
  info: "border-border text-primary",
};

export default function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2.5 w-80 max-w-[90vw] bg-white border rounded-xl shadow-lg px-4 py-3",
        TONES[toast.type] || TONES.info
      )}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm text-primary flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="text-secondary hover:text-primary"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
