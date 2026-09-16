import { PackageSearch } from "lucide-react";
import Button from "./Button";

/**
 * Shown when a query returns zero results. `action` is an optional
 * { label, onClick } used for things like "Clear Filters".
 */
export default function EmptyState({
  icon: Icon = PackageSearch,
  title = "Nothing here yet.",
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-14 h-14 rounded-full bg-border/50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="text-sm text-secondary mt-1 max-w-sm">{description}</p>}
      {action && (
        <Button variant="outline" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
