import { firstTimeGranteesProject } from "../data/firstTimeGrantees";
import { veteransProjects } from "../data/veterans";
import { getAddress } from "viem";

import image01 from "../../../assets/collections/collection_01.jpg";
import image02 from "../../../assets/collections/collection_02.jpg";
import image03 from "../../../assets/collections/collection_03.jpg";
import image04 from "../../../assets/collections/collection_04.jpg";
import image05 from "../../../assets/collections/collection_05.jpg";
import image06 from "../../../assets/collections/collection_06.jpg";
import image07 from "../../../assets/collections/collection_07.jpg";
import image08 from "../../../assets/collections/collection_08.jpg";
import { stakeFromHomeProjets } from "../data/stakeFromHome";
import { devanshProjects } from "../data/devansh";
import { innovatorsChampionsProjects } from "../data/innovatorsChampions";
import { midnightGospelProjects } from "../data/midnightGospel";
import { coinverseProjects } from "../data/coinverse";
import { evergreenProjects } from "../data/evergreen";

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
    name: "First Time Grantees",
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
  {
    id: "stake-from-home",
    author: "superphiz",
    name: "The #StakeFromHome Collection - Empowering Home Stakers",
    images: [image05, image06, image07, image08],
    description:
      "The #StakeFromHome collection focuses on resources that educate, support, and promote home staking on the Ethereum network. I believe Ethereum will be most successful when we decentralize with nodes and validators in homes all over the world. I hand picked these projects because of my knowledge of their existing contributions and I'm excited for all of us to support their work.",
    projects: stakeFromHomeProjets.map(normalizeAddress),
  },
  {
    id: "devansh-mehtas-picks",
    author: "Devansh Mehta",
    name: "Devansh's picks in Climate, Web3 community & OSS",
    images: [image05, image06, image07, image08],
    description: `Selection of 60+ projects across climate round, OSS and Web3 Community and Education

This list is based on twitter shill spaces from past Gitcoin rounds and projects I've personally met at conferences`,
    projects: devanshProjects.map(normalizeAddress),
  },
  {
    id: "the-midnight-gospel",
    author: "Ale RaMo",
    name: "The Midnight Gospel",
    images: [image05, image06, image07, image08],
    description: `I've centered my attention on projects that not only deliver genuine impact but also contribute tangible value to the ecosystem. My focus remains steadfast on initiatives that make a meaningful difference.

""It's not about ideas. It's about making ideas happen."" - Scott Belsky`,
    projects: midnightGospelProjects.map(normalizeAddress),
  },
  {
    id: "intro-to-the-gitcoinverse",
    author: "CryptoReuMD",
    name: "Intro to the Gitcoinverse",
    images: [image05, image06, image07, image08],
    description: `This is from my heart to all the ReFi projects that are building some meaningful initiatives to our lives, and the ecosystem.`,
    projects: coinverseProjects.map(normalizeAddress),
  },
  {
    id: "innovators-champions",
    author: "olimpio.eth",
    name: "Innovators' Champions Collection",
    images: [image05, image06, image07, image08],
    description: `A selection of builders, normal users, amazing tools and different organizations that continuously contribute to the blockchain ecosystem.`,
    projects: innovatorsChampionsProjects.map(normalizeAddress),
  },
  {
    id: "evergreen-list",
    author: "Wasabi",
    name: "The Evergreen List",
    images: [image05, image06, image07, image08],
    description: `List of grantees that IMO are building sustainable and with the possibility of becoming a perpetual source of value for the wider community.`,
    projects: evergreenProjects.map(normalizeAddress),
  },
];

export function useCollections() {
  return collections;
}

export function useCollection(id: string | null) {
  return collections.find((collection) => collection.id === id);
}
