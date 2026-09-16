import CategoryCard from "../../components/cards/CategoryCard";
import { LoadingSkeleton, EmptyState, ErrorState } from "../../components/ui";
import { fetchCategories } from "../../services/categoryService";
import { useAsync } from "../../hooks/useAsync";

export default function Categories() {
  const categories = useAsync(() => fetchCategories(), []);

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary">Browse Categories</h1>
        <p className="text-secondary mt-2">Find shops and products by what they sell.</p>
      </div>

      {categories.loading && <LoadingSkeleton count={8} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />}
      {!categories.loading && categories.error && <ErrorState onRetry={categories.retry} />}
      {!categories.loading && !categories.error && (
        categories.data?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.data.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <EmptyState title="No categories yet" description="Categories will appear here once they're added." />
        )
      )}
    </div>
  );
}
