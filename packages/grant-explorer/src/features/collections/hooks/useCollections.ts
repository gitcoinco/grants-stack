import { firstTimeGranteesProject } from "../data/firstTimeGrantees";
import { veteransProjects } from "../data/veterans";

import image01 from "../../../assets/collections/collection_01.jpg";
import image02 from "../../../assets/collections/collection_02.jpg";
import image03 from "../../../assets/collections/collection_03.jpg";
import image04 from "../../../assets/collections/collection_04.jpg";
import image05 from "../../../assets/collections/collection_05.jpg";
import image06 from "../../../assets/collections/collection_06.jpg";
import image07 from "../../../assets/collections/collection_07.jpg";
import image08 from "../../../assets/collections/collection_08.jpg";
import { getAddress } from "viem";

export type Collection = {
  id: string;
  author: string;
  name: string;
  images: string[];
  description: string;
  projects: string[];
};

function normalizeAddress(item: string) {
  const [chain, address, idx] = item.split(":");
  return [chain, getAddress(address), idx].join(":");
}

export const collections: Collection[] = [
  {
    id: "first-time-grantees",
    author: "Gitcoin",
    name: "First Time grantees",
    images: [image01, image02, image03, image04],
    description:
      "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
    projects: firstTimeGranteesProject.map(normalizeAddress),
  },
  {
    id: "grants-stack-veterans",
    author: "Gitcoin",
    name: "Grants Stack Veterans",
    images: [image05, image06, image07, image08],
    description:
      "This collection showcases all grantees in GG19 that have participated in a past GG18 and/or Beta Round! Give these Grants Stack Veterans some love (and maybe some donations, too!).",
    projects: veteransProjects.map(normalizeAddress),
  },
];

export function useCollections() {
  return collections;
}

export function useCollection(id: string | null) {
  return collections.find((collection) => collection.id === id);
}
