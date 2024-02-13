import { Dispatch, SetStateAction, useState } from "react";
import { ProgressStatus, ProgressStep } from "../../features/api/types";
import {
  DirectPayoutStrategy__factory,
  Erc20__factory,
} from "../../types/generated/typechain";
import { BigNumber, ethers } from "ethers";
import { waitForSubgraphSyncTo } from "../../features/api/subgraph";
import { PayoutToken } from "../../features/api/payoutTokens";

export function usePayout() {
  const [contractApproveSpendStatus, setContractApproveSpendStatus] =
    useState<ProgressStatus>(ProgressStatus.NOT_STARTED);
  const [contractUpdatingStatus, setContractUpdatingStatus] =
    useState<ProgressStatus>(ProgressStatus.NOT_STARTED);
  const [indexingStatus, setIndexingStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED
  );

  const progressSteps: ProgressStep[] = [
    {
      name: "Approve spending",
      description: `Approve spending limit to the payout contract.`,
      status: contractApproveSpendStatus,
    },
    {
      name: "Paying out",
      description: `Sending payment.`,
      status: contractUpdatingStatus,
    },
    {
      name: "Indexing",
      description: "The subgraph is indexing the data.",
      status: indexingStatus,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status:
        indexingStatus === ProgressStatus.IS_SUCCESS
          ? ProgressStatus.IN_PROGRESS
          : ProgressStatus.NOT_STARTED,
    },
  ];

  async function waitForSubgraphToUpdate(
    setIndexingStatus: Dispatch<SetStateAction<ProgressStatus>>,
    signerOrProvider: ethers.Signer,
    transactionBlockNumber: number
  ) {
    try {
      setIndexingStatus(ProgressStatus.IN_PROGRESS);

      const chainId = await signerOrProvider.getChainId();
      await waitForSubgraphSyncTo(chainId, transactionBlockNumber);

      setIndexingStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      console.error("waitForSubgraphToUpdate", error);
      setIndexingStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  }

  const resetStatuses = () => {
    setContractApproveSpendStatus(ProgressStatus.NOT_STARTED);
    setContractUpdatingStatus(ProgressStatus.NOT_STARTED);
    setIndexingStatus(ProgressStatus.NOT_STARTED);
  };

  type Args = {
    address: string;
    signer: ethers.Signer;
    token: PayoutToken;
    projectId: string;
    applicationIndex: number;
    payoutStrategyAddress: string;
    payoutAmount: BigNumber;
    payoutVault: string;
    payoutWallet: string;
    allowance: BigNumber;
  };

  const triggerPayout = async ({
    address,
    signer,
    token,
    projectId,
    applicationIndex,
    payoutStrategyAddress,
    payoutAmount,
    payoutVault,
    payoutWallet,
    allowance,
  }: Args) => {
    resetStatuses();

    // if not enough allowance, check if the wallet connected is the same as the payout vault
    if (
      allowance.lt(payoutAmount) &&
      address.toLowerCase() !== payoutVault.toLowerCase()
    ) {
      throw new Error(
        "The wallet connected is not the same as the payout vault, therefore there is not possible to set the allowance"
      );
    }

    // trigger allowance when needed
    if (allowance.lt(payoutAmount)) {
      const erc20 = Erc20__factory.connect(token.address, signer);
      setContractApproveSpendStatus(ProgressStatus.IN_PROGRESS);
      try {
        const approveReceipt = await erc20.approve(
          payoutStrategyAddress,
          payoutAmount
        );
        await approveReceipt.wait();
        setContractApproveSpendStatus(ProgressStatus.IS_SUCCESS);
      } catch (error) {
        setContractApproveSpendStatus(ProgressStatus.IS_ERROR);
        throw error;
      }
    } else {
      setContractApproveSpendStatus(ProgressStatus.IS_SUCCESS);
    }

    // Payout
    const directPayout = DirectPayoutStrategy__factory.connect(
      payoutStrategyAddress,
      signer
    );
    let txBlockNumber: number;
    try {
      setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);
      const payoutReceipt = await directPayout.payout({
        vault: payoutVault,
        token: token.address,
        amount: payoutAmount,
        grantAddress: payoutWallet,
        projectId: projectId,
        applicationIndex: applicationIndex,
        allowanceModule: ethers.constants.AddressZero,
        allowanceSignature: ethers.constants.HashZero,
      });
      const res = await payoutReceipt.wait();
      txBlockNumber = res.blockNumber;
      setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
    } catch (error) {
      setContractUpdatingStatus(ProgressStatus.IS_ERROR);
      throw error;
    }

    // Wait for subgraph to update
    waitForSubgraphToUpdate(setIndexingStatus, signer, txBlockNumber);
  };

  return {
    triggerPayout,
    progressSteps,
    contractUpdatingStatus,
    indexingStatus,
    contractApproveSpendStatus,
    setContractApproveSpendStatus,
    setContractUpdatingStatus,
    setIndexingStatus,
  };
}
