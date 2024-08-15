export type CommunityCollection = {
  cid: string;
  author: string;
  name: string;
  numberOfProjects: number;
  description: string;
};

const collections: CommunityCollection[] = [
  {
    cid: "bafkreigolvgncxvmkqdbmaeyedbtikw7fweisya2xtilten2vmftpgzazu",
    author: "Unknown",
    name: "Womyn in GG21",
    numberOfProjects: 19,
    description: "This collection showcases Womyn in GG21",
  },
  // {
  //   cid: "bafkreihkao32n3zjfffeuqm5bywgd67toztasrcpabyhrwjurfa7l35rse",
  //   author: "Wasabi",
  //   name: "Critical Infra + Scaling Web3",
  //   numberOfProjects: 45,
  //   description:
  //     "This is a curated collection about long-tail yet critical projects for a massive Web3 Scaling and secure Critical Infrastructure for the Future.",
  // },
];

export default collections;
