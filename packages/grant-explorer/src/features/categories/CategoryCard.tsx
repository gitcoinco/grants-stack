import { SearchBasedProjectCategory } from "data-layer";
import { BasicCard, CardContent, CardHeader } from "../common/styles";
import { CategoryBanner } from "../discovery/CardBanner";

type CategoryCardProps = {
  category: SearchBasedProjectCategory;
  isLoading?: boolean;
};

const CategoryCard = ({ category, isLoading }: CategoryCardProps) => {
  if (isLoading) {
    return <div>...</div>;
  }
  const { id, name, images } = category;

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/projects?categoryId=${id}`}
        data-track-event="home-category-card"
      >
        <CardHeader>
          <CategoryBanner images={images} />
        </CardHeader>
        <CardContent>
          <div className="font-medium truncate text-xl">{name}</div>
        </CardContent>
      </a>
    </BasicCard>
  );
};

export default CategoryCard;
