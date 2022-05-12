const chains: {[key: number]: string} = {
  5: "goerli",
};

export const addresses: {[key: string]: any} = {
  "goerli": {
    grantsRegistry: "0xD46dA05A659db4787F1d6D564A7Ee5b09457d431",
    grantNft: '0x1387FC00bf4a351B65d34cCD2acC4e8CB50ef0eF'
  },

  "rinkeby": {
    grantNft: '0xC7B783ea546db45f4bFC1899446F3675A91Dad87'
  }
}

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
}
