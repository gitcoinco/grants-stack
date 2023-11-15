import { Link } from "react-router-dom";
import { Badge, BasicCard, CardHeader } from "../common/styles";
import { CollectionBanner } from "../discovery/CardBanner";
import { Collection } from "./hooks/useCollections";

export type CollectionCardProps = {
  collection: Collection;
  size: "big" | "small";
};

const CollectionCard = ({ collection, size }: CollectionCardProps) => {
  const { id, author, name, projects } = collection;

  return (
    <BasicCard className="w-full">
      <Link
        to={`/projects?collectionId=${id}`}
        data-track-event={`home-collections-card-${size}`}
      >
        <CardHeader>
          <CollectionBanner projectIds={projects} />
        </CardHeader>
        <div className="p-4 space-y-1">
          <div className="font-medium truncate text-xl">{name}</div>
          <div className="flex justify-between items-center">
            <div className="text-grey-400 text-sm">
              {projects.length} projects
            </div>
            <div className="text-sm flex gap-2 items-center">
              by <Badge rounded="full">{author}</Badge>
            </div>
          </div>
        </div>
      </Link>
    </BasicCard>
  );
};

export default CollectionCard;
