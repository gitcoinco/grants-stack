import { datadogLogs } from "@datadog/browser-logs";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Button, Input } from "common/src/styles";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { modalDelayMs } from "../../../constants";
import { useCart } from "../../../context/CartContext";
import { useQFDonation } from "../../../context/QFDonationContext";
import { useRoundById } from "../../../context/RoundContext";
import {
  fetchPassport,
  PassportResponse,
  PassportState,
} from "../../api/passport";
import { ChainId, useTokenPrice } from "common";
import {
  CartDonation,
  CartProject,
  DonationInput,
  PayoutToken,
  ProgressStatus,
  recipient,
} from "../../api/types";
import {
  CHAINS,
  GroupedCartProjectsByRoundId,
  getPayoutTokenOptions,
  groupProjectsInCart,
} from "../../api/utils";
import ConfirmationModal from "../../common/ConfirmationModal";
import ErrorModal from "../../common/ErrorModal";
import Footer from "common/src/components/Footer";
import InfoModal from "../../common/InfoModal";
import Navbar from "../../common/Navbar";
import ProgressModal from "../../common/ProgressModal";
import { Logger } from "ethers/lib.esm/utils";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";
import { ConfirmationModalBody } from "./ConfirmationModalBody";
import { EmptyCart } from "./EmptyCart";
import { Header } from "./Header";
import { ApplyTooltip } from "./ApplyTooltip";
import { RoundInCart } from "./RoundInCart";
import { PayoutTokenDropdown } from "./PayoutTokenDropdown";
import { Summary } from "./Summary";
import { InfoModalBody } from "./InfoModalBody";

export default function ViewCart() {
  const { chainId, roundId } = useParams();
  const [cart, , handleRemoveProjectsFromCart] = useCart();
  const groupedCartProjects = groupProjectsInCart(cart);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const round = useRoundById(chainId!, roundId!).round;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

  const payoutTokenOptions: PayoutToken[] = [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...getPayoutTokenOptions(Number(chainId)),
  ];

  const [selectedPayoutToken, setSelectedPayoutToken] = useState<PayoutToken>(
    payoutTokenOptions[0]
  );
  const [donations, setDonations] = useState<DonationInput[]>([]);

  const totalDonation = useMemo(() => {
    return donations.reduce((acc, donation) => {
      return acc.add(
        ethers.utils.parseUnits(
          donation.amount === "" ? "0" : donation.amount,
          selectedPayoutToken.decimal
        )
      );
    }, BigNumber.from(0));
  }, [donations, selectedPayoutToken.decimal]);

  const [fixedDonation, setFixedDonation] = useState<string>("");
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  const [transactionReplaced, setTransactionReplaced] = useState(false);

  const { openConnectModal } = useConnectModal();
  const { chain, chains } = useNetwork();
  const { address, isConnected } = useAccount();

  const tokenDetail =
    selectedPayoutToken.address == ethers.constants.AddressZero
      ? { address: address }
      : { address: address, token: selectedPayoutToken.address };

  // @ts-expect-error Temp until viem
  const selectedPayoutTokenBalance = useBalance(tokenDetail);

  const [wrongChain, setWrongChain] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [emptyInput, setEmptyInput] = useState(false);

  /* Donate without matching warning modal */
  const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

  const navigate = useNavigate();

  const { data, error, loading } = useTokenPrice(
    selectedPayoutToken.redstoneTokenId
  );

  const payoutTokenPrice = !loading && !error ? Number(data) : undefined;

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
        if (transactionReplaced) {
          setErrorModalSubHeading("Transaction cancelled. Please try again.");
        }
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
    transactionReplaced,
  ]);

  const [, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  useEffect(() => {
    setPassportState(PassportState.LOADING);

    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;
    const PASSPORT_THRESHOLD = 0;

    if (isConnected && address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const json = await res.json();

          if (json.status == "PROCESSING") {
            console.log("processing, calling again in 3000 ms");
            setTimeout(async () => {
              await callFetchPassport();
            }, 3000);
            return;
          } else if (json.status == "ERROR") {
            // due to error at passport end
            setPassportState(PassportState.ERROR);
            return;
          }

          setPassport(json);
          setPassportState(
            json.score >= PASSPORT_THRESHOLD
              ? PassportState.MATCH_ELIGIBLE
              : PassportState.MATCH_INELIGIBLE
          );
        } else {
          setError(res);
          switch (res.status) {
            case 400: // unregistered/nonexistent passport address
              setPassportState(PassportState.INVALID_PASSPORT);
              break;
            case 401: // invalid API key
              setPassportState(PassportState.ERROR);
              console.error("invalid API key", res.json());
              break;
            default:
              setPassportState(PassportState.ERROR);
              console.error("Error fetching passport", res);
          }
        }
      };

      callFetchPassport();
    } else {
      setPassportState(PassportState.NOT_CONNECTED);
    }
  }, [address, isConnected]);

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

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: round?.roundMetadata?.name,
      path: `/round/${chainId}/${roundId}`,
    },
    {
      name: "Cart",
      path: `/round/${chainId}/${roundId}/cart`,
    },
  ] as BreadcrumbItem[];

  return (
    <>
      <Navbar roundUrlPath={`/round/${chainId}/${roundId}`} />
      {}
      <div className="relative top-16 lg:mx-20 h-screen px-4 py-7">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <Header />
          <div className="flex flex-col md:flex-row gap-5">
            {cart.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="flex flex-col gap-5">
                {Object.keys(groupedCartProjects).map((chainId) => (
                  <div key={Number(chainId)}>
                    {CartWithProjects(
                      groupedCartProjects[Number(chainId)],
                      chainId
                    )}
                  </div>
                ))}
              </div>
            )}
            <SummaryContainer />
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );

  function SummaryContainer() {
    const minDonationThresholdAmount =
      round?.roundMetadata?.quadraticFundingConfig?.minDonationThresholdAmount;

    return (
      <div className="order-first md:order-last">
        <div>
          <Summary
            payoutTokenPrice={payoutTokenPrice ?? 0}
            selectedPayoutToken={selectedPayoutToken}
            totalDonation={totalDonation}
          />
          <Button
            $variant="solid"
            data-testid="handle-confirmation"
            type="button"
            onClick={() => {
              /* Check if user hasn't connected passport yet, display the warning modal */
              if (
                passportState === PassportState.ERROR ||
                passportState === PassportState.NOT_CONNECTED ||
                passportState === PassportState.INVALID_PASSPORT
              ) {
                setDonateWarningModalOpen(true);
                return;
              }

              /* If passport is fine, proceed straight to confirmation */
              handleConfirmation();
            }}
            className="items-center shadow-sm text-sm rounded w-full"
          >
            Submit your donation!
          </Button>
          {minDonationThresholdAmount && (
            <p className="flex justify-center my-4 text-sm italic">
              Your donation to each project must be valued at{" "}
              {minDonationThresholdAmount} USD or more to be eligible for
              matching.
            </p>
          )}
          {emptyInput && (
            <p
              data-testid="emptyInput"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
              <span>You must enter donations for all the projects</span>
            </p>
          )}
          {insufficientBalance && !wrongChain && (
            <p
              data-testid="insufficientBalance"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
              <span>You do not have enough funds for these donations</span>
            </p>
          )}
          {wrongChain && (
            <p
              data-testid="wrongChain"
              className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
            >
              <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
              <span>
                You are on the wrong chain ({chain?.name}) for this round.
                Please switch to{" "}
                {chains.filter((c) => c?.id == Number(chainId))[0]?.name}{" "}
                network.
              </span>
            </p>
          )}
        </div>
        <PayoutModals />
      </div>
    );
  }

  function CartWithProjects(
    cart: GroupedCartProjectsByRoundId,
    chainId: string
  ) {
    const chain = CHAINS[Number(chainId) as ChainId];
    const cartByRound = Object.values(cart);
    return (
      <div className="grow block px-[16px] py-4 rounded-lg shadow-lg bg-white border">
        <div className="flex flex-col md:flex-row justify-between border-b-2 pb-2 gap-3">
          <div className="flex flex-row basis-[28%] gap-2">
            <img
              className="mt-2 inline-block h-9 w-9"
              src={chain.logo}
              alt={"Chain Logo"}
            />
            <h2 className="mt-3 text-xl font-semibold">{chain.name}</h2>
            <h2 className="mt-3 text-xl font-semibold">
              ({cartByRound.length})
            </h2>
          </div>
          <div className="flex justify-end flex-row gap-2 basis-[72%]">
            <div className="flex gap-4">
              <p className="mt-4 md:mt-3 text-xs md:text-sm amount-text">
                Amount
              </p>
              <Input
                aria-label={"Donation amount for all projects "}
                id={"input-donationamount"}
                min="0"
                type="number"
                value={fixedDonation ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFixedDonation(e.target.value);
                }}
                className="w-16 md:w-24"
              />
              <PayoutTokenDropdown
                selectedPayoutToken={selectedPayoutToken}
                setSelectedPayoutToken={setSelectedPayoutToken}
                payoutTokenOptions={payoutTokenOptions}
              />
            </div>
            <div className="flex flex-row">
              <Button
                type="button"
                $variant="outline"
                onClick={() => {
                  updateAllDonations(fixedDonation);
                }}
                className="float-right md:float-none text-xs px-1 py-2 text-purple-600 border-0"
              >
                Apply to all
              </Button>
              <ApplyTooltip />
            </div>
          </div>
        </div>
        {cartByRound.map((roundcart: CartProject[], key: number) => (
          <RoundInCart
            key={key}
            roundcart={roundcart}
            donations={donations}
            handleRemoveProjectsFromCart={handleRemoveProjectsFromCart}
            selectedPayoutToken={selectedPayoutToken}
            payoutTokenPrice={payoutTokenPrice ?? 0}
            updateDonations={updateDonations}
          />
        ))}
      </div>
    );
  }

  function updateDonations(
    projectRegistryId: string,
    amount: string,
    projectAddress: recipient,
    applicationIndex: number,
    roundId: string
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
        applicationIndex,
        roundId,
      });
    }

    setDonations(newState);
  }

  function updateAllDonations(amount: string) {
    const newDonations = cart.map((project) => {
      return {
        projectRegistryId: project.projectRegistryId,
        amount,
        projectAddress: project.recipient,
        applicationIndex: project.applicationIndex,
        roundId: project.roundId,
      } as DonationInput;
    });

    setDonations(newDonations);
  }

  function handleConfirmation() {
    if (Number(chainId) != chain?.id) {
      // check to ensure user is on right network
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

    if (!accountBalance || totalDonation.gt(accountBalance)) {
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
          body={
            <ConfirmationModalBody
              projectsCount={cart.length}
              selectedPayoutToken={selectedPayoutToken}
              totalDonation={totalDonation}
            />
          }
          isOpen={openConfirmationModal}
          setIsOpen={setOpenConfirmationModal}
        />
        <InfoModal
          title={"Heads up!"}
          body={<InfoModalBody />}
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
          subheading={errorModalSubHeading}
        />
        {/*Passport not connected warning modal*/}
        <ErrorModal
          isOpen={donateWarningModalOpen}
          setIsOpen={setDonateWarningModalOpen}
          doneFn={() => {
            setDonateWarningModalOpen(false);
            handleConfirmation();
          }}
          tryAgainText={"Go to Passport"}
          doneText={"Donate without matching"}
          tryAgainFn={() => {
            navigate(`/round/${chainId}/${roundId}/passport/connect`);
          }}
          heading={`Don’t miss out on getting your donations matched!`}
          subheading={
            <>
              <p className={"text-sm text-grey-400 mb-2"}>
                Verify your identity with Gitcoin Passport to amplify your
                donations.
              </p>
              <p className={"text-sm text-grey-400"}>
                Note that donations made without Gitcoin Passport verification
                will not be matched.
              </p>
            </>
          }
          closeOnBackgroundClick={true}
        />
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

      const bigNumberDonation = donations.map((donation) => {
        return {
          ...donation,
          amount: ethers.utils.parseUnits(
            donation.amount,
            selectedPayoutToken.decimal
          ),
        } as CartDonation;
      });

      await submitDonations({
        donations: bigNumberDonation,
        donationToken: selectedPayoutToken,
        totalDonation: totalDonation,
        roundEndTime: round.roundEndTime.getTime(),
      });
    } catch (error) {
      if (error === Logger.errors.TRANSACTION_REPLACED) {
        setTransactionReplaced(true);
      } else {
        datadogLogs.logger.error(
          `error: handleSubmitDonation - ${error}, id: ${roundId}`
        );
        console.error("handleSubmitDonation - roundId", roundId, error);
      }
    }
  }
}
