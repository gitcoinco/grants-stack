import { useMemo } from "react";
import { CommunityCollection } from "./community";
import CollectionCard from "./CollectionCard";

// Index position of the big cards
const collectionGridLayout = [0, 5, 6, 11];

const DISPLAY_COUNT = 12;

export function CollectionsGrid({ data }: { data: CommunityCollection[] }) {
  // Shuffle the collections
  const shuffled = useMemo(() => shuffle(data), [data]);

  return (
    <div className="md:grid space-y-4 md:space-y-0 md:grid-cols-4 gap-6">
      {shuffled?.slice(0, DISPLAY_COUNT).map((collection, i) => {
        const size = collectionGridLayout.includes(i) ? "big" : "small";
        return (
          <div
            key={collection?.cid}
            className={size === "big" ? "md:col-span-2" : ""}
          >
            <CollectionCard collection={collection} size={size} />
          </div>
        );
      })}
    </div>
  );
}

// Random every time the page loads
const SEED = Math.random();

function shuffle<T>(array: T[]): T[] {
  const _array = [...array];
  for (let i = _array.length - 1; i > 0; i--) {
    const j = Math.floor(SEED * (i + 1));
    [_array[i], _array[j]] = [_array[j], _array[i]];
  }

  return _array;
}
