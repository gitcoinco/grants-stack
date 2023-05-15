import React, { SetStateAction, createContext, useContext } from "react";
import { EditedGroups, ProgressStatus, Round } from "../../features/api/types";
import { Signer } from "ethers";
import { datadogLogs } from "@datadog/browser-logs";
import { TransactionBuilder, UpdateAction } from "../../features/api/round";
import { saveToIPFS } from "../../features/api/ipfs";
import { useWallet } from "../../features/common/Auth";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";

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
  setIPFSCurrentStatus: () => { },
  roundUpdateStatus: ProgressStatus.NOT_STARTED,
  setRoundUpdateStatus: () => { },
  indexingStatus: ProgressStatus.NOT_STARTED,
  setIndexingStatus: () => { },
};

export const UpdateRoundContext = createContext<UpdateRoundState>(
  initialUpdateRoundState,
);

export const UpdateRoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [IPFSCurrentStatus, setIPFSCurrentStatus] = React.useState<ProgressStatus>(
    initialUpdateRoundState.IPFSCurrentStatus,
  );
  const [roundUpdateStatus, setRoundUpdateStatus] = React.useState<ProgressStatus>(
    initialUpdateRoundState.roundUpdateStatus,
  );

  const [indexingStatus, setIndexingStatus] = React.useState<ProgressStatus>(
    initialUpdateRoundState.indexingStatus,
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
    <UpdateRoundContext.Provider
      value={providerProps}
    >
      {children}
    </UpdateRoundContext.Provider>
  );
}

interface _updateRoundParams {
  context: UpdateRoundState;
  signerOrProvider: Signer;
  updateRoundData: UpdateRoundData;
}

const _updateRound = async ({
  context,
  signerOrProvider,
  updateRoundData,
}: _updateRoundParams) => {
  const {
    setIPFSCurrentStatus,
    setRoundUpdateStatus,
    setIndexingStatus
  } = context;

  const {
    round,
    editedGroups,
  } = updateRoundData;

  const transactionBuilder = new TransactionBuilder(round, signerOrProvider);

  try {
    datadogLogs.logger.info(`_updateRound: ${round}`);

    // ipfs/metapointer related updates
    try {
      if (editedGroups.RoundMetaPointer || editedGroups.ApplicationMetaPointer) {
        setIPFSCurrentStatus(ProgressStatus.IN_PROGRESS);
        if (editedGroups.RoundMetaPointer) {
          const ipfsHash: string = await saveToIPFS({ content: round.roundMetadata })
          transactionBuilder.add(UpdateAction.UPDATE_ROUND_META_PTR, [ipfsHash]);
        }
        if (editedGroups.ApplicationMetaPointer) {
          if (round.applicationMetadata === undefined)
            throw new Error("Application metadata is undefined");
          const ipfsHash: string = await saveToIPFS({ content: round.applicationMetadata })
          transactionBuilder.add(UpdateAction.UPDATE_APPLICATION_META_PTR, [ipfsHash]);
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
      const arg = round?.roundMetadata?.quadraticFundingConfig
        ?.matchingFundsAvailable;
      transactionBuilder.add(UpdateAction.UPDATE_MATCH_AMOUNT, [arg]);
    }

    // if (editedGroups.RoundFeeAddress) {
    //   const arg = "abcd"; // todo: add valid value
    //   transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_ADDRESS, [arg]);
    // }

    if (editedGroups.RoundFeePercentage) {
      const arg = round.roundMetadata?.quadraticFundingConfig
        ?.matchingFundsAvailable;
      transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_PERCENTAGE, [arg]);
    }

    if (editedGroups.StartAndEndTimes) {
      transactionBuilder.add(UpdateAction.UPDATE_ROUND_START_AND_END_TIMES, [
        round?.applicationsStartTime,
        round?.applicationsEndTime,
        round?.roundStartTime,
        round?.roundEndTime,
      ]);
    }

    setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);

    const tx = await transactionBuilder.execute();
    const receipt = await tx.wait();
    const blockNumber = receipt.blockNumber;

    setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);
    setIndexingStatus(ProgressStatus.IN_PROGRESS);

    try {
      const chainId = await signerOrProvider.getChainId();
      await waitForSubgraphSyncTo(chainId, blockNumber);
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

export const useUpdateRound = async () => {
  const context = useContext(UpdateRoundContext);
  if (!context) throw new Error("Missing UpdateRoundContext");

  const {
    setIPFSCurrentStatus,
    setRoundUpdateStatus,
    setIndexingStatus,
  } = context;

  const { signer: walletSigner } = useWallet();

  const updateRound = (updateRoundData: UpdateRoundData) => {

    setIPFSCurrentStatus(initialUpdateRoundState.IPFSCurrentStatus);
    setRoundUpdateStatus(initialUpdateRoundState.roundUpdateStatus);
    setIndexingStatus(initialUpdateRoundState.indexingStatus);

    return _updateRound({
      context,
      signerOrProvider: walletSigner as Signer,
      updateRoundData,
    });
  };

  return {
    updateRound,
    IPFSCurrentStatus: context.IPFSCurrentStatus,
    roundUpdateStatus: context.roundUpdateStatus,
    indexingStatus: context.indexingStatus,
  }
};