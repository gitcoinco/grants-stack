import { faker } from "@faker-js/faker";

export type Collection = {
  id: string;
  name: string;
  author: string;
  projects: string[];
};

// TODO: Define collections
const collections: Collection[] = Array.from({ length: 6 }).map(() => ({
  id: faker.finance.ethereumAddress(),
  author: faker.finance.ethereumAddress(),
  name: faker.animal.bird(),
  // name: "Collection name " + i,
  projects: Array.from({ length: 4 }).map(() =>
    faker.finance.ethereumAddress()
  ),
}));

export function useCollections() {
  return collections;
}
