const chains: { [key: number]: string } = {
  5: "goerli",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xa449048290cf2c68c387ecf32847C59D9746C438",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
