import { SearchBasedProjectCategory } from "../data.types";

export const CATEGORIES_HARDCODED: SearchBasedProjectCategory[] = [
  {
    id: "open-source",
    name: "Open source",
    images: [
      "/assets/categories/category_01.jpg",
      "/assets/categories/category_02.jpg",
      "/assets/categories/category_03.jpg",
      "/assets/categories/category_04.jpg",
    ],
    searchQuery: "open source, open source software",
  },
  {
    id: "education",
    name: "Education",
    images: [
      "/assets/categories/category_05.jpg",
      "/assets/categories/category_06.jpg",
      "/assets/categories/category_07.jpg",
      "/assets/categories/category_08.jpg",
    ],
    searchQuery: "education, teaching",
  },
  {
    id: "civic-engagement",
    name: "Civic engagement",
    images: [
      "/assets/categories/category_09.jpg",
      "/assets/categories/category_10.jpg",
      "/assets/categories/category_11.jpg",
      "/assets/categories/category_12.jpg",
    ],
    searchQuery: "civic engagement, civics, governance, democracy ",
  },
  {
    id: "social",
    name: "Social",
    images: [
      "/assets/categories/category_13.jpg",
      "/assets/categories/category_14.jpg",
      "/assets/categories/category_15.jpg",
      "/assets/categories/category_16.jpg",
    ],
    searchQuery: "social",
  },
];
