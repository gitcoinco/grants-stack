// Dunno why this declaration is needed
declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};
// Import all category images in folder
const images = require.context("../../../assets/categories", false);
const imageList = images.keys().map((image) => images(image) as string);

export type Category = {
  id: string;
  name: string;
  images: string[];
  searchQuery: string;
};

export const categories: Category[] = [
  {
    id: "open-source",
    name: "Open source",
    images: imageList.slice(0, 4),
    searchQuery: "open source, open source software",
  },
  {
    id: "education",
    name: "Education",
    images: imageList.slice(4, 8),
    searchQuery: "education, teaching",
  },
  {
    id: "civic-engagement",
    name: "Civic engagement",
    images: imageList.slice(8, 12),
    searchQuery: "civic engagement, civics, governance, democracy ",
  },
  {
    id: "social",
    name: "Social",
    images: imageList.slice(12, 16),
    searchQuery: "social",
  },
];

export function useCategories() {
  return categories;
}

export function useCategory(id: string | null) {
  return categories.find((cat) => cat.id === id);
}
