import CollectionCard from "./CollectionCard";
import { Collection } from "./hooks/useCollections";

// Index position of the big cards
const collectionGridLayout = [0, 1, 4, 5];

const DISPLAY_COUNT = 12;

export function CollectionsGrid({ data }: { data: Collection[] }) {
  return (
    <div className="md:grid space-y-4 md:space-y-0 md:grid-cols-4 gap-6">
      {data?.slice(0, DISPLAY_COUNT).map((collection, i) => {
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
