import { firstTimeGranteesProject } from "../data/firstTimeGrantees";
// import { veteransProjects } from "../data/veterans";
import { getAddress } from "viem";

import image01 from "../../../assets/collections/collection_01.jpg";
import image02 from "../../../assets/collections/collection_02.jpg";
import image03 from "../../../assets/collections/collection_03.jpg";
import image04 from "../../../assets/collections/collection_04.jpg";
// import image05 from "../../../assets/collections/collection_05.jpg";
// import image06 from "../../../assets/collections/collection_06.jpg";
// import image07 from "../../../assets/collections/collection_07.jpg";
// import image08 from "../../../assets/collections/collection_08.jpg";
import image09 from "../../../assets/collections/collection_09.jpg";
import image10 from "../../../assets/collections/collection_10.jpg";
import image11 from "../../../assets/collections/collection_11.jpg";
import image12 from "../../../assets/collections/collection_12.jpg";
import image13 from "../../../assets/collections/collection_13.jpg";
import image14 from "../../../assets/collections/collection_14.jpg";
import image15 from "../../../assets/collections/collection_15.jpg";
import image16 from "../../../assets/collections/collection_16.jpg";
import image17 from "../../../assets/collections/collection_17.jpg";
import image18 from "../../../assets/collections/collection_18.jpg";
import image19 from "../../../assets/collections/collection_19.jpg";
import image20 from "../../../assets/collections/collection_20.jpg";
import image21 from "../../../assets/collections/collection_21.jpg";
import image22 from "../../../assets/collections/collection_22.jpg";
import image23 from "../../../assets/collections/collection_23.jpg";
import image24 from "../../../assets/collections/collection_24.jpg";
import image25 from "../../../assets/collections/collection_25.jpg";
import image26 from "../../../assets/collections/collection_26.jpg";
import image27 from "../../../assets/collections/collection_27.jpg";
import image28 from "../../../assets/collections/collection_28.jpg";
import image29 from "../../../assets/collections/collection_29.jpg";
import image30 from "../../../assets/collections/collection_30.jpg";
import image31 from "../../../assets/collections/collection_31.jpg";
import image32 from "../../../assets/collections/collection_32.jpg";
import image33 from "../../../assets/collections/collection_33.jpg";
import image34 from "../../../assets/collections/collection_34.jpg";
import image35 from "../../../assets/collections/collection_35.jpg";
import image36 from "../../../assets/collections/collection_36.jpg";

import { stakeFromHomeProjets } from "../data/stakeFromHome";
import { devanshProjects } from "../data/devansh";
import { innovatorsChampionsProjects } from "../data/innovatorsChampions";
import { midnightGospelProjects } from "../data/midnightGospel";
import { coinverseProjects } from "../data/coinverse";
import { evergreenProjects } from "../data/evergreen";
import { carlsCollectionProjects } from "../data/carlsCollection";

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
  // {
  //   id: "grants-stack-veterans",
  //   author: "Gitcoin",
  //   name: "Grants Stack Veterans",
  //   images: [image05, image06, image07, image08],
  //   description:
  //     "This collection showcases all grantees in GG19 that have participated in a past GG18 and/or Beta Round! Give these Grants Stack Veterans some love (and maybe some donations, too!).",
  //   projects: veteransProjects.map(normalizeAddress),
  // },
  {
    id: "devansh-mehtas-picks",
    author: "Devansh Mehta",
    name: "Devansh's picks in Climate, Web3 community & OSS",
    images: [image12, image13, image28, image14],
    description: `Selection of 60+ projects across climate round, OSS and Web3 Community and Education

This list is based on twitter shill spaces from past Gitcoin rounds and projects I've personally met at conferences`,
    projects: devanshProjects.map(normalizeAddress),
  },
  {
    id: "evergreen-list",
    author: "Wasabi",
    name: "The Evergreen List",
    images: [image24, image26, image32, image25],
    description: `List of grantees that IMO are building sustainable and with the possibility of becoming a perpetual source of value for the wider community.`,
    projects: evergreenProjects.map(normalizeAddress),
  },
  {
    id: "stake-from-home",
    author: "superphiz",
    name: "The #StakeFromHome Collection - Empowering Home Stakers",
    images: [image09, image10, image27, image11],
    description:
      "The #StakeFromHome collection focuses on resources that educate, support, and promote home staking on the Ethereum network. I believe Ethereum will be most successful when we decentralize with nodes and validators in homes all over the world. I hand picked these projects because of my knowledge of their existing contributions and I'm excited for all of us to support their work.",
    projects: stakeFromHomeProjets.map(normalizeAddress),
  },

  {
    id: "innovators-champions",
    author: "olimpio.eth",
    name: "Innovators' Champions Collection",
    images: [image21, image23, image31, image22],
    description: `A selection of builders, normal users, amazing tools and different organizations that continuously contribute to the blockchain ecosystem.`,
    projects: innovatorsChampionsProjects.map(normalizeAddress),
  },
  {
    id: "intro-to-the-gitcoinverse",
    author: "CryptoReuMD",
    name: "Intro to the Gitcoinverse",
    images: [image19, image18, image30, image20],
    description: `This is from my heart to all the ReFi projects that are building some meaningful initiatives to our lives, and the ecosystem.`,
    projects: coinverseProjects.map(normalizeAddress),
  },
  {
    id: "the-midnight-gospel",
    author: "Ale RaMo",
    name: "The Midnight Gospel",
    images: [image15, image16, image29, image17],
    description: `I've centered my attention on projects that not only deliver genuine impact but also contribute tangible value to the ecosystem. My focus remains steadfast on initiatives that make a meaningful difference.

""It's not about ideas. It's about making ideas happen."" - Scott Belsky`,
    projects: midnightGospelProjects.map(normalizeAddress),
  },
  {
    id: "carls-collection",
    author: "cerv1.eth",
    name: "Carl's Collection",
    images: [image33, image34, image35, image36],
    description: `My goal was to highlight projects that have (a) been valuable to me in some way, and (b) are not front runners in any of the rounds so far. I took a snapshot of projects on the morning of Nov 17 and set a popularity threshold. I only considered projects below that threshold, and capped my picks to no more than 10% of the total projects in a given round.`,
    projects: carlsCollectionProjects.map(normalizeAddress),
  },
];

export function useCollections() {
  return collections;
}

export function useCollection(id: string | null) {
  return collections.find((collection) => collection.id === id);
}
