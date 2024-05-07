import { CommunityCollection } from "./community";
import { Badge, BasicCard, CardHeader } from "../common/styles";
import { CollectionBanner } from "../discovery/CardBanner";
import { collectionPath } from "common/src/routes/explorer";

export type CollectionCardProps = {
  collection: CommunityCollection;
  size: "big" | "small";
};

const CollectionCard = ({ collection, size }: CollectionCardProps) => {
  const { cid, author, name, numberOfProjects } = collection;

  return (
    <BasicCard className="w-full">
      <a
        href={collectionPath(cid)}
        data-track-event={`home-collections-card-${size}`}
      >
        <CardHeader>
          <CollectionBanner />
        </CardHeader>
        <div className="p-4 space-y-1">
          <div className="font-medium truncate text-xl">{name}</div>
          <div className="flex justify-between items-center">
            <div className="text-grey-400 text-sm">
              {numberOfProjects} projects
            </div>
            <div className="text-sm flex gap-2 items-center">
              by <Badge rounded="full">{author}</Badge>
            </div>
          </div>
        </div>
      </a>
    </BasicCard>
  );
};

export default CollectionCard;
