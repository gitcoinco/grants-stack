import {
  ArrowRightIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { ChainId, getUTCDateTime } from "common";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";
import {
  PassportResponse,
  PassportState,
  fetchPassport,
} from "../api/passport";
import { Round } from "../api/types";
/*TODO: use usePassport hook and refactor */
export default function PassportBanner(props: {
  chainId: ChainId;
  round: Round;
}) {
  const chainId = props.chainId;
  const roundId = props.round.id;

  const navigate = useNavigate();

  const [, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  useEffect(() => {
    setPassportState(PassportState.LOADING);

    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;

    if (isConnected && address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const scoreResponse = await res.json();

          if (scoreResponse.status === "PROCESSING") {
            console.log("processing, calling again in 3000 ms");
            setTimeout(async () => {
              await callFetchPassport();
            }, 3000);
            return;
          }

          if (scoreResponse.status === "ERROR") {
            // due to error at passport end
            setPassportState(PassportState.ERROR);
            return;
          }

          setPassport(scoreResponse);
          setPassportState(
            Number(scoreResponse.evidence.rawScore) >=
              Number(scoreResponse.evidence.threshold)
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

    // call fetch passport
    // check passport
  }, [address, isConnected]);

  const ViewScoreButton = () => (
    <div className="flex flex-row items-center mt-2 md:mt-0">
      <button
        className="md:ml-3 font-medium text-sm underline md:mt-0"
        data-testid="view-score-button"
        onClick={() =>
          navigate(`/round/${chainId}/${roundId}/passport/connect`)
        }
      >
        View score
      </button>
      <div className="pl-1">
        <ArrowRightIcon className="h-4 w-4 relative text-gray-900 items-center" />
      </div>
    </div>
  );

  const UpdateScoreButton = () => (
    <div className="flex flex-row items-center mt-2 md:mt-0">
      <button
        className="md:ml-3 font-medium text-sm underline md:mt-0"
        data-testid="view-score-button"
        onClick={() =>
          navigate(`/round/${chainId}/${roundId}/passport/connect`)
        }
      >
        Update score
      </button>
      <div className="pl-1">
        <ArrowRightIcon className="h-4 w-4 relative text-gray-900 items-center" />
      </div>
    </div>
  );

  const CreatePassportButton = () => (
    <div className="flex flex-row items-center mt-2 md:mt-0">
      <button
        className="md:ml-3 font-medium text-sm underline md:mt-0"
        data-testid="view-score-button"
        onClick={() =>
          navigate(`/round/${chainId}/${roundId}/passport/connect`)
        }
      >
        Create your Gitcoin Passport
      </button>
      <div className="pl-1">
        <ArrowRightIcon className="h-4 w-4 relative text-gray-900 items-center" />
      </div>
    </div>
  );

  const ConnectWalletButton = () => (
    <div className="flex flex-row items-center mt-2 md:mt-0">
      <button
        className="flex md:ml-3 font-medium text-sm underline md:mt-0"
        onClick={() => {
          document
            .getElementById("connect-wallet-button")
            ?.querySelector("button")
            ?.click();
        }}
        data-testid="connect-wallet-button"
      >
        Connect your wallet to verify
      </button>
      <div className="pl-1">
        <ArrowRightIcon className="h-4 w-4 relative text-gray-900 items-center" />
      </div>
    </div>
  );

  const AlertIcon = () => {
    return (
      <div className="hidden md:block md:justify-center h-7 w-7 relative text-white items-center rounded-full bg-yellow-400">
        <ExclamationCircleIcon className="fill-yellow-400 stroke-yellow-100 h-7 w-7 relative text-white items-center rounded-full" />
      </div>
    );
  };

  const bannerConfig = {
    [PassportState.NOT_CONNECTED]: {
      icon: (
        <ExclamationCircleIcon className="sm:flex fill-violet-400 stroke-violet-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-white",
      testId: "wallet-not-connected",
      body: `Want to make sure your donations get matched? Verify your Gitcoin Passport by ${getUTCDateTime(
        props.round.roundEndTime
      )}`,
      button: <ConnectWalletButton />,
    },
    [PassportState.MATCH_ELIGIBLE]: {
      icon: (
        <CheckBadgeIcon className="fill-teal-400 stroke-teal-100 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-white",
      testId: "match-eligible",
      body: "Gitcoin Passport score verified. Your donation will be matched!",
      button: <ViewScoreButton />,
    },
    [PassportState.MATCH_INELIGIBLE]: {
      icon: <AlertIcon />,
      color: "bg-white",
      testId: "match-ineligible",
      body: `Your Gitcoin Passport is not currently eligible for donation matching. Please update by ${getUTCDateTime(
        props.round.roundEndTime
      )}.`,
      button: <UpdateScoreButton />,
    },
    [PassportState.LOADING]: {
      icon: <PassportLogo className="animate-spin opacity-75" />,
      color: "bg-white",
      testId: "loading-passport-score",
      body: "Loading Passport...",
      button: null,
    },
    [PassportState.INVALID_PASSPORT]: {
      icon: <AlertIcon />,
      color: "bg-white",
      testId: "invalid-passport",
      body: `You don't have a Gitcoin Passport. Please create one by ${getUTCDateTime(
        props.round.roundEndTime
      )}.`,
      button: <CreatePassportButton />,
    },
    [PassportState.ERROR]: {
      icon: (
        <ExclamationCircleIcon className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-white",
      testId: "error-loading-passport",
      body: "An error occurred while loading your Gitcoin Passport. Please try again later.",
      button: null,
    },
    [PassportState.INVALID_RESPONSE]: {
      icon: (
        <ExclamationCircleIcon className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-white",
      testId: "error-loading-passport",
      body: "Passport Profile not detected. Please open Passport to troubleshoot.",
      button: null,
    },
  };

  return (
    <div className="relative top-28">
      <div className={bannerConfig[passportState].color}>
        <div className="max-w-full py-3 px-3 sm:px-6 lg:px-8 z-0">
          <div className="flex flex-row justify-center items-center items-left">
            <div className="flex mb-10 lg:mb-0 mr-2">
              {bannerConfig[passportState].icon}
            </div>
            <div className="lg:flex">
              <span
                data-testid={bannerConfig[passportState].testId}
                className="font-medium text-sm sm:flex sm:flex-col"
              >
                {bannerConfig[passportState].body}
              </span>
              {bannerConfig[passportState].button}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
