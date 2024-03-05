import { useState } from "react";
import ProgressModal from "../common/ProgressModal";
import { InformationCircleIcon } from "@heroicons/react/solid";
import ReactTooltip from "react-tooltip";
import ErrorModal from "../common/ErrorModal";
import { useWallet } from "../common/Auth";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { ExternalLinkIcon } from "@heroicons/react/outline";
import { Erc20__factory } from "../../types/generated/typechain";
import { usePayout } from "../../context/application/usePayout";
import { Button, Input } from "common/src/styles";
import { BigNumber, ethers } from "ethers";
import { AnswerBlock, GrantApplication, Round } from "../api/types";
import { formatUTCDateAsISOString, getUTCTime } from "common";
import { useNetwork } from "wagmi";
import { errorModalDelayMs } from "../../constants";
import { getPayoutTokenOptions } from "../api/payoutTokens";
import { usePayouts } from "./usePayouts";

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Payment amount must be a number")
    .required("Payment amount is required"),
  address: yup
    .string()
    .required("Vault address is required")
    .matches(/^0x[a-fA-F0-9]{40}$/, "Must be a valid ethereum address"),
});

type FormData = {
  amount: number;
  address: string;
};

type Props = {
  round: Round;
  application: GrantApplication;
  answerBlocks: AnswerBlock[];
};

export default function ApplicationDirectPayout({
  round,
  application,
  answerBlocks,
}: Props) {
  const { chain, address, signer } = useWallet();
  const { triggerPayout, progressSteps: payoutProgressSteps } = usePayout();
  const [isPayoutProgressModelOpen, setIsPayoutProgressModelOpen] =
    useState(false);
  const [payoutError, setPayoutError] = useState<
    { message: string; retry?: () => void } | undefined
  >();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const network = useNetwork();

  const allInputs = watch();

  const { data: payouts } = usePayouts({
    chainId: chain.id,
    roundId: round.id,
    applicationIndex: application.applicationIndex,
  });

  // find answer with question "Payout token"
  const payoutTokenAnswer = answerBlocks?.find(
    (a) => a.question === "Payout token"
  );
  if (payoutTokenAnswer === undefined) {
    throw Error('"Payout token" not found in answers!');
  }
  // find token info based on payoutTokenAnswer
  const tokensByChainInfo = getPayoutTokenOptions(chain.id);
  const tokenInfo = tokensByChainInfo.find(
    (t) => t.name.toLowerCase() === payoutTokenAnswer.answer?.toLowerCase()
  );

  if (!tokenInfo) {
    throw Error(
      `Token info not found for chain id: ${chain.id} and token ${payoutTokenAnswer}!`
    );
  }
  // get payout wallet address
  const payoutWalletAddress = application.recipient;
  if (payoutWalletAddress === undefined) {
    throw Error('"Payout wallet address" not found in answers!');
  }

  const getAmountWithFee = () => {
    const amount = Number(allInputs.amount) || 0;
    const protocolFee = round.protocolFeePercentage ?? 0;
    const roundFee = round.roundFeePercentage ?? 0;
    return amount + amount * (protocolFee + roundFee);
  };

  const onSubmit = async (data: FormData) => {
    // check round exists
    if (
      round === undefined ||
      signer === undefined ||
      application.project?.id === undefined ||
      application.applicationIndex === undefined ||
      application.projectId === undefined
    ) {
      throw Error(`Round or signer not found!`);
    }

    const amountBN = ethers.utils.parseUnits(
      data.amount.toString(),
      tokenInfo.decimal
    );
    const amountWithFee = getAmountWithFee();
    const amountWithFeeBN = ethers.utils.parseUnits(
      amountWithFee.toString(),
      tokenInfo.decimal
    );

    const erc20 = Erc20__factory.connect(tokenInfo.address, signer);
    const allowance = await erc20.allowance(
      data.address,
      round.payoutStrategy.id
    );
    if (
      allowance.lt(amountWithFeeBN) &&
      address.toLowerCase() !== data.address.toLowerCase()
    ) {
      setPayoutError({
        message: `In order to continue you need to allow the payout strategy contract with address ${round.payoutStrategy.id} to spend ${amountWithFee} ${tokenInfo.name} tokens.`,
      });
      return;
    }

    setIsPayoutProgressModelOpen(true);

    if (payoutWalletAddress === undefined) {
      throw Error("Payout wallet address not found in answers!");
    }

    try {
      await triggerPayout({
        address,
        signer,
        token: tokenInfo,
        projectId: application.projectId,
        applicationIndex: application.applicationIndex,
        payoutStrategyAddress: round.payoutStrategy.id,
        payoutAmount: amountBN,
        payoutVault: data.address,
        payoutWallet: payoutWalletAddress,
        allowance,
      });

      window.location.reload();
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        setIsPayoutProgressModelOpen(false);
      }, errorModalDelayMs);
      setPayoutError({
        message: "There was an error trying to trigger the payout.",
        retry: () => onSubmit(data),
      });
    }
  };

  return (
    <>
      <section
        className="payouts flex flex-col gap-6 mt-3"
        data-testid="application-direct-payout"
      >
        {payouts && (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex pt-6 border-t border-gray-100">
                <span className="text-sm leading-5 text-gray-500 font-semibold text-left">
                  Previous Payments
                </span>
                <span className="text-xs leading-5 text-violet-400 text-left ml-auto">
                  ({payouts.length}) Payouts
                </span>
              </div>
              {payouts.length === 0 && (
                <p className="text-sm leading-5 text-gray-300 text-left">
                  Payouts have not been made yet.
                </p>
              )}
            </div>

            {payouts.length > 0 && (
              <>
                {/* Table */}
                <div className="col-span-3 border border-gray-100 rounded p-4 row-span-2 overflow-y-auto max-h-80">
                  <table className="table-fixed border-separate h-full w-full">
                    <thead className="font-normal">
                      <tr>
                        <th className="text-sm leading-5 pr-2 text-gray-500 text-left w-auto">
                          Transaction ID
                        </th>
                        <th className="text-sm leading-5 px-2 text-gray-500 text-left w-32">
                          Amount
                        </th>
                        <th className="text-sm leading-5 px-2 text-gray-500 text-left w-44">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody data-testid="direct-payout-payments-table">
                      {payouts
                        .filter(
                          (p) =>
                            p.applicationIndex === application.applicationIndex
                        )
                        .map((payout) => (
                          <tr key={payout.txnHash}>
                            <td className="text-sm leading-5 py-2 pr-2 text-gray-400 text-left">
                              <div className="flex flex-nowrap content-center">
                                <span className="text-ellipsis overflow-hidden whitespace-nowrap min-w-[2rem]">
                                  {payout.txnHash}
                                </span>
                                <a
                                  target="_blank"
                                  href={`${network.chain?.blockExplorers?.default.url}/tx/${payout.txnHash}`}
                                  className="inline items-center ml-2"
                                  rel="noreferrer"
                                >
                                  <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                              </div>
                            </td>
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left text-ellipsis overflow-hidden">
                              {ethers.utils.formatUnits(
                                payout.amount,
                                tokenInfo.decimal
                              )}{" "}
                              {tokenInfo.name}
                            </td>
                            <td className="text-sm leading-5 px-2 text-gray-400 text-left">
                              {formatUTCDateAsISOString(
                                new Date(Number(payout.createdAt) * 1000)
                              )}
                              &nbsp;
                              {getUTCTime(
                                new Date(Number(payout.createdAt) * 1000)
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {/* Totals */}
                <div className="flex px-4 pb-6">
                  <p
                    className="text-sm text-gray-400 text-left flex gap-4 content-center"
                    data-testid="direct-payout-payments-total"
                  >
                    <span>Total paid out:</span>
                    <span>
                      {ethers.utils.formatUnits(
                        payouts
                          .filter(
                            (p) =>
                              p.applicationIndex ===
                              application.applicationIndex
                          )
                          .reduce(
                            (sum, payout) => sum.add(payout.amount),
                            BigNumber.from(0)
                          ),
                        tokenInfo.decimal
                      )}{" "}
                      {tokenInfo.name}
                    </span>
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* Payout form */}
        <strong className="block font-semibold text-sm">New Payment</strong>

        {/* form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 sm:items-start shadow-sm text-grey-500 rounded border border-solid border-gray-100"
        >
          <div className="pt-7 pb-3.5 px-6 flex flex-col gap-4">
            <div className="inputBox">
              <label htmlFor="" className="block text-sm">
                <p className="text-sm">
                  <span>Amount</span>
                  <span className="text-right text-violet-400 float-right text-xs mt-1">
                    *Required
                  </span>
                </p>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 pr-2">
                  <span className="text-gray-400 sm:text-sm">
                    {tokenInfo.name}
                  </span>
                </div>
                <Input
                  {...register("amount")}
                  className={`block w-full rounded-md border-gray-300   ${
                    tokenInfo.name.length <= 4 ? "pl-12" : "pl-16"
                  } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 h-10`}
                  type="number"
                  placeholder="Enter payout amount"
                  aria-describedby="token-symbol"
                  $hasError={errors.amount !== undefined}
                  step="any"
                  data-testid="payout-amount-input"
                />
              </div>
              {errors.amount !== undefined && (
                <p className="text-xs text-pink-500">
                  {errors.amount?.message}
                </p>
              )}
            </div>
            <div className="inputBox">
              <label htmlFor="" className="block text-sm">
                <p className="text-sm">
                  <span>Vault Address</span>
                  <span className="text-right text-violet-400 float-right text-xs mt-1">
                    *Required
                  </span>
                </p>
              </label>
              <div className="mt-2 rounded-md shadow-sm">
                <Input
                  className={
                    "block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 h-10"
                  }
                  type="text"
                  {...register("address")}
                  placeholder="Enter vault address"
                  aria-describedby="Vault-address"
                  $hasError={errors.amount !== undefined}
                  data-testid="payout-amount-address"
                />
              </div>
              {errors.address !== undefined && (
                <p className="text-xs text-pink-500">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="flex flex-col max-w-xl">
              <div className="flex flex-row justify-start mt-2">
                <div className="flex flex-row text-sm w-1/3">
                  Protocol fee:
                  <span>
                    <InformationCircleIcon
                      data-tip
                      data-background-color="#0E0333"
                      data-for="protocol-fee-tooltip"
                      className="mt-1 ml-1 text-gray-900 w-3 h-3"
                      data-testid={"protocol-fee-tooltip"}
                    />
                    <ReactTooltip
                      id="protocol-fee-tooltip"
                      place="bottom"
                      type="dark"
                      effect="solid"
                    >
                      <p className="text-xs">
                        Allo Protocol can be configured to charge fees
                        <br />
                        for use. These fees are paid to GitcoinDAO, who
                        <br />
                        use the funds to fund public goods. If enabled,
                        <br />
                        the fee is calculated as a percentage of your
                        <br />
                        funding pool, added on top of your pool.
                      </p>
                    </ReactTooltip>
                  </span>
                </div>
                <p className="text-sm">
                  {(round.protocolFeePercentage || 0) * 100} %
                </p>
              </div>
              <div className="flex flex-row justify-start mt-4">
                <div className="flex flex-row text-sm w-1/3">
                  Round fee:
                  <span>
                    <InformationCircleIcon
                      data-tip
                      data-background-color="#0E0333"
                      data-for="round-fee-tooltip"
                      className="mt-1 ml-1 text-gray-900 w-3 h-3"
                      data-testid={"round-fee-tooltip"}
                    />
                    <ReactTooltip
                      id="round-fee-tooltip"
                      place="bottom"
                      type="dark"
                      effect="solid"
                    >
                      <p className="text-xs">
                        The round fees are any additional charges
                        <br />
                        for services used to run your round. These
                        <br />
                        can be software services (i.e. this user interface)
                        <br />
                        or other specialty tools. If enabled, they are
                        <br />
                        calculated as a percentage of your funding pool.
                      </p>
                    </ReactTooltip>
                  </span>
                </div>
                <p className="text-sm">
                  {(round.roundFeePercentage || 0) * 100}%
                </p>
              </div>
            </div>
            <div className="rounded-md bg-violet-100 py-4 px-4 text-violet-400 flex mt-2 text-sm">
              <InformationCircleIcon className="w-4 h-4 mr-2 mt-0.5" />
              <span className="font-medium">
                <strong>Important:</strong>
                <p>
                  Make sure the vault address has a balance of at least{" "}
                  {getAmountWithFee()} {tokenInfo.name}.
                </p>
                {allInputs.address &&
                  address.toLowerCase() !== allInputs.address.toLowerCase() && (
                    <p>
                      Make sure the vault address has allowed the payout
                      contract with address {round.payoutStrategy.id} to spend{" "}
                      {getAmountWithFee()} {tokenInfo.name}.
                    </p>
                  )}
              </span>
            </div>
          </div>
          <div className="px-6 align-middle py-3.5 bg-[#F3F3F5]">
            <Button
              className="float-right"
              type="submit"
              data-testid="trigger-payment"
            >
              Payout
            </Button>
          </div>
        </form>
      </section>
      <ProgressModal
        isOpen={isPayoutProgressModelOpen}
        subheading={"Please hold while we update the grant application."}
        steps={payoutProgressSteps}
      />
      <ErrorModal
        isOpen={payoutError !== undefined}
        subheading={payoutError?.message}
        setIsOpen={() => setPayoutError(undefined)}
        tryAgainFn={payoutError?.retry}
        doneFn={() => setPayoutError(undefined)}
      />
    </>
  );
}
