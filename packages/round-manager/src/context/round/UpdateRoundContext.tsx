import React, { SetStateAction, createContext } from "react";
import { EditedGroups, ProgressStatus, Round } from "../../features/api/types";
import { Signer } from "ethers";
import { datadogLogs } from "@datadog/browser-logs";
import { TransactionBuilder, UpdateAction } from "../../features/api/round";

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
 // todo: add indexing status?
}

export const initialUpdateRoundState: UpdateRoundState = {
 IPFSCurrentStatus: ProgressStatus.NOT_STARTED,
 setIPFSCurrentStatus: () => { },
 roundUpdateStatus: ProgressStatus.NOT_STARTED,
 setRoundUpdateStatus: () => { },
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

 const providerProps: UpdateRoundState = {
  IPFSCurrentStatus,
  setIPFSCurrentStatus,
  roundUpdateStatus,
  setRoundUpdateStatus,
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
     const ipfsHash: string = "abcd"; // todo: add valid value
     // pin to ipfs
     transactionBuilder.add(UpdateAction.UPDATE_ROUND_META_PTR, [ipfsHash]);
     // create transaction
    }
    if (editedGroups.ApplicationMetaPointer) {
     const ipfsHash: string = "abcd"; // todo: add valid value
     // pin to ipfs
     transactionBuilder.add(UpdateAction.UPDATE_APPLICATION_META_PTR, [ipfsHash]);
     // create transaction
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
   // create match amount transaction
   const arg = "abcd"; // todo: add valid value
   transactionBuilder.add(UpdateAction.UPDATE_MATCH_AMOUNT, [arg]);
  }

  if (editedGroups.RoundFeeAddress) {
   // create round fee address transaction
   const arg = "abcd"; // todo: add valid value
   transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_ADDRESS, [arg]);
  }

  if (editedGroups.RoundFeePercentage) {
   // create round fee percentage transaction
   const arg = "abcd"; // todo: add valid value
   transactionBuilder.add(UpdateAction.UPDATE_ROUND_FEE_PERCENTAGE, [arg]);
  }

  if (editedGroups.StartAndEndTimes) {
   // create start and end times transaction
   const arg = "abcd"; // todo: add valid value
   transactionBuilder.add(UpdateAction.UPDATE_ROUND_START_AND_END_TIMES, [arg]);
  }

  setRoundUpdateStatus(ProgressStatus.IN_PROGRESS);

  const tx = await transactionBuilder.execute();
  await tx.wait();

  setRoundUpdateStatus(ProgressStatus.IS_SUCCESS);

 } catch (error) {
  datadogLogs.logger.error(`_updateRound: ${error}`);
  setRoundUpdateStatus(ProgressStatus.IS_ERROR);
 }

};