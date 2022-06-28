export const chains: { [key: number]: string } = {
  5: "goerli",
  69: "optimisticKovan",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xc755eFc2168E959B50F1B2F0918DBEcC709956F4",
  },
  optimisticKovan: {
    projectRegistry: "0x46Da9bbe66d0FA187b46371D850245838D3c6850",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
