import { ethers } from "ethers"
import { global } from "../../global"
import { api } from "../../api"


declare global {
  interface Window {
    ethereum: any;
  }
}

export type Web3Instance = {
  /**
   * Currently selected address in ETH format i.e 0x...
   */
  account: string;
  /**
   * Chain ID of the currently connected network
   */
  chainId: number;
}

const VALID_NETWORK_NAME = "Goerli";
const VALID_CHAIN_ID = 5;
const LOCAL_CHAIN_ID = 1337;

export const web3Api = api.injectEndpoints({
  endpoints: (builder) => ({
    getWeb3: builder.query<Web3Instance, void>({
      queryFn: async () => {
        try {
          if (!window.ethereum) {
            return { error: "not a web3 browser" }
          }

          global.web3Provider = new ethers.providers.Web3Provider(window.ethereum);

          const accounts: Array<string> = await window.ethereum.request({ method: "eth_requestAccounts" })

          const { chainId } = await global.web3Provider!.getNetwork()

          if (chainId !== VALID_CHAIN_ID && chainId !== LOCAL_CHAIN_ID) {
            return { error: `wrong network, please connect to ${VALID_NETWORK_NAME}` };
          }

          // Reload page on wallet events
          window.ethereum.on("chainChanged", () => window.location.reload())
          window.ethereum.on("accountsChanged", () => window.location.reload())
          window.ethereum.on("disconnect", () => window.location.reload())

          return { data: { account: accounts[0], chainId } }

        } catch (err) {
          console.log("error", err);
          return { error: "Unable to connect web3 account" }
        }
      },
    }),
  }),
  overrideExisting: false
})

export const { useGetWeb3Query } = web3Api