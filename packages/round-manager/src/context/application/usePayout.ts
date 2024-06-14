import { ProgressStatus, ProgressStep } from "../../features/api/types";
import { Erc20__factory } from "../../types/generated/typechain";
import { Allo, TToken } from "common";
import { Hex } from "viem";
import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from "@datadog/browser-logs";
import { useState } from "react";
import { JsonRpcSigner } from "@ethersproject/providers";

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
      description: "The data is being indexed.",
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

  const resetStatuses = () => {
    setContractApproveSpendStatus(ProgressStatus.NOT_STARTED);
    setContractUpdatingStatus(ProgressStatus.NOT_STARTED);
    setIndexingStatus(ProgressStatus.NOT_STARTED);
  };

  type Args = {
    address: string;
    signer: JsonRpcSigner;
    token: TToken;
    applicationId: Hex;
    applicationIndex: number;
    roundId: Hex | number;
    roundAddress: Hex;
    payoutAmount: bigint;
    payoutVault: Hex;
    payoutWallet: Hex;
    allowance: bigint;
    allo: Allo;
  };

  async function triggerPayout({
    address,
    signer,
    token,
    applicationId,
    applicationIndex,
    roundId,
    roundAddress,
    payoutAmount,
    payoutVault,
    payoutWallet,
    allowance,
    allo,
  }: Args) {
    resetStatuses();

    // if not enough allowance, check if the wallet connected is the same as the payout vault
    if (
      allowance < payoutAmount &&
      address.toLowerCase() !== payoutVault.toLowerCase()
    ) {
      throw new Error(
        "The wallet connected is not the same as the payout vault, therefore there is not possible to set the allowance"
      );
    }

    // trigger allowance when needed
    if (allowance < payoutAmount) {
      const erc20 = Erc20__factory.connect(token.address, signer);
      setContractApproveSpendStatus(ProgressStatus.IN_PROGRESS);
      try {
        const approveReceipt = await erc20.approve(roundAddress, payoutAmount);
        await approveReceipt.wait();
        setContractApproveSpendStatus(ProgressStatus.IS_SUCCESS);
      } catch (error) {
        setContractApproveSpendStatus(ProgressStatus.IS_ERROR);
        throw error;
      }
    } else {
      setContractApproveSpendStatus(ProgressStatus.IS_SUCCESS);
    }

    try {
      setContractUpdatingStatus(ProgressStatus.IN_PROGRESS);

      await allo
        .payoutDirectGrants({
          roundId: roundId,
          token: token.address,
          amount: payoutAmount,
          recipientAddress: payoutWallet,
          recipientId: applicationId,
          applicationIndex: applicationIndex,
          vault: payoutVault,
        })
        .on("transaction", (res) => {
          if (res.type === "success") {
            setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
          } else {
            console.error("Transaction Error", res.error);
            datadogRum.addError(res.error);
            datadogLogs.logger.warn("transaction error");
          }
        })
        .on("transactionStatus", (res) => {
          if (res.type === "success") {
            setContractUpdatingStatus(ProgressStatus.IS_SUCCESS);
            setIndexingStatus(ProgressStatus.IN_PROGRESS);
          } else {
            setContractUpdatingStatus(ProgressStatus.IS_ERROR);

            console.error("Transaction Status Error", res.error);
            datadogRum.addError(res.error);
            datadogLogs.logger.warn("transaction status error");
          }
        })
        .on("indexingStatus", (res) => {
          if (res.type === "success") {
            setIndexingStatus(ProgressStatus.IS_SUCCESS);
          }
        })
        .execute();
    } catch (error) {
      setContractUpdatingStatus(ProgressStatus.IS_ERROR);
      throw error;
    }
  }

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
