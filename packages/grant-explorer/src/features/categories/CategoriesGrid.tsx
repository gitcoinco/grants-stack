import CategoryCard from "./CategoryCard";
import { Category } from "./hooks/useCategories";

export function CategoriesGrid({
  isLoading,
  data,
  maxCount, // itemClassName,
}: {
  isLoading?: boolean;
  data?: Category[];
  loadingCount: number;
  maxCount?: number;
  // itemClassName?: (category: Category, index: number) => string;
}) {
  if (!isLoading && !data?.length) {
    return <CategoriesEmptyState />;
  }

  return (
    <div className="overflow-x-scroll xl:w-[108%]">
      <div className="inline-flex flex-1 gap-6 ">
        {data?.slice(0, maxCount).map((category) => (
          <div
            key={category?.id}
            //  className={itemClassName?.(category, i)}
            className="flex-1 w-[300px]"
          >
            <CategoryCard category={category} isLoading={isLoading} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriesEmptyState() {
  return (
    <div className="p-16 flex justify-center text-xl">No categories found</div>
  );
}
