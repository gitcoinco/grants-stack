import CollectionCard from "./CollectionCard";
import { Collection } from "./hooks/useCollections";

export function CollectionsGrid({
  data,
  maxCount,
  itemClassName,
}: {
  data: Collection[];
  loadingCount: number;
  maxCount?: number;
  itemClassName?: (collection: Collection, index: number) => string;
}) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {data?.slice(0, maxCount).map((collection, i) => (
        <div key={collection?.id} className={itemClassName?.(collection, i)}>
          <CollectionCard collection={collection} />
        </div>
      ))}
    </div>
  );
}
