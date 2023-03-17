import { Spinner } from "../common/Spinner";
import { ExclamationCircleIcon as NonFinalizedRoundIcon } from "@heroicons/react/outline";
import { Tab } from "@headlessui/react";
import tw from "tailwind-styled-components";
import { useLayoutEffect, useRef, useState } from "react";
import { classNames } from "common";
import { useRoundMatchData } from "../api/api";
import { useParams } from "react-router-dom";
import { useWallet } from "../common/Auth";

// TODO: modify prop for expected data
export default function ViewFundGrantees(props: { finalized: boolean }) {
  const [isFundGranteesFetched, setIsFundGranteesFetched] = useState(false);
  if (isFundGranteesFetched) {
    return <Spinner text="We're fetching your data." />;
  }

  return (
    <div className="flex flex-center flex-col mx-auto mt-3">
      <p className="text-xl">Fund Grantees</p>
      {!props.finalized ? (
        <FinalizedRoundContent />
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

function FinalizedRoundContent() {
  const { id: roundId } = useParams();
  const { chain } = useWallet();
  const {
    data: roundMatchData,
    error,
    loading,
  } = useRoundMatchData(chain.id.toString(), roundId as string);

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
                        {0}
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
                        {0}
                      </TabApplicationCounter>
                    </div>
                  )}
                </Tab>
              </div>
            </Tab.List>
          </div>
          <Tab.Panels className="basis-5/6 ml-6">
            <Tab.Panel>
              <PayProjectsTable projects={exProjects} />
            </Tab.Panel>
            <Tab.Panel>
              <PaidProjectsTable paidProjects={exPaidProjects} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

// Example data
const exProjects = [
  {
    project: "Example Project",
    walletAddress: "0x8e3d6c1c7a352083b86d2fcb0184c8e89af51e28",
    matchingPercent: "10%",
    payoutAmount: "99",
  },
  {
    project: "Example Project2",
    walletAddress: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
    matchingPercent: "90%",
    payoutAmount: "1000000",
  },
];

// TODO: Add types
export function PayProjectsTable(props: { projects: any[] }) {
  // TODO: Add button check
  // TOOD: Connect wallet and payout contracts to pay grantees
  const checkbox = useRef<any>();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);

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
                      Matching Percent
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
                  {props.projects.map((project) => (
                    <tr
                      key={project.walletAddress}
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
                                      p.walletAddress !== project.walletAddress
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
                        {project.project}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.walletAddress}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.matchingPercent}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.payoutAmount}
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
            className="block m-3 rounded-md bg-indigo-600 py-1.5 px-3 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Pay out funds
          </button>
        </div>
      </div>
    </div>
  );
}

// Example data
const exPaidProjects = [
  {
    project: "Paid Example Project",
    walletAddress: "0x8e3d6c1c7a352083b86d2fcb0184c8e89af51e28",
    matchingPercent: "10%",
    payoutAmount: "99",
    status: "Success",
    txn: "0x8e3d6c1c7a352083b86d2fcb0184c8e89af51e28",
  },
  {
    project: "Paid Example Project2",
    walletAddress: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
    matchingPercent: "90%",
    payoutAmount: "1000000",
    status: "Fail",
    txn: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
  },
];

// TODO: Add types
export function PaidProjectsTable(props: { paidProjects: any }) {
  // TODO: Fix etherscan link to use the correct network
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
                  {props.paidProjects.map((project: any) => (
                    <tr key={project.walletAddress}>
                      <td>{project.project}</td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.walletAddress}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.matchingPercent}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        {project.payoutAmount}
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-medium px-2.5 py-0.5 ${
                            project.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-sm font-medium text-gray-900">
                        <a
                          href={`https://etherscan.io/tx/${project.txn}`}
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
