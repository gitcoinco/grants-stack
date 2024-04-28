/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { CartProject, ProgressStatus } from "./features/api/types";
import { Allo, ChainId } from "common";
import { useCartStorage } from "./store";
import {
  Hex,
  InternalRpcError,
  parseAbi,
  parseUnits,
  SwitchChainError,
  UserRejectedRequestError,
  zeroAddress,
} from "viem";
import {
  encodeQFVotes,
  encodedQFAllocation,
  signPermit2612,
  signPermitDai,
} from "./features/api/voting";
import { groupBy, uniq } from "lodash-es";
import { getEnabledChains } from "./app/chainConfig";
import { WalletClient } from "wagmi";
import { getContract, getPublicClient } from "@wagmi/core";
import { getPermitType } from "common/dist/allo/voting";
import { MRC_CONTRACTS } from "common/dist/allo/addresses/mrc";
import { getConfig } from "common/src/config";
import { DataLayer } from "data-layer";

type ChainMap<T> = Record<ChainId, T>;

const isV2 = getConfig().allo.version === "allo-v2";
interface CheckoutState {
  permitStatus: ChainMap<ProgressStatus>;
  setPermitStatusForChain: (
    chain: ChainId,
    permitStatus: ProgressStatus
  ) => void;
  voteStatus: ChainMap<ProgressStatus>;
  setVoteStatusForChain: (chain: ChainId, voteStatus: ProgressStatus) => void;
  chainSwitchStatus: ChainMap<ProgressStatus>;
  setChainSwitchStatusForChain: (
    chain: ChainId,
    voteStatus: ProgressStatus
  ) => void;
  currentChainBeingCheckedOut?: ChainId;
  chainsToCheckout: ChainId[];
  setChainsToCheckout: (chains: ChainId[]) => void;
  /** Checkout the given chains
   * this has the side effect of adding the chains to the wallet if they are not yet present
   * We get the data necessary to construct the votes from the cart store */
  checkout: (
    chainsToCheckout: { chainId: ChainId; permitDeadline: number }[],
    walletClient: WalletClient,
    allo: Allo,
    dataLayer: DataLayer
  ) => Promise<void>;
  getCheckedOutProjects: () => CartProject[];
  checkedOutProjects: CartProject[];
  setCheckedOutProjects: (newArray: CartProject[]) => void;
}

const defaultProgressStatusForAllChains = Object.fromEntries(
  Object.values(getEnabledChains()).map((value) => [
    value.id as ChainId,
    ProgressStatus.NOT_STARTED,
  ])
) as ChainMap<ProgressStatus>;

export const useCheckoutStore = create<CheckoutState>()(
  devtools((set, get) => ({
    permitStatus: defaultProgressStatusForAllChains,
    setPermitStatusForChain: (chain: ChainId, permitStatus: ProgressStatus) =>
      set((oldState) => ({
        permitStatus: { ...oldState.permitStatus, [chain]: permitStatus },
      })),
    voteStatus: defaultProgressStatusForAllChains,
    setVoteStatusForChain: (chain: ChainId, voteStatus: ProgressStatus) =>
      set((oldState) => ({
        voteStatus: { ...oldState.voteStatus, [chain]: voteStatus },
      })),
    chainSwitchStatus: defaultProgressStatusForAllChains,
    setChainSwitchStatusForChain: (
      chain: ChainId,
      chainSwitchStatus: ProgressStatus
    ) =>
      set((oldState) => ({
        chainSwitchStatus: {
          ...oldState.chainSwitchStatus,
          [chain]: chainSwitchStatus,
        },
      })),
    currentChainBeingCheckedOut: undefined,
    chainsToCheckout: [],
    setChainsToCheckout: (chains: ChainId[]) => {
      set({
        chainsToCheckout: chains,
      });
    },
    checkout: async (
      chainsToCheckout: { chainId: ChainId; permitDeadline: number }[],
      walletClient: WalletClient,
      allo: Allo
    ) => {
      const chainIdsToCheckOut = chainsToCheckout.map((chain) => chain.chainId);
      get().setChainsToCheckout(
        uniq([...get().chainsToCheckout, ...chainIdsToCheckOut])
      );
      const projectsToCheckOut = useCartStorage
        .getState()
        .projects.filter((project) =>
          chainIdsToCheckOut.includes(project.chainId)
        );

      const projectsByChain = groupBy(projectsToCheckOut, "chainId") as {
        [chain: number]: CartProject[];
      };

      const getVotingTokenForChain =
        useCartStorage.getState().getVotingTokenForChain;

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
                  getVotingTokenForChain(Number(key) as ChainId).decimal
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
        await switchToChain(chainId, walletClient, get);

        const token = getVotingTokenForChain(chainId);

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
              chainId,
            });
            nonce = await erc20Contract.read.nonces([owner]);
            const tokenName = await erc20Contract.read.name();
            if (getPermitType(token) === "dai") {
              sig = await signPermitDai({
                walletClient: walletClient,
                spenderAddress: MRC_CONTRACTS[chainId],
                chainId,
                deadline: BigInt(deadline),
                contractAddress: token.address,
                erc20Name: tokenName,
                ownerAddress: owner,
                nonce,
                permitVersion: token.permitVersion ?? "1",
              });
            } else {
              sig = await signPermit2612({
                walletClient: walletClient,
                value: totalDonationPerChain[chainId],
                spenderAddress: MRC_CONTRACTS[chainId],
                nonce,
                chainId,
                deadline: BigInt(deadline),
                contractAddress: token.address,
                erc20Name: tokenName,
                ownerAddress: owner,
                permitVersion: token.permitVersion ?? "1",
              });
            }

            get().setPermitStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
          } catch (e) {
            if (!(e instanceof UserRejectedRequestError)) {
              console.error("permit error", e, {
                donations,
                chainId,
                tokenAddress: token.address,
              });
            }
            get().setPermitStatusForChain(chainId, ProgressStatus.IS_ERROR);
            return;
          }

          if (!sig) {
            get().setPermitStatusForChain(chainId, ProgressStatus.IS_ERROR);
            return;
          }
        } else {
          /** When voting via native token, we just set the permit status to success */
          get().setPermitStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
        }

        try {
          get().setVoteStatusForChain(chainId, ProgressStatus.IN_PROGRESS);

          /* Group donations by round */
          const groupedDonations = groupBy(
            donations.map((d) => ({
              ...d,
              roundId: d.roundId,
            })),
            "roundId"
          );

          const groupedEncodedVotes: Record<string, Hex[]> = {};

          for (const roundId in groupedDonations) {
            groupedEncodedVotes[roundId] = isV2
              ? encodedQFAllocation(token, groupedDonations[roundId])
              : encodeQFVotes(token, groupedDonations[roundId]);
          }

          const groupedAmounts: Record<string, bigint> = {};
          for (const roundId in groupedDonations) {
            groupedAmounts[roundId] = groupedDonations[roundId].reduce(
              (acc, donation) =>
                acc + parseUnits(donation.amount, token.decimal),
              0n
            );
          }

          const amountArray: bigint[] = [];
          for (const roundId in groupedDonations) {
            groupedDonations[roundId].map((donation) => {
              amountArray.push(parseUnits(donation.amount, token.decimal));
            });
          }

          const receipt = await allo.donate(
            getPublicClient({
              chainId,
            }),
            chainId,
            token,
            groupedEncodedVotes,
            isV2 ? amountArray : groupedAmounts,
            totalDonationPerChain[chainId],
            sig
              ? {
                  sig,
                  deadline,
                  nonce: nonce!,
                }
              : undefined
          );

          if (receipt.status === "reverted") {
            throw new Error("donate transaction reverted", {
              cause: { receipt },
            });
          }

          /* Remove checked out projects from cart */
          donations.forEach((donation) => {
            useCartStorage.getState().remove(donation);
          });
          set((oldState) => ({
            voteStatus: {
              ...oldState.voteStatus,
              [chainId]: ProgressStatus.IS_SUCCESS,
            },
          }));
          set({
            checkedOutProjects: [...get().checkedOutProjects, ...donations],
          });
        } catch (error) {
          let context: Record<string, unknown> = {
            chainId,
            donations,
            token,
          };

          if (error instanceof Error) {
            context = {
              ...context,
              error: error.message,
              cause: error.cause,
            };
          }

          // do not log user rejections
          if (!(error instanceof UserRejectedRequestError)) {
            console.error("donation error", error, context);
          }

          get().setVoteStatusForChain(chainId, ProgressStatus.IS_ERROR);
          throw error;
        }
      }
      /* End main chain loop*/
    },
    checkedOutProjects: [],
    getCheckedOutProjects: () => {
      return get().checkedOutProjects;
    },
    setCheckedOutProjects: (newArray: CartProject[]) => {
      set({
        checkedOutProjects: newArray,
      });
    },
  }))
);

/** This function handles switching to a chain
 * if the chain is not present in the wallet, it will add it, and then switch */
async function switchToChain(
  chainId: ChainId,
  walletClient: WalletClient,
  get: () => CheckoutState
) {
  get().setChainSwitchStatusForChain(chainId, ProgressStatus.IN_PROGRESS);
  const nextChainData = getEnabledChains().find(
    (chain) => chain.id === chainId
  );
  if (!nextChainData) {
    get().setChainSwitchStatusForChain(chainId, ProgressStatus.IS_ERROR);
    throw "next chain not found";
  }
  try {
    /* Try switching normally */
    await walletClient.switchChain({
      id: chainId,
    });
  } catch (e) {
    if (e instanceof UserRejectedRequestError) {
      console.log("Rejected!");
      get().setChainSwitchStatusForChain(chainId, ProgressStatus.IS_ERROR);
      return;
    } else if (e instanceof SwitchChainError || e instanceof InternalRpcError) {
      console.log("Chain not added yet, adding", { e });
      /** Chain might not be added in wallet yet. Request to add it to the wallet */
      try {
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
      } catch (e) {
        get().setChainSwitchStatusForChain(chainId, ProgressStatus.IS_ERROR);
        return;
      }
    } else {
      console.log("unhandled error when switching chains", { e });
      get().setChainSwitchStatusForChain(chainId, ProgressStatus.IS_ERROR);
      return;
    }
  }
  get().setChainSwitchStatusForChain(chainId, ProgressStatus.IS_SUCCESS);
}
