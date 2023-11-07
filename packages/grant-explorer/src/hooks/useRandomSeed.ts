// useRandomSeed.ts

import { useState, useEffect } from "react";

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function useRandomSeed(storage: Storage): number {
  const [randomSeed, setRandomSeed] = useState<number | null>(null);

  useEffect(() => {
    // Load the seed using the provided storage object
    const storedSeed = storage.getItem("randomSeed");

    if (storedSeed !== null) {
      setRandomSeed(Number(storedSeed));
    } else {
      const newSeed = Math.random();
      storage.setItem("randomSeed", newSeed.toString());
      setRandomSeed(newSeed);
    }
  }, [storage]);

  return randomSeed || 0; // Return 0 if randomSeed is null
}
