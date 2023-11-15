import { BasicCard, CardContent, CardHeader } from "../common/styles";
import { CategoryBanner } from "../discovery/CardBanner";
import { Category } from "./hooks/useCategories";

type CategoryCardProps = {
  category: Category;
  isLoading?: boolean;
};

const CategoryCard = ({ category, isLoading }: CategoryCardProps) => {
  if (isLoading) {
    return <div>...</div>;
  }
  const { id, name } = category;

  // TODO: Define the category pictures - where do we do this?
  const projectIds = Array.from({ length: 4 }).map((_, i) => `${id}-${i}`);

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/projects?categoryId=${id}`}
        data-track-event="home-category-card"
      >
        <CardHeader>
          <CategoryBanner projectIds={projectIds} />
        </CardHeader>
        <CardContent>
          <div className="font-medium truncate text-xl">{name}</div>
        </CardContent>
      </a>
    </BasicCard>
  );
};

export default CategoryCard;
