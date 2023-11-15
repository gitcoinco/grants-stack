import image01 from "../../../assets/categories/category_01.jpg";
import image02 from "../../../assets/categories/category_02.jpg";
import image03 from "../../../assets/categories/category_03.jpg";
import image04 from "../../../assets/categories/category_04.jpg";
import image05 from "../../../assets/categories/category_05.jpg";
import image06 from "../../../assets/categories/category_06.jpg";
import image07 from "../../../assets/categories/category_07.jpg";
import image08 from "../../../assets/categories/category_08.jpg";
import image09 from "../../../assets/categories/category_09.jpg";
import image10 from "../../../assets/categories/category_10.jpg";
import image11 from "../../../assets/categories/category_11.jpg";
import image12 from "../../../assets/categories/category_12.jpg";
import image13 from "../../../assets/categories/category_13.jpg";
import image14 from "../../../assets/categories/category_14.jpg";
import image15 from "../../../assets/categories/category_15.jpg";
import image16 from "../../../assets/categories/category_16.jpg";

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
    images: [image01, image02, image03, image04],
    searchQuery: "open source, open source software",
  },
  {
    id: "education",
    name: "Education",
    images: [image05, image06, image07, image08],
    searchQuery: "education, teaching",
  },
  {
    id: "civic-engagement",
    name: "Civic engagement",
    images: [image09, image10, image11, image12],
    searchQuery: "civic engagement, civics, governance, democracy ",
  },
  {
    id: "social",
    name: "Social",
    images: [image13, image14, image15, image16],
    searchQuery: "social",
  },
];

export function useCategories() {
  return categories;
}

export function useCategory(id: string | null) {
  return categories.find((cat) => cat.id === id);
}
