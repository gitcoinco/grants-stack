import CollectionCard from "./CollectionCard";
import { Collection } from "./hooks/useCollections";

export const collectionGridLayout = [0, 5, 6, 11];
export function CollectionsGrid({ data }: { data: Collection[] }) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {data?.slice(0, 12).map((collection, i) => {
        const size = collectionGridLayout.includes(i) ? "big" : "small";
        return (
          <div
            key={collection?.id}
            className={size === "big" ? "md:col-span-2" : ""}
          >
            <CollectionCard collection={collection} size={size} />
          </div>
        );
      })}
    </div>
  );
}
