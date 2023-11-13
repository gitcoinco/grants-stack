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
  const { id, name, projects } = category;
  return (
    <BasicCard className="w-full">
      <a target="_blank" href={`/#/projects?categoryId=${id}`}>
        <CardHeader>
          <CategoryBanner projectIds={projects} />
        </CardHeader>
        <CardContent>
          <div className="font-medium truncate text-xl">{name}</div>
        </CardContent>
      </a>
    </BasicCard>
  );
};

export default CategoryCard;
