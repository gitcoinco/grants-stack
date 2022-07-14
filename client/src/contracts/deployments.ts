export const chains: { [key: number]: string } = {
  5: "goerli",
  69: "optimisticKovan",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0x1D4C316Ceb8cd3f497122606c9CCe2451F202B0a",
  },
  optimisticKovan: {
    projectRegistry: "0x95936606EDDB0ccDdD46d05AAB38F210FEEb5A8a",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
