export type Category = {
  id: string;
  name: string;
  searchQuery: string;
};

export const categories: Category[] = [
  {
    id: "open-source",
    name: "Open source",
    searchQuery: "open source, open source software",
  },
  {
    id: "education",
    name: "Education",
    searchQuery: "education, teaching",
  },
  // {
  //   id: "climate",
  //   name: "Climate",
  //   searchQuery: "climate, environment, sustainability, regeneration",
  // },
  {
    id: "civic-engagement",
    name: "Civic engagement",
    searchQuery: "civic engagement, civics, governance, democracy ",
  },
  // {
  //   id: "defi",
  //   name: "DeFi",
  //   searchQuery: "DeFi, finance",
  // },
  // {
  //   id: "nfts",
  //   name: "NFTs",
  //   searchQuery: "NFTs",
  // },

  // {
  //   id: "gaming",
  //   name: "Gaming",
  //   searchQuery: "gaming, games",
  // },
  {
    id: "social",
    name: "Social",
    searchQuery: "social",
  },
];

export function useCategories() {
  return categories;
}

export function useCategory(id: string | null) {
  return categories.find((cat) => cat.id === id);
}
