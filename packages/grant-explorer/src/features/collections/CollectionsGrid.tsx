import CollectionCard from "./CollectionCard";
import { Collection } from "./hooks/useCollections";

export function CollectionsGrid({
  isLoading,
  data,
  maxCount,
  itemClassName,
}: {
  isLoading?: boolean;
  data?: Collection[];
  loadingCount: number;
  maxCount?: number;
  itemClassName?: (collection: Collection, index: number) => string;
}) {
  if (!isLoading && !data?.length) {
    return <CollectionsEmptyState />;
  }

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {data?.slice(0, maxCount).map((collection, i) => (
        <div key={collection?.id} className={itemClassName?.(collection, i)}>
          <CollectionCard collection={collection} isLoading={isLoading} />
        </div>
      ))}
    </div>
  );
}

export function CollectionsEmptyState() {
  return (
    <div className="p-16 flex justify-center text-xl">No collections found</div>
  );
}
