import { Address, useEnsName } from "wagmi";
import { Collection } from "./hooks/useCollections";
import { Skeleton } from "@chakra-ui/react";

type Props = {
  collection: Collection;
};
export function CollectionDetails({ collection }: Props) {
  const ens = useEnsName({
    chainId: 1,
    address: collection.author as Address,
    enabled: Boolean(collection.author),
  });

  return (
    <div className="mt-16">
      <h3 className="text-4xl font-medium mb-2">{`${collection.name} (${collection.projects.length})`}</h3>
      <div className="text-lg flex gap-2 mb-12">
        by:
        <Skeleton isLoaded={!ens.isLoading}>
          <span className="text-white">{ens.data ?? collection.author}</span>
        </Skeleton>
      </div>

      <div className="text-lg">{collection.description}</div>
    </div>
  );
}
