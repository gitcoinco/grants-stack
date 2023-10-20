import { ChainId } from "common";
import {
  Badge,
  BasicCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "../common/styles";
import { CollectionBanner } from "./CardBanner";

type CollectionCardProps = {
  collection: {
    id: string;
    chainId: string;
    name: string;
    projects: { id: string }[];
  };
};

const CollectionCard = ({ collection }: CollectionCardProps) => {
  const { id, chainId, projects } = collection;
  const chainIdEnumValue = ChainId[chainId as keyof typeof ChainId];
  return (
    <BasicCard className="w-full">
      <a
        target="_blank"
        href={`/#/collection/${chainIdEnumValue}/${id}`}
        data-testid="round-card"
      >
        <CardHeader>
          <CollectionBanner projects={projects} />
        </CardHeader>
        <CardContent>
          <CardTitle data-testid="collection-name">{collection.name}</CardTitle>
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
