export const chains: { [key: number]: string } = {
  5: "goerli",
  69: "optimisticKovan",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xf47669845D97f66922058430f01F24AdA28Aaf36",
  },
  optimisticKovan: {
    projectRegistry: "0x95936606EDDB0ccDdD46d05AAB38F210FEEb5A8a",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
