import { faker } from "@faker-js/faker";

export type Collection = {
  id: string;
  author: string;
  name: string;
  description: string;
  projects: string[];
};

// TODO: Define collections
export const collections: Collection[] = Array.from({ length: 8 }).map(() => ({
  id: faker.finance.ethereumAddress(),
  author: faker.finance.ethereumAddress(),
  name: faker.animal.bird(),
  description: faker.lorem.paragraph(),
  // name: "Collection name " + i,
  projects: Array.from({ length: 4 }).map(() =>
    faker.finance.ethereumAddress()
  ),
}));

export function useCollections() {
  return collections;
}
