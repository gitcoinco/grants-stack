import { Link } from "react-router-dom";
import { BasicCard, CardContent, CardHeader } from "../common/styles";
import { CategoryBanner } from "../discovery/CardBanner";
import { Category } from "./hooks/useCategories";

type CategoryCardProps = {
  category: Category;
  isLoading?: boolean;
};

function scrollToDiscoveryAnchor() {
  document
    .getElementById("discovery-scroll-anchor")
    ?.scrollIntoView({ block: "nearest" });
}

const CategoryCard = ({ category, isLoading }: CategoryCardProps) => {
  if (isLoading) {
    return <div>...</div>;
  }
  const { id, name } = category;

  // TODO: Define the category pictures - where do we do this?
  const projectIds = Array.from({ length: 4 }).map((_, i) => `${id}-${i}`);

  return (
    <BasicCard className="w-full">
      <Link
        to={`/projects?categoryId=${id}`}
        data-track-event="home-category-card"
        onClick={() => {
          scrollToDiscoveryAnchor();
        }}
      >
        <CardHeader>
          <CategoryBanner projectIds={projectIds} />
        </CardHeader>
        <CardContent>
          <div className="font-medium truncate text-xl">{name}</div>
        </CardContent>
      </Link>
    </BasicCard>
  );
};

export default CategoryCard;
