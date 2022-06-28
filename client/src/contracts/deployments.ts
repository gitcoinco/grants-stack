export const chains: { [key: number]: string } = {
  5: "goerli",
  69: "optimisticKovan",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xa449048290cf2c68c387ecf32847C59D9746C438",
  },
  optimisticKovan: {
    projectRegistry: "0xf90b4f383244fdf9dF7a28b1e8030d130E7c9be5",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
