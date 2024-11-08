import { CommunityCollection } from "./community";
import { Badge, BasicCard, CardHeader } from "../common/styles";
import { CollectionBanner } from "../discovery/CardBanner";
import { collectionPath } from "common/src/routes/explorer";

export type CollectionCardProps = {
  collection: CommunityCollection;
  size: "big" | "small";
};

const CollectionCard = ({ collection, size }: CollectionCardProps) => {
  const { cid, name, description } = collection;

  const sliceLength = size === "small" ? 165 : 385;

  let desc = description;
  if (description && description.length > sliceLength) {
    desc = description.slice(0, sliceLength) + "...";
  }

  return (
    <BasicCard className="w-full h-[246px]">
      <a
        href={collectionPath(cid!)}
        data-track-event={`home-collections-card-${size}`}
      >
        <CardHeader>
          <CollectionBanner />
        </CardHeader>
        <div className="p-4 space-y-1">
          <div className="font-medium truncate text-xl">{name}</div>
          <p className="text-grey-400 text-sm">{desc}</p>
        </div>
      </a>
    </BasicCard>
  );
};

export default CollectionCard;
