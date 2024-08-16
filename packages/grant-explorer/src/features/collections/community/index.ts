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
  {
      cid: "bafkreia3o5nsbqrhf3qzlnhof2npna6ca3zbqvk2d74hzwcxpuzeris52a",
      author: "Let's GROW Live Hosts & Contributors",
      name: "Let's GROW Live Hosts & Contributors",
      numberOfProjects: 40,
      description: "People who consistently show up for the Gitcoin community & follow through with their commitment to host for 30 mins to 3+ hours single day throughout the rounds says a lot about these founders. It demonstrates dependability, reliability & tenacity. These predominantly Regen projects have also all signed the GROWfesto, which demonstrates they also have Regen values: https://letsgrow.network/manifesto\n\nLet's GROW!!!"
  },
  {
      cid: "bafkreig3tpdwcwr2cfbwwocrfiyqlqk7sqewednjgxj2uyt2527fsngu7e",
      author: "Philly Projects GG21 ",
      name: "Philly Projects GG21 ",
      numberOfProjects: 5,
      description: "We have 5 projects in our city in this round and regionally we have a lot of Gitcoiners. I think this collection would be of interest to many in the community. Our projects also exist across 4 different rounds on 2 different chains. Thank you for your consideration. "
  },
  {
      cid: "bafkreibb6euk3ikgaahecpw3zfp6gj2wsarthxrn74lpeyiz3pneenm7kq",
      author: "Waste Management/Incentives/Cleanups",
      name: "Waste Management/Incentives/Cleanups",
      numberOfProjects: 17,
      description: "Its urgently important to reward those who are building in proper waste management fields, cleanup and recycling, incentivizing users. We have a chance to create a new age plastic economy, but we all need support. And not only with funding, but with the exposure as well. "
  },
  {
      cid: "bafkreig72mf33s23ss3q4en5thy7k7ixjujtivb6bulpe3hcepo5altoyy",
      author: "The Token Jedi's GG21 OpenCivics Collection",
      name: "The Token Jedi's GG21 OpenCivics Collection",
      numberOfProjects: 11,
      description: "The Open Civics Round is full of incredible innovators working on critical resources for our movement's growth. Can't help but shill it forward and encourage everyone's generous grow-nations!"
  }
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
