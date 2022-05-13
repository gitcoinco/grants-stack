const chains: { [key: number]: string } = {
  5: "goerli",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    grantsRegistry: "0x103f030d4fFa9BFdDbAc853F3021B9d82D17b90A",
    grantNft: "0x1387FC00bf4a351B65d34cCD2acC4e8CB50ef0eF",
  },

  rinkeby: {
    grantNft: "0xC7B783ea546db45f4bFC1899446F3675A91Dad87",
  },
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};
