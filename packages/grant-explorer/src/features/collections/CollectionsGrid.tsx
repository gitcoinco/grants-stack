import CollectionCard from "./CollectionCard";
import { Collection } from "./hooks/useCollections";

export function CollectionsGrid({
  data,
  maxCount,
  getItemClassName,
}: {
  data: Collection[];
  loadingCount: number;
  maxCount?: number;
  getItemClassName?: (collection: Collection, index: number) => string;
}) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {data?.slice(0, maxCount).map((collection, i) => (
        <div key={collection?.id} className={getItemClassName?.(collection, i)}>
          <CollectionCard collection={collection} />
        </div>
      ))}
    </div>
  );
}
