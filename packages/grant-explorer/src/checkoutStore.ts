import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CartProject, PayoutToken, ProgressStatus } from "./features/api/types";
import { ChainId } from "common";
import { useCartStorage } from "./store";
import {
  encodeAbiParameters,
  getAddress,
  Hex,
  parseAbi,
  parseAbiParameters,
  parseUnits,
  toHex,
  zeroAddress,
} from "viem";
import {
  signPermit2612,
  signPermitDai,
  voteUsingMRCContract,
} from "./features/api/voting";
import { MRC_CONTRACTS } from "./features/api/contracts";
import _ from "lodash";
import { datadogLogs } from "@datadog/browser-logs";
import { allChains } from "./app/wagmi";
import { WalletClient } from "wagmi";
import { getContract, PublicClient } from "@wagmi/core";

type ChainMap<T> = Partial<Record<ChainId, T>>;

interface CheckoutState {
  permitStatus: ChainMap<ProgressStatus>;
  setPermitStatusForChain: (
    chain: ChainId,
    permitStatus: ProgressStatus
  ) => void;
  voteStatus: ChainMap<ProgressStatus>;
  setVoteStatusForChain: (chain: ChainId, voteStatus: ProgressStatus) => void;
  currentChainBeingCheckedOut?: ChainId;
  /** Checkout the given chains
   * this has the side effect of adding the chains to the wallet if they are not yet present
   * We get the data necessary to construct the votes from the cart store */
  checkout: (
    chainsToCheckout: { chainId: ChainId; permitDeadline: number }[],
    walletClient: WalletClient,
    publicClient: PublicClient
  ) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  devtools((set, get) => ({
    permitStatus: {},
    setPermitStatusForChain: (chain: ChainId, permitStatus: ProgressStatus) =>
      set({
        permitStatus: { ...get().permitStatus, [chain]: permitStatus },
      }),
    voteStatus: {},
    setVoteStatusForChain: (chain: ChainId, voteStatus: ProgressStatus) =>
      set({
        voteStatus: { ...get().voteStatus, [chain]: voteStatus },
      }),
    currentChainBeingCheckedOut: undefined,
    checkout: async (
      chainsToCheckout: { chainId: ChainId; permitDeadline: number }[],
      walletClient: WalletClient,
      publicClient: PublicClient
    ) => {
      const chainIdsToCheckOut = chainsToCheckout.map((chain) => chain.chainId);
      const projectsToCheckOut = useCartStorage
        .getState()
        .projects.filter((project) => project.chainId in chainIdsToCheckOut);

      const projectsByChain = _.groupBy(projectsToCheckOut, "chainId") as {
        [chain: number]: CartProject[];
      };

      const payoutTokens = useCartStorage.getState().chainToPayoutToken;

      const totalDonationPerChain = Object.fromEntries(
        Object.entries(projectsByChain).map(([key, value]) => [
          Number(key) as ChainId,
          value
            .map((project) => project.amount)
            .reduce(
              (acc, amount) =>
                acc +
                parseUnits(
                  amount ? amount : "0",
                  payoutTokens[Number(key) as ChainId].decimal
                ),
              0n
            ),
        ])
      );

      /* Main chain loop */
      for (const currentChain of chainsToCheckout) {
        const chainId = currentChain.chainId;
        const deadline = currentChain.permitDeadline;
        const donations = projectsByChain[chainId];

        set({
          currentChainBeingCheckedOut: chainId,
        });

        /* Switch to the current chain */
        await switchToChain(chainId, walletClient);

        const token = payoutTokens[chainId];

        let sig;
        let nonce;

        if (token.address !== zeroAddress) {
          /* Need permit */
          try {
            get().setPermitStatusForChain(chainId, ProgressStatus.IN_PROGRESS);

            const owner = walletClient.account.address;
            /* Get nonce and name from erc20 contract */
            const erc20Contract = getContract({
              address: token.address as Hex,
              abi: parseAbi([
                "function nonces(address) public view returns (uint256)",
                "function name() public view returns (string)",
              ]),
              walletClient,
            });
            nonce = await erc20Contract.read.nonces([owner]);
            const tokenName = await erc20Contract.read.name();
            /*TODO: better dai test, extract into function, test*/
            if (/DAI/i.test(tokenName)) {
              sig = await signPermitDai({
                walletClient: walletClient,
                spender: MRC_CONTRACTS[chainId],
                chainId,
                deadline,
                contractAddress: token.address,
                erc20Name: tokenName,
                owner,
                nonce,
              });
            } else {
              sig = await signPermit2612({
                walletClient: walletClient,
                value: totalDonationPerChain[chainId],
                spender: MRC_CONTRACTS[chainId],
                nonce,
                chainId,
                deadline,
                contractAddress: token.address,
                erc20Name: tokenName,
                owner,
              });
            }

            get().setPermitStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
          } catch (e) {
            console.error(e);
            get().setPermitStatusForChain(chainId, ProgressStatus.IS_ERROR);
            return;
          }

          if (!sig) {
            get().setPermitStatusForChain(chainId, ProgressStatus.IS_ERROR);
            return;
          }
        }

        try {
          /** When voting via native toke, we just set the permit status to success */
          if (!sig) {
            get().setPermitStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
          }
          get().setVoteStatusForChain(chainId, ProgressStatus.IN_PROGRESS);

          /* Group donations by round */
          const groupedDonations = _.groupBy(
            donations.map((d) => ({
              ...d,
              roundId: getAddress(d.roundId),
            })),
            "roundId"
          );

          const groupedEncodedVotes: Record<string, Hex[]> = {};
          for (const roundId in groupedDonations) {
            groupedEncodedVotes[roundId] = encodeQFVotes(
              token,
              groupedDonations[roundId]
            );
          }

          const groupedAmounts: Record<string, bigint> = {};
          for (const roundId in groupedDonations) {
            groupedAmounts[roundId] = groupedDonations[roundId].reduce(
              (acc, donation) =>
                acc + parseUnits(donation.amount, token.decimal),
              0n
            );
          }

          const receipt = await voteUsingMRCContract(
            walletClient,
            publicClient,
            token,
            groupedEncodedVotes,
            groupedAmounts,
            totalDonationPerChain[chainId],
            sig,
            deadline,
            nonce
          );

          console.log("vote receipt", receipt);

          get().setVoteStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
        } catch (error) {
          datadogLogs.logger.error(
            `error: vote - ${error}. Data - ${donations.toString()}`
          );
          console.error(
            `vote on chain ${chainId} - roundIds ${Object.keys(
              donations.map((d) => d.roundId)
            )}, token ${token.name}`,
            error
          );
          get().setVoteStatusForChain(chainId, ProgressStatus.IS_ERROR);
          throw error;
        }
      }
      /* End main chain loop*/
    },
  }))
);

/** This function handles switching to a chain
 * if the chain is not present in the wallet, it will add it, and then switch */
async function switchToChain(chainId: ChainId, walletClient: WalletClient) {
  const nextChainData = allChains[chainId];
  /* Try switching normally */
  try {
    await walletClient.switchChain({
      id: chainId,
    });
  } catch (e) {
    /** Chain might not be added in wallet yet. Request to add it to the wallet */
    await walletClient.addChain({
      chain: {
        id: nextChainData.id,
        name: nextChainData.name,
        network: nextChainData.network,
        nativeCurrency: nextChainData.nativeCurrency,
        rpcUrls: nextChainData.rpcUrls,
        blockExplorers: nextChainData.blockExplorers,
      },
    });

    /* Some wallets switch automatically (CB), some don't (Metamask). If chain isn't switched in 1000 seconds, prompt to switch */
  }
}

function encodeQFVotes(
  donationToken: PayoutToken,
  donations: CartProject[]
): Hex[] {
  return donations.map((donation) => {
    const vote = [
      getAddress(donationToken.address) as Hex,
      parseUnits(donation.amount, donationToken.decimal),
      getAddress(donation.recipient),
      toHex(donation.projectRegistryId),
      BigInt(donation.applicationIndex),
    ] as const;

    return encodeAbiParameters(
      parseAbiParameters(["address,uint256,address,bytes32,uint256"]),
      vote
    );
  });
}
