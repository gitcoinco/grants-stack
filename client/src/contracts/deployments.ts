const chains: { [key: number]: string } = {
  5: "goerli",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xc755eFc2168E959B50F1B2F0918DBEcC709956F4",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
