import { Badge, BasicCard, CardHeader } from "../common/styles";
import { CollectionBanner } from "../discovery/CardBanner";
import { Collection } from "./hooks/useCollections";

type CollectionCardProps = {
  collection: Collection;
  index: number;
};

const CollectionCard = ({ collection, index }: CollectionCardProps) => {
  const { id, name, projects } = collection;
  const trackEventValue = [0, 1, 6, 7].includes(index)
    ? "home-collections-card-big"
    : "home-collections-card-small";

  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/projects?collectionId=${id}`}
        data-track-event={trackEventValue}
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
              by <Badge rounded="full">ensname.eth</Badge>
            </div>
          </div>
        </div>
      </a>
    </BasicCard>
  );
};

export default CollectionCard;
