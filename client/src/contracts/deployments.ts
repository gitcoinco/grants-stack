export const chains: { [key: number]: string } = {
  5: "goerli",
  69: "optimisticKovan",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xc755eFc2168E959B50F1B2F0918DBEcC709956F4",
  },
  optimisticKovan: {
    projectRegistry: "0xf90b4f383244fdf9dF7a28b1e8030d130E7c9be5",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
