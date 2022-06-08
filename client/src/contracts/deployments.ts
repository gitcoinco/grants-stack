const chains: { [key: number]: string } = {
  5: "goerli",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    projectRegistry: "0xd5e67d9C4D22554F0aAAFcFD6fe4AB18BcBa3489",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
