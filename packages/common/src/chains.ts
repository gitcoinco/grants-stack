export const getChainRPC = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "https://eth.llamarpc.com";

    case 250:
      return "https://fantom-rpc.gateway.pokt.network/";

    case 4002:
      return "https://fantom-testnet.public.blastapi.io/";

    case 10:
      return "https://rpc.ankr.com/optimism";

    case 5:
      return "https://ethereum-goerli.publicnode.com";

    default:
      throw Error("Unsupported chain");
  }
};
