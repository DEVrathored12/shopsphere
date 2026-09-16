import { AlertTriangle } from "lucide-react";
import Button from "./Button";

/** Shown when a request fails. `onRetry` re-triggers the failed action. */
export default function ErrorState({
  title = "Something went wrong.",
  description = "Please try again in a moment.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <p className="text-sm text-secondary mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="primary" className="mt-5" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
