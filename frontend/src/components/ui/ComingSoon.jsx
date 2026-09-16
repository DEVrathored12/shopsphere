import { Construction } from "lucide-react";
import EmptyState from "./EmptyState";

/** Placeholder for routes whose full page content ships in a later phase. */
export default function ComingSoon({ title, description = "This page is coming in a later phase." }) {
  return (
    <div className="container-app py-20">
      <EmptyState icon={Construction} title={title} description={description} />
    </div>
  );
}
