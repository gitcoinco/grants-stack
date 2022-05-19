const chains: { [key: number]: string } = {
  5: "goerli",
};

export const addresses: { [key: string]: any } = {
  goerli: {
    grantsRegistry: "0x85F7332dA521AfeAd9452840C3415Ce6c6E304df",
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
