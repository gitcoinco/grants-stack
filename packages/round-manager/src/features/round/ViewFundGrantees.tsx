/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tab } from "@headlessui/react";
import { ExclamationCircleIcon as NonFinalizedRoundIcon } from "@heroicons/react/outline";
import { classNames } from "common";
import { BigNumber, ethers } from "ethers";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import tw from "tailwind-styled-components";
import { useBalance } from "wagmi";
import { useGroupProjectsByPaymentStatus } from "../api/payoutStrategy/merklePayoutStrategy";
import { MatchingStatsData, Round } from "../api/types";
import { formatCurrency, PayoutToken, payoutTokens, PayoutTokenWithCoingeckoId, useTokenPrice } from "../api/utils";
import { useWallet } from "../common/Auth";
import { Spinner } from "../common/Spinner";
import ConfirmationModal from "../common/ConfirmationModal";

type GranteeFundInfo = {
  project: string;
  walletAddress: string;
  matchingPercent: string;
  payoutAmount: BigNumber;
  status?: string;
  hash?: string;
};

export default function ViewFundGrantees(props: {
  round: Round | undefined;
  chainId: number;
  roundId: string | undefined;
}) {
  const [isFundGranteesFetched] = useState(false);

  if (isFundGranteesFetched) {
    return <Spinner text="We're fetching your data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Fund Grantees</p>
      {props.round?.payoutStrategy?.isReadyForPayout ? (
        <FinalizedRoundContent tokenAddress={props.round?.token} />
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

function FinalizedRoundContent(props: { tokenAddress: string }) {
  const { id: roundId } = useParams();
  const { chain } = useWallet();
  const projects = useGroupProjectsByPaymentStatus(chain?.id, roundId || "");
  const [paidProjects, setPaidProjects] = useState<GranteeFundInfo[]>([]);
  const [unpaidProjects, setUnpaidProjects] = useState<MatchingStatsData[]>([]);

  const matchingFundPayoutToken: PayoutTokenWithCoingeckoId =
    payoutTokens.filter(
      (t) =>
        t.address.toLocaleLowerCase() == props.tokenAddress.toLocaleLowerCase()
    )[0];

  console.log("===> matchingFundPayoutToken");
  console.log(matchingFundPayoutToken);

  const mapMatchingStatsDataToGranteeFundInfo = (matchingStatsData: MatchingStatsData[]): GranteeFundInfo[] => {
    return matchingStatsData.map((matchingStatData) => ({
      project: matchingStatData.projectName ?? "",
      walletAddress: matchingStatData.projectPayoutAddress,
      matchingPercent: (matchingStatData.matchPoolPercentage * 100).toString(),
      payoutAmount: matchingStatData.matchAmountInToken,
    }));
  };

  useEffect(() => {

    setPaidProjects(
      mapMatchingStatsDataToGranteeFundInfo(projects['paid'])
    );
    setUnpaidProjects(
      projects['unpaid']
    );

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
          <Tab.Panels className="basis-5/6 ml-6">
            <Tab.Panel>
              <PayProjectsTable projects={unpaidProjects} token={matchingFundPayoutToken} />
            </Tab.Panel>
            <Tab.Panel>
              <PaidProjectsTable projects={paidProjects} chainId={chain?.id} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}


// TODO: Add types
export function PayProjectsTable(props: { projects: MatchingStatsData[], token: PayoutTokenWithCoingeckoId }) {
  // TODO: Add button check
  // TOOD: Connect wallet and payout contracts to pay grantees
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkbox = useRef<any>();
  const [checked, setChecked] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState<boolean>(false);
  const [selectedProjects, setSelectedProjects] = useState<MatchingStatsData[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

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

  const ConfirmationModalContent = (props: { granteeCount: number, amount: string, symbol: string }) => (
    <div className="flex flex-col">
      <div className="text-gray-400 text-sm px-4 py-2 font-['Libre_Franklin']">
        You have selected multiple Grantees to allocate funds to.
      </div>
      <div className="flex text-center">
        <div className="w-2/5 border-r-2 border-gray-200 py-2">
          <h2 className="font-bold text-base text-gray-400 mb-2 font-['Libre_Franklin']">GRANTEES</h2>
          <p className="font-bold text-base text-black font-['Libre_Franklin']">{props.granteeCount}</p>
        </div>
        <div className="w-3/5 border-l-1 py-2">
          <h2 className="font-bold text-base text-gray-400 mb-2 font-['Libre_Franklin']">FUNDS TO BE ALLOCATED</h2>
          <p className="font-bold text-base text-black font-['Libre_Franklin']">{props.amount} {props.symbol}</p>
        </div>
      </div>
      <div className="text-gray-400 text-sm px-4 py-2 italic font-['Libre_Franklin']">Changes could be subject to additional gas fees.</div>
    </div>
  )

  const handleFundGrantees = async () => {
    setShowConfirmationModal(false);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
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
                      key={project.projectPayoutAddress}
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
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={selectedProjects.includes(project)}
                          onChange={(e) => {
                            setSelectedProjects(
                              e.target.checked
                                ? [...selectedProjects, project]
                                : selectedProjects.filter(
                                  (p) =>
                                    p.projectPayoutAddress !== project.projectPayoutAddress
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
                        {project.matchPoolPercentage}%
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {formatCurrency(project.matchAmountInToken, props.token.decimals)} 
                        {" "+props.token.name.toUpperCase()}
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
            className="block m-3 rounded-md bg-indigo-600 py-1.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            disabled={selectedProjects.length === 0}
            onClick={() => setShowConfirmationModal(true)}
          >
            Pay out funds
          </button>
        </div>
      </div>
      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={"Confirm"}
        confirmButtonAction={() => {
          handleFundGrantees();
        }}
        body={<ConfirmationModalContent
          granteeCount={selectedProjects.length}
          amount={
            formatCurrency(
              selectedProjects.reduce(
                (acc: BigNumber, cur) => acc.add(cur.matchAmountInToken), BigNumber.from(0)),
              props.token.decimals
            )
          }
          symbol={props.token.name.toUpperCase()}
        />}
        isOpen={showConfirmationModal}
        setIsOpen={setShowConfirmationModal}
      />
    </div>
  );
}

// TODO: Add types
// todo: such a nice table should be in a separate and shared file
export function PaidProjectsTable(props: {
  projects: GranteeFundInfo[];
  chainId: number;
}) {
  let blockScanUrl: string;
  switch (props.chainId) {
    case 1:
      blockScanUrl = "https://etherscan.io/tx/";
      break;
    case 5:
      blockScanUrl = "https://goerli.etherscan.io/tx/";
      break;
    case 10:
      blockScanUrl = "https://optimistic.etherscan.io/tx/";
      break;
    case 250:
      blockScanUrl = "https://ftmscan.com/tx/";
      break;
    case 4002:
      blockScanUrl = "https://testnet.ftmscan.com/tx/";
      break;
    default:
      blockScanUrl = "https://etherscan.io/tx/";
  }

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
                      Matching Percent
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
                  {props.projects.map((project: GranteeFundInfo) => (
                    <tr key={project.walletAddress}>
                      <td>{project.project}</td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.walletAddress}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.matchingPercent}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.payoutAmount.toString()}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 ${project.status === "Success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-200 text-red-800"
                            }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <a
                          href={`${blockScanUrl}${project.hash}`}
                          className="text-indigo-600 hover:text-indigo-900"
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
