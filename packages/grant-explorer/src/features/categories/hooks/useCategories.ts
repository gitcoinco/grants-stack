import { faker } from "@faker-js/faker";

export type Category = {
  id: string;
  author: string;
  name: string;
  description: string;
  projects: string[];
};

const categoryTitles = [
  "NFTs",
  "Open source",
  "Climate",
  "First-time grantees",
  "Grants Stack veterans",
];
// TODO: Define categories
const categories: Category[] = Array.from({
  length: categoryTitles.length,
}).map((_, i) => ({
  id: faker.finance.ethereumAddress(),
  author: faker.finance.ethereumAddress(),
  name: categoryTitles[i],
  description: faker.lorem.paragraph(),
  // name: "Category name " + i,
  projects: Array.from({ length: 4 }).map(() =>
    faker.finance.ethereumAddress()
  ),
}));

export function useCategories() {
  return categories;
}
