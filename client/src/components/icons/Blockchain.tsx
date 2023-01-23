// todo: unused file?
export enum ChainLogos {
  ETH = "./assets/ethereum.svg",
}

export function Blockchain({ chain }: { chain: ChainLogos }) {
  return <img className="h-5 pr-2 mt-0.5" src={chain} alt="Network Logo" />;
}
