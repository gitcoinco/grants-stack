import { datadogLogs } from "@datadog/browser-logs";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Button, Input } from "common/src/styles";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { modalDelayMs } from "../../../constants";
import { useQFDonation } from "../../../context/QFDonationContext";
import { useRoundById } from "../../../context/RoundContext";
import {
  fetchPassport,
  PassportResponse,
  PassportState,
} from "../../api/passport";
import { ChainId, useTokenPrice } from "common";
import { CartProject, PayoutToken, ProgressStatus } from "../../api/types";
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
import { useCartStorage } from "../../../store";
import { CartWithProjects } from "./CartWithProjects";

export default function ViewCart() {
  const { projects, remove, updateDonationsForChain } = useCartStorage();
  const groupedCartProjects = groupProjectsInCart(projects);
  console.log(projects);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorModalSubHeading, setErrorModalSubHeading] = useState<
    string | undefined
  >();
  /* Donate without matching warning modal */
  const [donateWarningModalOpen, setDonateWarningModalOpen] = useState(false);

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
        // if (transactionReplaced) {
        //   setErrorModalSubHeading("Transaction cancelled. Please try again.");
        // }
        setOpenErrorModal(true);
      }, modalDelayMs);
    }

    if (indexingStatus === ProgressStatus.IS_ERROR) {
      setTimeout(() => {
        navigate(`/`);
      }, 5000);
    }

    if (
      tokenApprovalStatus === ProgressStatus.IS_SUCCESS &&
      voteStatus === ProgressStatus.IS_SUCCESS &&
      txHash !== ""
    ) {
      setTimeout(() => {
        setOpenProgressModal(false);
        navigate(`/thankyou`);
      }, modalDelayMs);
    }
  }, [navigate, tokenApprovalStatus, voteStatus, indexingStatus, txHash]);

  // const [, setPassport] = useState<PassportResponse | undefined>();
  // const [, setError] = useState<Response | undefined>();
  //
  // const [passportState, setPassportState] = useState<PassportState>(
  //   PassportState.LOADING
  // );
  //
  // useEffect(() => {
  //   setPassportState(PassportState.LOADING);
  //
  //   const PASSPORT_COMMUNITY_ID =
  //     process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;
  //   const PASSPORT_THRESHOLD = 0;
  //
  //   if (isConnected && address && PASSPORT_COMMUNITY_ID) {
  //     const callFetchPassport = async () => {
  //       const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
  //       if (res.ok) {
  //         const json = await res.json();
  //
  //         if (json.status == "PROCESSING") {
  //           console.log("processing, calling again in 3000 ms");
  //           setTimeout(async () => {
  //             await callFetchPassport();
  //           }, 3000);
  //           return;
  //         } else if (json.status == "ERROR") {
  //           // due to error at passport end
  //           setPassportState(PassportState.ERROR);
  //           return;
  //         }
  //
  //         setPassport(json);
  //         setPassportState(
  //           json.score >= PASSPORT_THRESHOLD
  //             ? PassportState.MATCH_ELIGIBLE
  //             : PassportState.MATCH_INELIGIBLE
  //         );
  //       } else {
  //         setError(res);
  //         switch (res.status) {
  //           case 400: // unregistered/nonexistent passport address
  //             setPassportState(PassportState.INVALID_PASSPORT);
  //             break;
  //           case 401: // invalid API key
  //             setPassportState(PassportState.ERROR);
  //             console.error("invalid API key", res.json());
  //             break;
  //           default:
  //             setPassportState(PassportState.ERROR);
  //             console.error("Error fetching passport", res);
  //         }
  //       }
  //     };
  //
  //     callFetchPassport();
  //   } else {
  //     setPassportState(PassportState.NOT_CONNECTED);
  //   }
  // }, [address, isConnected]);

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
      name: "Cart",
      path: `/cart`,
    },
  ] as BreadcrumbItem[];

  console.log(projects.length);
  console.log(Object.keys(groupedCartProjects));
  return (
    <>
      <Navbar roundUrlPath={"/"} />
      <div className="relative top-16 lg:mx-20 h-screen px-4 py-7">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <Header />
          <div className="flex flex-col md:flex-row gap-5">
            {projects.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="flex flex-col gap-5">
                {Object.keys(groupedCartProjects).map((chainId) => (
                  <div key={Number(chainId)}>
                    <CartWithProjects
                      cart={groupedCartProjects[Number(chainId)]}
                      chainId={Number(chainId) as ChainId}
                    />
                  </div>
                ))}
              </div>
            )}
            {/*<SummaryContainer />*/}
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );

  // function SummaryContainer() {
  //   // const totalDonation = useMemo(() => {
  //   //   return projects.reduce((acc, donation) => {
  //   //     return acc.add(
  //   //       ethers.utils.parseUnits(donation.amount, selectedPayoutToken.decimal)
  //   //     );
  //   //   }, BigNumber.from(0));
  //   // }, [projects, selectedPayoutToken.decimal]);
  //
  //   return (
  //     <div className="order-first md:order-last">
  //       <div>
  //         <Summary
  //           payoutTokenPrice={payoutTokenPrice ?? 0}
  //           selectedPayoutToken={selectedPayoutToken}
  //           totalDonation={totalDonation}
  //         />
  //         <Button
  //           $variant="solid"
  //           data-testid="handle-confirmation"
  //           type="button"
  //           onClick={() => {
  //             /* Check if user hasn't connected passport yet, display the warning modal */
  //             if (
  //               passportState === PassportState.ERROR ||
  //               passportState === PassportState.NOT_CONNECTED ||
  //               passportState === PassportState.INVALID_PASSPORT
  //             ) {
  //               setDonateWarningModalOpen(true);
  //               return;
  //             }
  //
  //             /* If passport is fine, proceed straight to confirmation */
  //             handleConfirmation();
  //           }}
  //           className="items-center shadow-sm text-sm rounded w-full"
  //         >
  //           Submit your donation!
  //         </Button>
  //         {minDonationThresholdAmount && (
  //           <p className="flex justify-center my-4 text-sm italic">
  //             Your donation to each project must be valued at{" "}
  //             {minDonationThresholdAmount} USD or more to be eligible for
  //             matching.
  //           </p>
  //         )}
  //         {emptyInput && (
  //           <p
  //             data-testid="emptyInput"
  //             className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
  //           >
  //             <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
  //             <span>You must enter donations for all the projects</span>
  //           </p>
  //         )}
  //         {insufficientBalance && (
  //           <p
  //             data-testid="insufficientBalance"
  //             className="rounded-md bg-red-50 py-2 text-pink-500 flex justify-center my-4 text-sm"
  //           >
  //             <InformationCircleIcon className="w-4 h-4 mr-1 mt-0.5" />
  //             <span>You do not have enough funds for these donations</span>
  //           </p>
  //         )}
  //       </div>
  //       <PayoutModals />
  //     </div>
  //   );
  // }

  // function handleConfirmation() {
  //   // check to ensure all projects have donation amount
  //   const emptyDonations = projects.filter(
  //     (project) => !project.amount || Number(project.amount) === 0
  //   );
  //
  //   if (emptyDonations.length > 0) {
  // {
  //   /*    setEmptyInput(true);*/
  // }
  // {
  //   /*    return;*/
  // }
  // {
  //   /*  } else {*/
  // }
  // {
  //   /*    setEmptyInput(false);*/
  // }
  // {
  //   /*  }*/
  // }

  //   // check if wallet is connected
  //   if (!address) {
  //     openConnectModal && openConnectModal();
  //     return;
  //   }
  //
  //   // check if signer has enough token balance
  //   const accountBalance = selectedPayoutTokenBalance.data?.value;
  //
  //   if (!accountBalance || totalDonation.gt(accountBalance)) {
  //     setInsufficientBalance(true);
  //     return;
  //   } else {
  //     setInsufficientBalance(false);
  //   }
  //
  //   setOpenConfirmationModal(true);
  // }

  // function PayoutModals() {
  //   return (
  //     <>
  //       <ConfirmationModal
  //         title={"Confirm Decision"}
  //         confirmButtonText={"Confirm"}
  //         confirmButtonAction={() => {
  //           setOpenInfoModal(true);
  //           setOpenConfirmationModal(false);
  //         }}
  //         body={
  //           <ConfirmationModalBody
  //             projectsCount={projects.length}
  //             selectedPayoutToken={selectedPayoutToken}
  //             totalDonation={totalDonation}
  //           />
  //         }
  //         isOpen={openConfirmationModal}
  //         setIsOpen={setOpenConfirmationModal}
  //       />
  //       <InfoModal
  //         title={"Heads up!"}
  //         body={<InfoModalBody />}
  //         isOpen={openInfoModal}
  //         setIsOpen={setOpenInfoModal}
  //         continueButtonAction={handleSubmitDonation}
  //       />
  //       <ProgressModal
  //         isOpen={openProgressModal}
  //         subheading={"Please hold while we submit your donation."}
  //         steps={progressSteps}
  //       />
  //       <ErrorModal
  //         isOpen={openErrorModal}
  //         setIsOpen={setOpenErrorModal}
  //         tryAgainFn={handleSubmitDonation}
  //         subheading={errorModalSubHeading}
  //       />
  //       {/*Passport not connected warning modal*/}
  //       <ErrorModal
  //         isOpen={donateWarningModalOpen}
  //         setIsOpen={setDonateWarningModalOpen}
  //         doneFn={() => {
  //           setDonateWarningModalOpen(false);
  //           handleConfirmation();
  //         }}
  //         tryAgainText={"Go to Passport"}
  //         doneText={"Donate without matching"}
  //         tryAgainFn={() => {
  //           navigate(`/round/passport/connect`);
  //         }}
  //         heading={`Don’t miss out on getting your donations matched!`}
  //         subheading={
  //           <>
  //             <p className={"text-sm text-grey-400 mb-2"}>
  //               Verify your identity with Gitcoin Passport to amplify your
  //               donations.
  //             </p>
  //             <p className={"text-sm text-grey-400"}>
  //               Note that donations made without Gitcoin Passport verification
  //               will not be matched.
  //             </p>
  //           </>
  //         }
  //         closeOnBackgroundClick={true}
  //       />
  //     </>
  //   );
  // }

  // async function handleSubmitDonation() {
  //   try {
  //     if (!round) {
  //       throw new Error("round is null");
  //     }
  //
  //     setTimeout(() => {
  //       setOpenProgressModal(true);
  //       setOpenInfoModal(false);
  //     }, modalDelayMs);
  //
  //     const bigNumberDonation = projects.map((donation) => {
  //       return {
  //         ...donation,
  //         amount: ethers.utils.parseUnits(
  //           donation.amount,
  //           selectedPayoutToken.decimal
  //         ),
  //       };
  //     });
  //
  //     await submitDonations({
  //       donations: bigNumberDonation,
  //       donationToken: selectedPayoutToken,
  //       totalDonation: totalDonation,
  //       roundEndTime: round.roundEndTime.getTime(),
  //     });
  //   } catch (error) {
  //     if (error === Logger.errors.TRANSACTION_REPLACED) {
  //       setTransactionReplaced(true);
  //     } else {
  //       datadogLogs.logger.error(
  //         `error: handleSubmitDonation - ${error}, id: `
  //       );
  //       console.error("handleSubmitDonation - roundId", error);
  //     }
  //   }
  // }
}
