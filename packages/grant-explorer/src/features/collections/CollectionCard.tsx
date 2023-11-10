import {
  Badge,
  BasicCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "../common/styles";
import { CollectionBanner } from "../discovery/CardBanner";
import { Collection } from "./hooks/useCollections";

type CollectionCardProps = {
  collection: Collection;
  isLoading?: boolean;
};

const CollectionCard = ({ collection, isLoading }: CollectionCardProps) => {
  if (isLoading) {
    return <div>...</div>;
  }
  const { id, name, projects } = collection;
  return (
    <BasicCard className="w-full">
      <a target="_blank" href={`/#/projects?collectionId=${id}`}>
        <CardHeader>
          <CollectionBanner projectIds={projects} />
        </CardHeader>
        <CardContent>
          <CardTitle>{name}</CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-grey-400 text-sm">
              {projects.length} projects
            </div>
            <div className="text-sm flex gap-2 items-center">
              by <Badge>ensname.eth</Badge>
            </div>
          </div>
        </CardContent>
      </a>
    </BasicCard>
  );
};

export default CollectionCard;
