import CategoryCard from "./CategoryCard";
import { Category } from "./hooks/useCategories";

type Props = {
  isLoading?: boolean;
  data?: Category[];
  loadingCount: number;
  maxCount?: number;
};

export function CategoriesGrid({ isLoading, data, maxCount }: Props) {
  if (!isLoading && !data?.length) {
    return <CategoriesEmptyState />;
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 ">
      {data
        ?.slice(0, maxCount)
        .map((category) => (
          <CategoryCard
            key={category?.id}
            category={category}
            isLoading={isLoading}
          />
        ))}
    </div>
  );
}

export function CategoriesEmptyState() {
  return (
    <div className="p-16 flex justify-center text-xl">No categories found</div>
  );
}
