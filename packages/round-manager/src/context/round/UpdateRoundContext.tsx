import { datadogLogs } from "@datadog/browser-logs";
import { Signer, ethers } from "ethers";
import React, { SetStateAction, createContext, useContext } from "react";
import { saveToIPFS } from "../../features/api/ipfs";
import { TransactionBuilder, UpdateAction } from "../../features/api/round";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { EditedGroups, ProgressStatus, Round } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";
import subSeconds from "date-fns/subSeconds";
import { getPayoutTokenOptions } from "../../features/api/payoutTokens";

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
  signerOrProvider: Signer;
  updateRoundData: UpdateRoundData;
}

const _updateRound = async ({
  context,
  signerOrProvider,
  updateRoundData,
}: _updateRoundParams) => {
  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { round, editedGroups } = updateRoundData;

  const transactionBuilder = new TransactionBuilder(round, signerOrProvider);
  const chainId = await signerOrProvider.getChainId();

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
          transactionBuilder.add(UpdateAction.UPDATE_ROUND_META_PTR, [
            { protocol: 1, pointer: ipfsHash },
          ]);
        }
        if (editedGroups.ApplicationMetaPointer) {
          console.log("updating application metadata");
          if (round.applicationMetadata === undefined)
            throw new Error("Application metadata is undefined");
          const ipfsHash: string = await saveToIPFS({
            content: round.applicationMetadata,
          });
          transactionBuilder.add(UpdateAction.UPDATE_APPLICATION_META_PTR, [
            { protocol: 1, pointer: ipfsHash },
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
      const arg = ethers.utils.parseUnits(
        round?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toString(),
        decimals
      );
      transactionBuilder.add(UpdateAction.UPDATE_MATCH_AMOUNT, [arg]);
      console.log(arg.toString());
    }

    // if (editedGroups.RoundFeeAddress) {
    //   const arg = "abcd"; // todo: add valid value
    //   transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_ADDRESS, [arg]);
    // }

    if (editedGroups.RoundFeePercentage) {
      console.log("updating round fee percentage");
      const arg =
        round.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable;
      transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_PERCENTAGE, [arg]);
    }

    /* Special case - if the application period or round has already started, and we are editing times,
     * we need to set newApplicationsStartTime and newRoundStartTime to something bigger than the block timestamp.
     * This won't actually update the values, it's done just to pass the checks in the contract
     * (and to confuse the developer).
     *  https://github.com/allo-protocol/allo-contracts/blob/9c50f53cbdc2844fbf3cfa760df438f6fe3f0368/contracts/round/RoundImplementation.sol#L339C1-L339C1 */
    if (Date.now() > round.applicationsStartTime.getTime()) {
      round.applicationsStartTime = subSeconds(round.applicationsEndTime, 10);
    }
    if (Date.now() > round.roundStartTime.getTime()) {
      round.roundStartTime = subSeconds(round.roundEndTime, 10);
    }

    if (editedGroups.StartAndEndTimes) {
      console.log("updating start and end times");
      transactionBuilder.add(UpdateAction.UPDATE_ROUND_START_AND_END_TIMES, [
        round?.applicationsStartTime.getTime() / 1000,
        round?.applicationsEndTime.getTime() / 1000,
        round?.roundStartTime.getTime() / 1000,
        round?.roundEndTime.getTime() / 1000,
      ]);
    }

    setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);

    const tx = await transactionBuilder.execute();
    const receipt = await tx.wait();
    const blockNumber = receipt.blockNumber;

    setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);
    setIndexingStatus(ProgressStatus.IN_PROGRESS);

    try {
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

export const useUpdateRound = () => {
  const context = useContext(UpdateRoundContext);
  if (!context) throw new Error("Missing UpdateRoundContext");

  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { signer: walletSigner } = useWallet();

  const updateRound = async (updateRoundData: UpdateRoundData) => {
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
  };
};
