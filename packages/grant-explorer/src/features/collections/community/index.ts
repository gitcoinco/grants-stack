export type CommunityCollection = {
  cid: string;
  author: string;
  name: string;
  numberOfProjects: number;
  description: string;
};

const collections: CommunityCollection[] = [
  {
    cid: "bafkreidobkgrbrw7mex556jnku4xlony6jvyhepc6yqpzzymasupnuvdi4",
    author: "BitcoinLouie",
    name: "Solo Staking",
    numberOfProjects: 9,
    description:
      "This collection showcases BitcoinLouie's Solo Staking Collection",
  },
  {
    cid: "bafkreibp2yzwyj6m2fcgjqp7k6fikj3rr7ew3ceytrnr2zgi6dql2oiiry",
    author: "Kevin Weaver",
    name: "Regen Builders",
    numberOfProjects: 20,
    description:
      "Kevin's bento assortment of public goods spanning apps, web3 infra, dev tools I use daily and climate initiatives that pair well.",
  },
  {
    cid: "bafkreifk3ejfp3j6eanuvvoqmp2bgyieuq67eh4kqpuxebegshaqaghu5e",
    author: "ThankArb",
    name: "Bring ARB Home ",
    numberOfProjects: 22,
    description:
      "Think ARB is cool, but never felt like it would really work for you? Take a look at these rounds on Abriturum that you can use to impact your community close to home.",
  },
  {
    cid: "bafkreicneb6yinsk3zwcntohxklo3gcztosj5a2g72sr2dpqlawlcyvpli",
    author: "buidlbox",
    name: "buidl & shill sesh ",
    numberOfProjects: 13,
    description:
      "We've rounded up all the projects from our recent buidl & shill spaces for #GG20 in a collection",
  },
  {
    cid: "bafkreihmuhsrdh62kjor5472dsgahhea3ltj33tffhr2cnc5bxae3qetou",
    author: "Benjamin Life",
    name: "Regen Civics",
    numberOfProjects: 25,
    description:
      "Regen Civics is my curation of civic innovators in the @climate_program round on @gitcoin.",
  },
  {
    cid: "bafkreiffs6li5kwipwf6m4dgwbul3lf5mg766fujks72vm4crdebgybrme",
    author: "Coleen Chase",
    name: "Climate Projects Making Real-World Impact in Rural Africa",
    numberOfProjects: 25,
    description:
      "Check out my collection of Climate Projects making real-world impact in rural Africa including 2 projects for dMRV.",
  },
];

export default collections;