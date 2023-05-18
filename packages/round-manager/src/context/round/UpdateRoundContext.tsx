import { datadogLogs } from "@datadog/browser-logs";
import { TransactionBuilder } from "../../features/api/round";
import React, { SetStateAction, createContext, useContext } from "react";
import { saveToIPFS } from "../../features/api/ipfs";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { EditedGroups, ProgressStatus, Round } from "../../features/api/types";
import { getPayoutTokenOptions } from "../../features/api/utils";
import { useWalletClient, WalletClient } from "wagmi";
import { parseUnits } from "viem";

type SetStatusFn = React.Dispatch<SetStateAction<ProgressStatus>>;

export type UpdateRoundData = {
  round: Round;
  editedGroups: EditedGroups;
};

export interface UpdateRoundState {
  IPFSCurrentStatus: ProgressStatus;
  setIPFSCurrentStatus: SetStatusFn;
  roundUpdateStatus: ProgressStatus;
  setRoundUpdateStatus: SetStatusFn;
  indexingStatus: ProgressStatus;
  setIndexingStatus: SetStatusFn;
}

export const initialUpdateRoundState: UpdateRoundState = {
  IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
  setIPFSCurrentStatus: () => {
    /* empty */
  },
  roundUpdateStatus: ProgressStatus.NOT_STARTED,
  setRoundUpdateStatus: () => {
    /* empty */
  },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => {
    /* empty */
  },
};

export const UpdateRoundContext = createContext<UpdateRoundState>(
  initialUpdateRoundState
);

export const UpdateRoundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [IPFSCurrentStatus, setIPFSCurrentStatus] =
    React.useState<ProgressStatus>(initialUpdateRoundState.IPFSCurrentStatus);
  const [roundUpdateStatus, setRoundUpdateStatus] =
    React.useState<ProgressStatus>(initialUpdateRoundState.roundUpdateStatus);

  const [indexingStatus, setIndexingStatus] = React.useState<ProgressStatus>(
    initialUpdateRoundState.indexingStatus
  );

  const providerProps: UpdateRoundState = {
    IPFSCurrentStatus,
    setIPFSCurrentStatus,
    roundUpdateStatus,
    setRoundUpdateStatus,
    indexingStatus,
    setIndexingStatus,
  };

  return (
    <UpdateRoundContext.Provider value={providerProps}>
      {children}
    </UpdateRoundContext.Provider>
  );
};

interface _updateRoundParams {
  context: UpdateRoundState;
  walletClient: WalletClient;
  updateRoundData: UpdateRoundData;
}

const _updateRound = async ({
  context,
  walletClient,
  updateRoundData,
}: _updateRoundParams) => {
  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { round, editedGroups } = updateRoundData;

  const transactionBuilder = new TransactionBuilder(round, walletClient);
  const chainId = await walletClient.getChainId();

  try {
    datadogLogs.logger.info(`_updateRound: ${round}`);

    // ipfs/metapointer related updates
    try {
      if (
        editedGroups.RoundMetaPointer ||
        editedGroups.ApplicationMetaPointer
      ) {
        setIPFSCurrentStatus(ProgressStatus.IN_PROGRESS);
        if (editedGroups.RoundMetaPointer) {
          console.log("updating round metadata");
          const ipfsHash: string = await saveToIPFS({
            content: round.roundMetadata,
          });
          transactionBuilder.add("updateRoundMetaPtr", [
            {
              protocol: 1n,
              pointer: ipfsHash,
            },
          ]);
        }
        if (editedGroups.ApplicationMetaPointer) {
          console.log("updating application metadata");
          if (round.applicationMetadata === undefined)
            throw new Error("Application metadata is undefined");
          const ipfsHash: string = await saveToIPFS({
            content: round.applicationMetadata,
          });
          transactionBuilder.add("updateApplicationMetaPtr", [
            {
              protocol: 1n,
              pointer: ipfsHash,
            },
          ]);
        }
        setIPFSCurrentStatus(ProgressStatus.IS_SUCCESS);
      }
    } catch (error) {
      datadogLogs.logger.error(`_updateRound: ${error}`);
      setIPFSCurrentStatus(ProgressStatus.IS_ERROR);
      throw error;
    }

    // direct contract updates
    if (editedGroups.MatchAmount) {
      console.log("updating match amount");
      const decimals = getPayoutTokenOptions(chainId).find(
        (token) => token.address === round.token
      )?.decimal;
      // use ethers to convert amount using decimals
      const arg = parseUnits(
        round?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toString() as `${number}`,
        decimals ?? 18
      );
      transactionBuilder.add("updateMatchAmount", [arg]);
    }

    // if (editedGroups.RoundFeeAddress) {
    //   const arg = "abcd"; // todo: add valid value
    //   transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_ADDRESS, [arg]);
    // }

    if (editedGroups.RoundFeePercentage) {
      console.log("updating round fee percentage");
      const arg =
        round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable;
      transactionBuilder.add("updateRoundFeePercentage", [arg]);
    }

    if (editedGroups.StartAndEndTimes) {
      console.log("updating start and end times");
      transactionBuilder.add("updateStartAndEndTimes", [
        BigInt(Date.parse(round?.applicationsStartTime.toString()) / 1000),
        BigInt(Date.parse(round?.applicationsEndTime.toString()) / 1000),
        BigInt(Date.parse(round?.roundStartTime.toString()) / 1000),
        BigInt(Date.parse(round?.roundEndTime.toString()) / 1000),
      ]);
    }

    setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);

    const tx = await transactionBuilder.execute();

    setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);
    setIndexingStatus(ProgressStatus.IN_PROGRESS);

    try {
      await waitForSubgraphSyncTo(chainId, tx.blockNumber);
      setIndexingStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      datadogLogs.logger.error(`_updateRound: ${error}`);
      setIndexingStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  } catch (error) {
    datadogLogs.logger.error(`_updateRound: ${error}`);
    setRoundUpdateStatus(ProgressStatus.IS_ERROR);
    console.log("_updateRound error: ", error);
  }
};

export const useUpdateRound = () => {
  const context = useContext(UpdateRoundContext);
  if (!context) throw new Error("Missing UpdateRoundContext");

  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { data: walletClient } = useWalletClient();
  if (!walletClient) {
    throw "WalletClient not initialized";
  }

  const updateRound = async (updateRoundData: UpdateRoundData) => {
    setIPFSCurrentStatus(initialUpdateRoundState.IPFSCurrentStatus);
    setRoundUpdateStatus(initialUpdateRoundState.roundUpdateStatus);
    setIndexingStatus(initialUpdateRoundState.indexingStatus);

    return _updateRound({
      context,
      walletClient,
      updateRoundData,
    });
  };

  return {
    updateRound,
    IPFSCurrentStatus: context.IPFSCurrentStatus,
    roundUpdateStatus: context.roundUpdateStatus,
    indexingStatus: context.indexingStatus,
  };
};
