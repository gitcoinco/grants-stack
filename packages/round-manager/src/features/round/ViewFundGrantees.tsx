/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tab } from "@headlessui/react";
import { ExclamationCircleIcon as NonFinalizedRoundIcon } from "@heroicons/react/outline";
import { classNames, getTxBlockExplorerLink, useTokenPrice } from "common";
import { BigNumber, ethers } from "ethers";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useBalance } from "wagmi";
import { errorModalDelayMs, modalDelayMs } from "../../constants";
import { useGroupProjectsByPaymentStatus } from "../api/payoutStrategy/payoutStrategy";
import {
  MatchingStatsData,
  ProgressStatus,
  ProgressStep,
  Round,
  TransactionBlock,
} from "../api/types";
import { formatCurrency } from "../api/utils";
import { useWallet } from "../common/Auth";
import ConfirmationModal from "../common/ConfirmationModal";
import InfoModal from "../common/InfoModal";
import ProgressModal from "../common/ProgressModal";
import { Spinner } from "../common/Spinner";
import { assertAddress } from "common/src/address";
import { PayoutToken, payoutTokens } from "../api/payoutTokens";
import { useAllo } from "common";
import { getAddress } from "viem";
import { getConfig } from "common/src/config";

export default function ViewFundGrantees(props: {
  round: Round | undefined;
  isRoundFinalized: boolean | undefined;
}) {
  const [isFundGranteesFetched] = useState(false);

  if (isFundGranteesFetched) {
    return <Spinner text="We're fetching your data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Fund Grantees</p>
      {props.isRoundFinalized ? (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        <FinalizedRoundContent round={props.round!} />
      ) : (
        <NonFinalizedRoundContent />
      )}
    </div>
  );
}

function NonFinalizedRoundMessage() {
  return (
    <>
      <h2 className="mt-8 text-2xl antialiased">Round not finalized yet</h2>
      <div className="mt-2 text-sm">
        You will be able to pay out your grantees once the round results have
        been finalized.
      </div>
      <div className="text-sm">
        You can finalize the results in the Round Results tab.
      </div>
    </>
  );
}

function NonFinalizedRoundContent() {
  return (
    <div className="flex flex-center flex-col mx-auto h-screen items-center text-center mt-32">
      <div className="flex flex-center justify-center items-center bg-grey-150 rounded-full h-12 w-12 text-violet-400">
        <NonFinalizedRoundIcon className="w-6 h-6" />
      </div>
      <NonFinalizedRoundMessage />
    </div>
  );
}

const tabStyles = (selected: boolean) =>
  selected
    ? "border-violet-500 whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm outline-none"
    : "border-transparent text-grey-400 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 font-medium text-sm";

const TabApplicationCounter = tw.div`
    rounded-md
    ml-2
    w-8
    h-5
    float-right
    font-sm
    font-normal
    `;

function FinalizedRoundContent(props: { round: Round }) {
  const { chain } = useWallet();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const projects = useGroupProjectsByPaymentStatus(chain?.id, props.round);
  const [paidProjects, setPaidProjects] = useState<MatchingStatsData[]>([]);
  const [unpaidProjects, setUnpaidProjects] = useState<MatchingStatsData[]>([]);
  const [price, setPrice] = useState<number>(0);

  const matchingFundPayoutToken: PayoutToken = payoutTokens.filter(
    (t) =>
      t.address.toLowerCase() == props.round.token.toLowerCase() &&
      t.chainId == props.round.chainId
  )[0];

  const { data, error, loading } = useTokenPrice(
    matchingFundPayoutToken?.redstoneTokenId
  );

  useEffect(() => {
    if (data && !error && !loading) {
      setPrice(Number(data));
    }
    setPaidProjects(projects["paid"]);
    setUnpaidProjects(projects["unpaid"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  /* Fetch distributions data for this round */
  return (
    <div>
      <div>
        <Tab.Group>
          <div className="justify-end grow relative">
            <Tab.List className="border-b mb-6 flex items-center justify-between">
              <div className="space-x-8">
                <Tab className={({ selected }) => tabStyles(selected)}>
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Unpaid Grantees
                      <TabApplicationCounter
                        className={selected ? "bg-violet-100" : "bg-grey-150"}
                        data-testid="received-application-counter"
                      >
                        {unpaidProjects.length}
                      </TabApplicationCounter>
                    </div>
                  )}
                </Tab>
                <Tab className={({ selected }) => tabStyles(selected)}>
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Paid Grantees
                      <TabApplicationCounter
                        className={selected ? "bg-violet-100" : "bg-grey-150"}
                        data-testid="received-application-counter"
                      >
                        {paidProjects.length}
                      </TabApplicationCounter>
                    </div>
                  )}
                </Tab>
              </div>
            </Tab.List>
          </div>
          <Tab.Panels className="basis-5/6">
            <Tab.Panel>
              <PayProjectsTable
                projects={unpaidProjects}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                token={matchingFundPayoutToken!}
                price={price}
                round={props.round}
                allProjects={projects.all}
              />
            </Tab.Panel>
            <Tab.Panel>
              <PaidProjectsTable
                projects={paidProjects}
                chainId={chain?.id}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                token={matchingFundPayoutToken!}
                price={price}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

// TODO: Add types
export function PayProjectsTable(props: {
  projects: MatchingStatsData[];
  token: PayoutToken;
  price: number;
  round: Round;
  allProjects: MatchingStatsData[];
}) {
  // TODO: Add button check
  // TOOD: Connect wallet and payout contracts to pay grantees
  const { signer } = useWallet();
  const allo = useAllo();
  const alloVersion = getConfig().allo.version;
  const roundId = props.round.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkbox = useRef<any>();
  const [checked, setChecked] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [selectedProjects, setSelectedProjects] = useState<MatchingStatsData[]>(
    []
  );
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const [
    openReadyForDistributionProgressModal,
    setOpenReadyForDistributionProgressModal,
  ] = useState(false);

  const [finalizingDistributionStatus, setFinalizingDistributionStatus] =
    useState<ProgressStatus>(ProgressStatus.IN_PROGRESS);

  const [indexingStatus, setIndexingStatus] = useState<ProgressStatus>(
    ProgressStatus.NOT_STARTED
  );

  const tokenDetail =
    props.token.address == ethers.constants.AddressZero
      ? { address: assertAddress(props.round?.payoutStrategy.id) }
      : {
          address: assertAddress(props.round?.payoutStrategy.id),
          token: assertAddress(props.token.address),
        };

  const tokenBalance = useBalance(tokenDetail);
  const navigate = useNavigate();

  const distributionSteps: ProgressStep[] = [
    {
      name: "Distributing Funds",
      description: "Funds are being distributed to grantees.",
      status: finalizingDistributionStatus,
    },
    {
      name: "Finishing up",
      description: "We're wrapping up.",
      status: indexingStatus,
    },
  ];

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedProjects.length > 0 &&
      selectedProjects.length < props.projects.length;
    setChecked(selectedProjects.length === props.projects.length);
    setIndeterminate(isIndeterminate);
    checkbox.current.indeterminate = isIndeterminate;
  }, [selectedProjects, props.projects]);

  function toggleAll() {
    setSelectedProjects(checked || indeterminate ? [] : props.projects);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  const ConfirmationModalContent = (props: {
    granteeCount: number;
    amount: string;
    symbol: string;
  }) => (
    <div className="flex flex-col">
      <div className="text-gray-400 text-sm px-4 py-2 font-['Libre_Franklin']">
        You have selected multiple Grantees to allocate funds to.
      </div>
      <div className="flex text-center">
        <div className="w-2/5 border-r-2 border-gray-200 py-2">
          <h2 className="font-bold text-base text-gray-400 mb-2 font-['Libre_Franklin']">
            GRANTEES
          </h2>
          <p className="font-bold text-base text-black font-['Libre_Franklin']">
            {props.granteeCount}
          </p>
        </div>
        <div className="w-3/5 border-l-1 py-2">
          <h2 className="font-bold text-base text-gray-400 mb-2 font-['Libre_Franklin']">
            FUNDS TO BE ALLOCATED
          </h2>
          <p className="font-bold text-base text-black font-['Libre_Franklin']">
            {props.amount} {props.symbol}
          </p>
        </div>
      </div>
      <div className="text-gray-400 text-sm px-4 py-2 italic font-['Libre_Franklin']">
        Changes could be subject to additional gas fees.
      </div>
    </div>
  );

  const handleFundGrantees = async () => {
    setShowConfirmationModal(false);
    setOpenReadyForDistributionProgressModal(true);

    if (allo == null) {
      return;
    }

    if (roundId) {
      const result = await allo
        .batchDistributeFunds({
          payoutStrategy:
            alloVersion === "allo-v1"
              ? getAddress(props.round.payoutStrategy.id)
              : getAddress(props.round.id),
          allProjects: props.allProjects,
          projectIdsToBePaid: selectedProjects.map((p) => p.projectId),
        })
        .on("transaction", (result) => {
          if (result.type === "error") {
            setFinalizingDistributionStatus(ProgressStatus.IS_ERROR);
          }
        })
        .on("transactionStatus", (result) => {
          if (result.type === "error") {
            setFinalizingDistributionStatus(ProgressStatus.IS_ERROR);
          } else {
            setFinalizingDistributionStatus(ProgressStatus.IS_SUCCESS);
            setIndexingStatus(ProgressStatus.IN_PROGRESS);
          }
        })
        .on("indexingStatus", (result) => {
          if (result.type === "error") {
            setIndexingStatus(ProgressStatus.IS_ERROR);
          } else {
            setIndexingStatus(ProgressStatus.IS_SUCCESS);
          }
        })
        .execute();

      if (result.type === "error") {
        console.error("Error while distributing funds", result.error);
        setTimeout(() => {
          setOpenReadyForDistributionProgressModal(false);
        }, errorModalDelayMs);
      } else {
        setTimeout(() => {
          setOpenReadyForDistributionProgressModal(false);
          navigate(0);
        }, modalDelayMs);
      }
    }
  };

  const handlePayOutFunds = async () => {
    const totalPayout: BigNumber = selectedProjects.reduce(
      (acc: BigNumber, cur) => acc.add(cur.matchAmountInToken),
      BigNumber.from(0)
    );

    if (totalPayout.gt(tokenBalance.data?.value || BigNumber.from(0))) {
      setShowInfoModal(true);
    } else {
      setShowConfirmationModal(true);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Grantees
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Select which grantees you wish to allocate funds to.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>
                    <th
                      scope="col"
                      className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Wallet Address
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Matching %
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Payout Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {props.projects.map((project: MatchingStatsData) => (
                    <tr
                      key={project.projectId}
                      className={
                        selectedProjects.includes(project)
                          ? "bg-gray-50"
                          : undefined
                      }
                    >
                      <td className="relative px-7 sm:w-12 sm:px-6">
                        {selectedProjects.includes(project) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          data-testid="project-checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={selectedProjects.includes(project)}
                          onChange={(e) => {
                            setSelectedProjects(
                              e.target.checked
                                ? [...selectedProjects, project]
                                : selectedProjects.filter(
                                    (p) =>
                                      p.projectPayoutAddress !==
                                      project.projectPayoutAddress
                                  )
                            );
                          }}
                        />
                      </td>
                      <td
                        className={classNames(
                          "whitespace-nowrap py-4 pr-3 text-sm font-medium",
                          selectedProjects.includes(project)
                            ? "text-indigo-600"
                            : "text-gray-900"
                        )}
                      >
                        {project.projectName}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.projectPayoutAddress}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.matchPoolPercentage * 100}%
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {formatCurrency(
                          project.matchAmountInToken,
                          props.token.decimal,
                          4
                        )}
                        {" " + props.token.name.toUpperCase()}
                        {Boolean(props.price) &&
                          " ($" +
                            formatCurrency(
                              project.matchAmountInToken
                                .mul(Math.trunc(props.price * 10000))
                                .div(10000),
                              props.token.decimal,
                              2
                            ) +
                            " USD) "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="flex flex-row-reverse mr-4 p-4">
          <button
            type="button"
            data-testid="pay-out-funds-button"
            className="block m-3 rounded-md bg-indigo-600 py-1.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={selectedProjects.length === 0}
            onClick={() => handlePayOutFunds()}
          >
            Payout funds
          </button>
        </div>
      </div>
      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={"Confirm"}
        confirmButtonAction={() => {
          handleFundGrantees();
        }}
        body={
          <ConfirmationModalContent
            granteeCount={selectedProjects.length}
            amount={formatCurrency(
              selectedProjects.reduce(
                (acc: BigNumber, cur) => acc.add(cur.matchAmountInToken),
                BigNumber.from(0)
              ),
              props.token.decimal
            )}
            symbol={props.token.name.toUpperCase()}
          />
        }
        isOpen={showConfirmationModal}
        setIsOpen={setShowConfirmationModal}
      />
      <InfoModal
        title="Warning!"
        body={
          <div className="text-gray-400 text-sm font-['Libre_Franklin']">
            You don’t have enough funds in the contract to pay out the selected
            grantees. Please either add more funds to the contract or select
            fewer grantees.
          </div>
        }
        isOpen={showInfoModal}
        cancelButtonAction={() => setShowInfoModal(false)}
        continueButtonAction={() => setShowInfoModal(false)}
        disableContinueButton={true}
        setIsOpen={setShowInfoModal}
      />
      <ProgressModal
        isOpen={openReadyForDistributionProgressModal}
        subheading={"Please hold while we distribute funds."}
        steps={distributionSteps}
      />
    </div>
  );
}

export function PaidProjectsTable(props: {
  projects: MatchingStatsData[];
  chainId: number;
  token: PayoutToken;
  price: number;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Grantees
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Transaction history of grantees you have paid out funds to.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="relative">
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Project
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Wallet Address
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Matching Percent %
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Payout Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {props.projects.map((project: MatchingStatsData) => (
                    <tr key={project.projectPayoutAddress}>
                      <td>{project.projectName}</td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.projectPayoutAddress}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.matchPoolPercentage * 100}%
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {ethers.utils.formatEther(
                          project.matchAmountInToken.toString()
                        )}
                        {" " + props.token.name.toUpperCase()}
                        {Boolean(props.price) &&
                          " ($" +
                            formatCurrency(
                              project.matchAmountInToken
                                .mul(Math.trunc(props.price * 10000))
                                .div(10000),
                              props.token.decimal,
                              2
                            ) +
                            " USD) "}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 ${
                            project.hash
                              ? "bg-green-100 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          Success
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <a
                          href={getTxBlockExplorerLink(
                            props.chainId,
                            project.hash ?? ""
                          )}
                          className="text-indigo-600 hover:text-indigo-900"
                          target={"_blank"}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
