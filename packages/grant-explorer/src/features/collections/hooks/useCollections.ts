import { firstTimeGranteesProject } from "../data/firstTimeGrantees";
import { veteransProjects } from "../data/veterans";

export type Collection = {
  id: string;
  author: string;
  name: string;
  description: string;
  projects: string[];
};

export const collections: Collection[] = [
  {
    id: "first-time-grantees",
    author: "Gitcoin",
    name: "First Time grantees",
    description:
      "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
    projects: firstTimeGranteesProject,
  },
  {
    id: "grants-stack-veterans",
    author: "Gitcoin",
    name: "Grants Stack Veterans",
    description:
      "This collection showcases all grantees in GG19 that have participated in a past GG18 and/or Beta Round! Give these Grants Stack Veteran some love (and maybe some donations, too!).",
    projects: veteransProjects,
  },
];

export function useCollections() {
  return collections;
}

export function useCollection(id: string | null) {
  return collections.find((collection) => collection.id === id);
}
