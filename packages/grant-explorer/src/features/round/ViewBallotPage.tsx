import { useBallot } from "../../context/BallotContext";
import {
  FinalBallotDonation,
  PayoutToken,
  ProgressStatus,
  Project,
  recipient,
} from "../api/types";
import { useRoundById } from "../../context/RoundContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../common/Navbar";
import DefaultLogoImage from "../../assets/default_logo.png";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronUpDownIcon,
  InformationCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { ArrowLeftCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button, Input } from "../common/styles";
import { classNames, getPayoutTokenOptions } from "../api/utils";
import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { BigNumber, ethers } from "ethers";
import ConfirmationModal from "../common/ConfirmationModal";
import InfoModal from "../common/InfoModal";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { modalDelayMs } from "../../constants";
import { useQFDonation } from "../../context/QFDonationContext";
import { datadogLogs } from "@datadog/browser-logs";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Footer from "../common/Footer";
import RoundEndedBanner from "../common/RoundEndedBanner";
import PassportBanner from "../common/PassportBanner";

export default function ViewBallot() {
  const { chainId, roundId } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);

  const payoutTokenOptions: PayoutToken[] = [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...getPayoutTokenOptions(chainId!),
  ];

  const [selectedPayoutToken, setSelectedPayoutToken] = useState<PayoutToken>(
    payoutTokenOptions[0]
  );
  const [shortlistSelect, setShortlistSelect] = useState(false);
  const [selected, setSelected] = useState<Project[]>([]);
  const [donations, setDonations] = useState<FinalBallotDonation[]>([]);

  const totalDonation = useMemo(() => {
    return donations.reduce((acc, donation) => {
      if (donation.amount == '') {
        donation.amount = '0';
      }

      const decimalPlaces =
        (donation.amount.match(/\.(\d+)/) || [])[1]?.length || 0;
      return Number((acc + parseFloat(donation.amount)).toFixed(decimalPlaces));
    }, 0);
  }, [donations]);

  const currentTime = new Date();
  const isAfterRoundEndDate = round && round.roundEndTime <= currentTime;

  const [fixedDonation, setFixedDonation] = useState<number>();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const [shortlist, finalBallot] = useBallot();

  const { openConnectModal } = useConnectModal();

  const { address } = useAccount();
  const { chain, chains } = useNetwork();

  const tokenDetail =
    selectedPayoutToken.address == ethers.constants.AddressZero
      ? { addressOrName: address }
      : { addressOrName: address, token: selectedPayoutToken.address };

  const selectedPayoutTokenBalance = useBalance(tokenDetail);

  const [wrongChain, setWrongChain] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [emptyInput, setEmptyInput] = useState(false);

  const shortlistNotEmpty = shortlist.length > 0;
  const finalBallotNotEmpty = finalBallot.length > 0;

  useEffect(() => {
    if (!shortlistSelect) {
      setSelected([]);
    }
  }, [shortlistSelect]);

  const navigate = useNavigate();

  const {
    submitDonations,
    tokenApprovalStatus,
    voteStatus,
    indexingStatus,
    txHash,
  } = useQFDonation();

  useEffect(() => {
    if (
      tokenApprovalStatus === ProgressStatus.IS_ERROR ||
      voteStatus === ProgressStatus.IS_ERROR
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, modalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        navigate(`/round/${chainId}/${roundId}`);
      }, 5000);
    }

    if (
      tokenApprovalStatus === ProgressStatus.IS_SUCCESS &&
      voteStatus === ProgressStatus.IS_SUCCESS &&
      txHash !== ""
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        navigate(`/round/${chainId}/${roundId}/${txHash}/thankyou`);
      }, modalDelayMs);
    }
  }, [
    navigate,
    tokenApprovalStatus,
    voteStatus,
    indexingStatus,
    chainId,
    roundId,
    txHash,
  ]);

  const progressSteps = [
    {
      name: "Approve",
      description: "Approve the contract to access your wallet",
      status: tokenApprovalStatus,
    },
    {
      name: "Submit",
      description: "Finalize your contribution",
      status: voteStatus,
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

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`}/>
      <PassportBanner chainId={chainId} roundId={roundId}/>
      {isAfterRoundEndDate && (
        <div>
          <RoundEndedBanner/>
        </div>
      )}
      <div className="lg:mx-20 h-screen px-4 py-7">
        <main>
          {Header(chainId, roundId)}
          <div className="flex flex-col md:flex-row gap-4">
            {shortlistNotEmpty && ShortlistProjects(shortlist)}
            {!shortlistNotEmpty && EmptyShortlist(chainId, roundId)}
            {finalBallotNotEmpty && FinalBallotProjects(finalBallot)}
            {!finalBallotNotEmpty && EmptyFinalBallot()}
          </div>
        </main>
        <Footer/>
      </div>
    </>
  );

  function SummaryContainer() {
    return (
      <>
        <div>
          <Summary/>
          <Button
            $variant="solid"
            data-testid="handle-confirmation"
            type="button"
            onClick={handleConfirmation}
            disabled={isAfterRoundEndDate}
            className="items-center shadow-sm text-sm rounded w-full"
          >
            Submit your donation!
          </Button>
          {emptyInput && (
            <p
              data-testid="emptyInput"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5"/>
              <span>
                You must enter donations for all final ballot projects
              </span>
            </p>
          )}
          {insufficientBalance && !wrongChain && (
            <p
              data-testid="insufficientBalance"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5"/>
              <span>You do not have enough funds for these donations</span>
            </p>
          )}
          {wrongChain && (
            <p
              data-testid="wrongChain"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5"/>
              <span>
                You are on the wrong chain ({chain?.name}) for this round.
                <br/>
                Please switch to{" "}
                {chains.filter((c) => c?.id == Number(chainId))[0]?.name}{" "}
                network.
              </span>
            </p>
          )}
        </div>
        <PayoutModals/>
      </>
    );
  }

  function Header(chainId?: string, roundId?: string) {
    return (
      <div>
        <div className="flex flex-row items-center gap-3 text-sm">
          <ChevronLeftIcon className="h-5 w-5 mt-6 mb-6 cursor-pointer"/>
          <Link to={`/round/${chainId}/${roundId}`}>
            <span className="font-normal">Back</span>
          </Link>
        </div>

        <h1 className="text-3xl mt-6 font-thin border-b-2 pb-2">
          Donation Builder
        </h1>

        <p className="my-4">
          Select your favorite projects from the Shortlist to build your Final
          Donation.
        </p>
      </div>
    );
  }

  function ShortlistProjects(shortlist: Project[]) {
    const [
      ,
      ,
      ,
      handleRemoveProjectsFromShortlist,
      handleAddProjectsToFinalBallotAndRemoveFromShortlist,
    ] = useBallot();

    return (
      <div className="lg:w-1/2 h-full">
        <div className="block px-[16px] py-4 rounded-lg shadow-lg bg-white border">
          <div className="flex justify-between border-b-2 pb-2">
            <h2 className="text-xl">Shortlist</h2>
            {shortlistSelect ? (
              <SelectActive onClick={() => setShortlistSelect(false)}/>
            ) : (
              <SelectInactive onClick={() => setShortlistSelect(true)}/>
            )}
          </div>

          <div className="my-4">
            {shortlist.map((project: Project, key: number) => {
              return (
                <ShortlistProject
                  isSelected={
                    isProjectAlreadySelected(project.projectRegistryId) > -1
                  }
                  project={project}
                  roundRoutePath={`/round/${chainId}/${roundId}`}
                  key={key}
                />
              );
            })}
          </div>
        </div>

        <div className="flex mt-4 gap-4">
          <Button
            type="button"
            $variant="outline"
            data-testid="bulk-remove-from-shortlist"
            onClick={() => {
              handleRemoveProjectsFromShortlist(shortlist);
            }}
            className="grow text-xs px-4 py-2 border shadow-sm border-grey-100"
          >
            Clear all ({shortlist.length}) projects from the shortlist
          </Button>

          <Button
            type="button"
            $variant="outline"
            data-testid="bulk-add-to-final-ballot"
            onClick={() => {
              handleAddProjectsToFinalBallotAndRemoveFromShortlist(shortlist);
            }}
            className="grow items-center px-4 py-2 border-none shadow-sm text-xs rounded text-violet-500 bg-violet-100"
          >
            Add all ({shortlist.length}) projects to Final Donation
          </Button>
        </div>
      </div>
    );
  }

  function ShortlistProject(
    props: React.ComponentProps<"div"> & {
      project: Project;
      roundRoutePath: string;
      isSelected: boolean;
    }
  ) {
    const { project, roundRoutePath } = props;
    const [, , , handleRemoveProjectsFromShortlist] = useBallot();

    return (
      <div
        data-testid="project"
        className="border-b-2 border-grey-100"
        onClick={() => toggleSelection(props.project)}
      >
        <div
          className={`mb-4 flex justify-between px-3 py-4 rounded-md
            ${props.isSelected ? "bg-violet-100" : ""}`}
        >
          <div className="flex">
            <div
              className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
              <img
                className="inline-block"
                src={
                  props.project.projectMetadata.logoImg
                    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                    : DefaultLogoImage
                }
                alt={"Project Logo"}
              />
              <div
                className="min-w-[64px] w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
                <Link to={`${roundRoutePath}/${project.grantApplicationId}`}>
                  <EyeIcon
                    className="fill-gray-200 w-6 h-6 cursor-pointer"
                    data-testid={`${project.projectRegistryId}-project-link`}
                  />
                </Link>
              </div>
            </div>

            <div className="px-4 mt-1">
              <p className="font-semibold mb-2 text-ellipsis line-clamp-1">
                {props.project.projectMetadata.title}
              </p>
              <p className="text-sm text-ellipsis line-clamp-3">
                {props.project.projectMetadata.description.substring(0, 130)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <TrashIcon
              data-testid="remove-from-shortlist"
              onClick={() => handleRemoveProjectsFromShortlist([props.project])}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  function EmptyShortlist(chainId?: string, roundId?: string) {
    return (
      <>
        <div className="lg:w-1/2 h-full px-[16px] py-4 rounded-lg shadow-lg bg-white border">
          <h2 className="text-xl border-b-2 pb-2">Shortlist</h2>

          <div className="my-4">
            <p className="text-grey-500 font-light">
              Projects that you add to the shortlist will appear here.
            </p>
          </div>

          <div className="flex justify-center mt-11">
            <Link to={"/round/" + chainId + "/" + roundId}>
              <Button
                $variant="solid"
                type="button"
                className="inline-flex items-center shadow-sm text-sm rounded"
              >
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  function FinalBallotProjects(finalBallot: Project[]) {
    return (
      <div className="lg:w-1/2 h-full">
        <div className="block px-[16px] py-4 rounded-lg shadow-lg bg-white border">
          <div className="flex flex-col md:flex-row justify-between border-b-2 pb-2 gap-3">
            <div className="basis-[28%]">
              <h2 className="mt-2 text-xl">Final Donation</h2>
            </div>
            <div className="lg:flex justify-end lg:flex-row gap-2 basis-[72%] ">
              <div className="flex gap-4">
                <p className="mt-3 text-sm amount-text">Amount</p>
                <Input
                  aria-label={"Donation amount for all projects "}
                  id={"input-donationamount"}
                  min="0"
                  value={fixedDonation ?? ""}
                  type="number"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFixedDonation(Number(e.target.value));
                  }}
                  className="w-24"
                />
                <PayoutTokenDropdown payoutTokenOptions={payoutTokenOptions}/>
              </div>
              <Button
                type="button"
                $variant="outline"
                onClick={() => {
                  updateAllDonations(fixedDonation ?? 0);
                }}
                className="float-right md:float-none text-xs px-4 py-2 text-purple-600 border-0"
              >
                Apply to all
              </Button>
            </div>
          </div>
          <div className="my-4">
            {finalBallot.map((project: Project, key: number) => (
              <div key={key}>
                <FinalBallotProject
                  isSelected={
                    isProjectAlreadySelected(project.projectRegistryId) > -1
                  }
                  project={project}
                  index={key}
                  roundRoutePath={`/round/${chainId}/${roundId}`}
                />
              </div>
            ))}
          </div>
        </div>
        <SummaryContainer/>
      </div>
    );
  }

  function FinalBallotProject(
    props: React.ComponentProps<"div"> & {
      project: Project;
      isSelected: boolean;
      index: number;
      roundRoutePath: string;
    }
  ) {
    const { project, roundRoutePath } = props;
    const [, , , , , , handleRemoveProjectsFromFinalBallotAndAddToShortlist] =
      useBallot();

    const focusedElement = document?.activeElement?.id;
    const inputID = "input-" + props.index;

    return (
      <div
        data-testid="finalBallot-project"
        className="border-b-2 border-grey-100"
      >
        <div
          className={`mb-4 flex flex-col md:flex-row justify-between px-3 py-4 rounded-md
            ${props.isSelected ? "bg-violet-100" : ""}`}
        >
          <div className="flex">
            <div
              className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
              <img
                className="inline-block"
                src={
                  props.project.projectMetadata.logoImg
                    ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                    : DefaultLogoImage
                }
                alt={"Project Logo"}
              />
              <div
                className="min-w-[64px] w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
                <Link to={`${roundRoutePath}/${project.grantApplicationId}`}>
                  <EyeIcon
                    className="fill-gray-200 w-6 h-6 cursor-pointer"
                    data-testid={`${project.projectRegistryId}-project-link`}
                  />
                </Link>
              </div>
            </div>

            <div className="pl-4 mt-1">
              <Link
                to={`${roundRoutePath}/${project.grantApplicationId}`}
                data-testid={"final-ballot-project-link"}
              >
                <p className="font-semibold mb-2 text-ellipsis line-clamp-1">
                  {props.project.projectMetadata.title}
                </p>
              </Link>
              <p className="text-sm text-ellipsis line-clamp-3">
                {props.project.projectMetadata.description.substring(0, 130)}
              </p>
            </div>
          </div>

          <div className="mt-1 flex space-x-2 sm:space-x-4 h-16 pl-4 pt-3">
            <Input
              aria-label={
                "Donation amount for project " +
                props.project.projectMetadata.title
              }
              id={inputID}
              key={inputID}
              {...(focusedElement === inputID ? { autoFocus: true } : {})}
              min="0"
              value={
                donations.find(
                  (donation: FinalBallotDonation) =>
                    donation.projectRegistryId ===
                    props.project.projectRegistryId
                )?.amount
              }
              type="number"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateDonations(
                  props.project.projectRegistryId,
                  e.target.value,
                  props.project.recipient
                );
              }}
              className="w-24"
            />
            <p className="m-auto">{selectedPayoutToken.name}</p>
            <ArrowLeftCircleIcon
              data-testid="remove-from-finalBallot"
              onClick={() => {
                handleRemoveProjectsFromFinalBallotAndAddToShortlist([
                  props.project,
                ]);
                updateDonations(
                  props.project.projectRegistryId,
                  "",
                  props.project.recipient
                );
              }}
              className="w-6 h-6 m-auto cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  function EmptyFinalBallot() {
    return (
      <div className="w-1/2 h-full">
        <div className="block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400">
          <div className="flex flex-row justify-between border-b-2 pb-2 gap-3">
            <div className="basis-[28%]">
              <h2 className="mt-2 text-xl">Final Donation</h2>
            </div>
            <div className="lg:flex justify-end lg:flex-row gap-2 basis-[72%] ">
              <p className="mt-3 text-sm amount-text">Amount</p>
              <Input
                aria-label={"Donation amount for all projects "}
                id={"input-donationamount"}
                min="0"
                value={fixedDonation ?? ""}
                type="number"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFixedDonation(Number(e.target.value));
                }}
                className="w-24"
              />
              <PayoutTokenDropdown payoutTokenOptions={payoutTokenOptions}/>
              <Button
                type="button"
                $variant="outline"
                className="text-xs px-4 py-2 text-purple-600 border-0"
              >
                Apply to all
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-grey-500">
              Add the projects you want to fund here!
            </p>
          </div>
        </div>
        <SummaryContainer/>
      </div>
    );
  }

  function Summary() {
    return (
      <>
        <div className="my-5 block px-[16px] py-4 rounded-lg shadow-lg bg-white border border-violet-400 font-semibold">
          <h2 className="text-xl border-b-2 pb-2">Summary</h2>
          <div className="flex justify-between mt-4">
            <p>Your Contribution</p>
            <p>
              <span data-testid={"totalDonation"} className="mr-2">
                {totalDonation.toString()}
              </span>
              <span data-testid={"summaryPayoutToken"}>
                {selectedPayoutToken.name}
              </span>
            </p>
          </div>
        </div>
      </>
    );
  }

  function AdditionalGasFeesNote() {
    return (
      <p className="text-sm italic text-grey-400 mb-2">
        Changes could be subject to additional gas fees.
      </p>
    );
  }

  function FinalBallotConfirmCount() {
    return (
      <div
        className="flex justify-center"
        data-testid="final-ballot-project-count"
      >
        <CheckIcon
          className="bg-teal-400 text-grey-500 rounded-full h-6 w-6 p-1 mr-2"
          aria-hidden="true"
        />
        <p className="font-bold">
          <span className="mr-1">{totalDonation}</span>
          <span className="mr-1">{selectedPayoutToken.name}</span>
          <span>Contributed</span>
        </p>
      </div>
    );
  }

  function SelectInactive(props: { onClick: () => void }) {
    return (
      <Button
        type="button"
        $variant="solid"
        className="text-xs bg-grey-150 px-4 py-2 text-black"
        onClick={props.onClick}
      >
        Select
      </Button>
    );
  }

  function SelectActive(props: { onClick: () => void }) {
    const [, , , , handleAddProjectsToFinalBallotAndRemoveFromShortlist] =
      useBallot();
    return (
      <Button
        type="button"
        $variant="solid"
        className="text-xs px-4 py-2"
        onClick={props.onClick}
        data-testid="select"
      >
        {selected.length > 0 ? (
          <div
            data-testid="move-to-finalBallot"
            onClick={async () =>
              handleAddProjectsToFinalBallotAndRemoveFromShortlist(selected)
            }
          >
            Add selected ({selected.length}) to Final Donation
          </div>
        ) : (
          <>Select</>
        )}
      </Button>
    );
  }

  function toggleSelection(project: Project) {
    // toggle works when select is active
    if (!shortlistSelect) return;

    const newState = [...selected];

    const projectIndex = isProjectAlreadySelected(project.projectRegistryId);

    if (projectIndex < 0) {
      newState.push(project);
    } else {
      newState.splice(projectIndex, 1);
    }

    setSelected(newState);

    // disable select button if no projects are selected
    if (newState.length == 0) {
      setShortlistSelect(false);
    }
  }

  function isProjectAlreadySelected(projectId: string): number {
    return selected.findIndex(
      (project) => project.projectRegistryId == projectId
    );
  }

  function updateDonations(
    projectRegistryId: string,
    amount: string,
    projectAddress: recipient
  ) {
    const projectIndex = donations.findIndex(
      (donation) => donation.projectRegistryId === projectRegistryId
    );

    const newState = [...donations];

    if (projectIndex !== -1) {
      newState[projectIndex].amount = amount;
    } else {
      newState.push({
        projectRegistryId,
        amount,
        projectAddress,
      });
    }

    setDonations(newState);
  }

  function updateAllDonations(amount: number) {
    const newDonations = finalBallot.map((project) => {
      return {
        projectRegistryId: project.projectRegistryId,
        amount: amount.toString(),
        projectAddress: project.recipient,
      } as FinalBallotDonation;
    });

    setDonations(newDonations);
  }

  function PayoutTokenDropdown(props: { payoutTokenOptions: PayoutToken[] }) {
    return (
      <div className="mt-1 relative col-span-6 sm:col-span-3">
        <Listbox value={selectedPayoutToken} onChange={setSelectedPayoutToken}>
          {({ open }) => (
            <div>
              <div
                className="mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <PayoutTokenButton
                  token={props.payoutTokenOptions.find(
                    (t) => t.address === selectedPayoutToken?.address
                  )}
                />
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {props.payoutTokenOptions.map(
                      (token) =>
                        !token.default && (
                          <Listbox.Option
                            key={token.name}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "text-white bg-indigo-600"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9"
                              )
                            }
                            value={token}
                            data-testid="payout-token-option"
                          >
                            {({ selected, active }) => (
                              <>
                                <div className="flex items-center">
                                  {token.logo ? (
                                    <img
                                      src={token.logo}
                                      alt=""
                                      className="h-6 w-6 flex-shrink-0 rounded-full"
                                    />
                                  ) : null}
                                  <span
                                    className={classNames(
                                      selected
                                        ? "font-semibold"
                                        : "font-normal",
                                      "ml-3 block truncate"
                                    )}
                                  >
                                    {token.name}
                                  </span>
                                </div>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active ? "text-white" : "text-indigo-600",
                                      "absolute inset-y-0 right-0 flex items-center pr-4"
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        )
                    )}
                  </Listbox.Options>
                </Transition>
              </div>
            </div>
          )}
        </Listbox>
      </div>
    );
  }

  function PayoutTokenButton(props: { token?: PayoutToken }) {
    const { token } = props;
    return (
      <Listbox.Button
        className="relative w-[130px] cursor-default rounded-md border h-10 border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
        data-testid="payout-token-select"
      >
        <span className="flex items-center">
          {token?.logo ? (
            <img
              src={token?.logo}
              alt=""
              className="h-6 w-6 flex-shrink-0 rounded-full"
            />
          ) : null}
          {token?.default ? (
            <span className="ml-3 block truncate text-gray-500">
              {token?.name}
            </span>
          ) : (
            <span className="ml-3 block truncate">{token?.name}</span>
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
        </span>
      </Listbox.Button>
    );
  }

  function handleConfirmation() {

    // check to ensure user is on right network
    if (Number(chainId) != chain?.id) {
      setWrongChain(true);
      return;
    } else {
      setWrongChain(false);
    }

    // check to ensure all projects have donation amount
    const emptyDonations = donations.filter(
      (donation) => !donation.amount || Number(donation.amount) === 0
    );

    if (donations.length === 0 || emptyDonations.length > 0) {
      setEmptyInput(true);
      return;
    } else {
      setEmptyInput(false);
    }

    // check if wallet is connected
    if (!address) {
      openConnectModal && openConnectModal();
      return;
    }

    // check if signer has enough token balance
    const accountBalance = selectedPayoutTokenBalance.data?.value;
    const tokenBalance = ethers.utils.parseUnits(
      totalDonation.toString(),
      selectedPayoutToken.decimal
    );

    if (!accountBalance || BigNumber.from(tokenBalance).gt(accountBalance)) {
      setInsufficientBalance(true);
      return;
    } else {
      setInsufficientBalance(false);
    }

    setOpenConfirmationModal(true);
  }

  function PayoutModals() {
    return (
      <>
        <ConfirmationModal
          title={"Confirm Decision"}
          confirmButtonText={"Confirm"}
          confirmButtonAction={() => {
            setOpenInfoModal(true);
            setOpenConfirmationModal(false);
          }}
          body={<ConfirmationModalBody/>}
          isOpen={openConfirmationModal}
          setIsOpen={setOpenConfirmationModal}
        />
        <InfoModal
          title={"Heads up!"}
          body={<InfoModalBody/>}
          isOpen={openInfoModal}
          setIsOpen={setOpenInfoModal}
          continueButtonAction={handleSubmitDonation}
        />
        <ProgressModal
          isOpen={openProgressModal}
          subheading={"Please hold while we submit your donation."}
          steps={progressSteps}
        />
        <ErrorModal
          isOpen={openErrorModal}
          setIsOpen={setOpenErrorModal}
          tryAgainFn={handleSubmitDonation}
        />
      </>
    );
  }

  function InfoModalBody() {
    return (
      <div className="text-sm text-grey-400 gap-16">
        <p className="text-sm">
          Submitting your donation will require signing two transactions
          <br/>
          if you are using an ERC20 token:
        </p>
        <ul className="list-disc list-inside pl-3 pt-3">
          <li>Approving the contract to access your wallet</li>
          <li>Approving the transaction</li>
        </ul>
      </div>
    );
  }

  function ConfirmationModalBody() {
    const projectsCount = finalBallot.length;
    return (
      <>
        <p className="text-sm text-grey-400">
          {projectsCount} project{projectsCount > 1 && "s"} on your Final
          Donation.
        </p>
        <div className="my-8">
          <FinalBallotConfirmCount/>
        </div>
        <AdditionalGasFeesNote/>
      </>
    );
  }

  async function handleSubmitDonation() {
    try {
      if (!round || !roundId) {
        throw new Error("round is null");
      }

      setTimeout(() => {
        setOpenProgressModal(true);
        setOpenInfoModal(false);
      }, modalDelayMs);

      await submitDonations({
        roundId: roundId,
        donations: donations,
        donationToken: selectedPayoutToken,
        totalDonation: totalDonation,
        votingStrategy: round.votingStrategy,
      });
    } catch (error) {
      datadogLogs.logger.error(
        `error: handleSubmitDonation - ${error}, id: ${roundId}`
      );
      console.error("handleSubmitDonation - roundId", roundId, error);
    }
  }
}
