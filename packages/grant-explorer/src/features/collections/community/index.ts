export type CommunityCollection = {
  cid: string;
  author: string;
  name: string;
  numberOfProjects: number;
  description: string;
};

const collections: CommunityCollection[] = [
  {
    cid: "bafkreibvfdh6zeauzic3cmocekwltt66kkhi2ordg4cxtquog4k7rgiwaq",
    author: "Gitcoin 1",
    name: "Test Collection 1 to remove",
    numberOfProjects: 4,
    description:
      "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
  },
  {
    cid: "bafkreihfxjn5higf4s35szbgbkow4nmitbtnrbn4z2gchfbg5dngqe63ja",
    author: "Gitcoin 1",
    name: "Test Collection 2 to remove",
    numberOfProjects: 5,
    description:
      "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
  },
  {
    cid: "bafkreihfxjn5higf4s35szbgbkow4nmitbtnrbn4z2gchfbg5dngqe63j2",
    author: "Gitcoin 2",
    name: "Test Collection 3 to remove",
    numberOfProjects: 5,
    description:
      "This collection showcases all grantees in GG19 that have not participated in a past round on Grants Stack! Give these first-time grantees some love (and maybe some donations, too!).",
  },
];

export default collections;
