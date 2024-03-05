import { Signer } from "ethers";
import React, { SetStateAction, createContext, useContext } from "react";
// todo: update type
import { ProgressStatus, Round } from "../../features/api/types";
import { useWallet } from "../../features/common/Auth";

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

// todo: update this
const _updateRound = async ({
  context,
  signerOrProvider,
  updateRoundData,
}: _updateRoundParams) => {
  const { setIPFSCurrentStatus, setRoundUpdateStatus, setIndexingStatus } =
    context;

  const { round, editedGroups } = updateRoundData;
  const chainId = await signerOrProvider.getChainId();

  // call data-layer
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
