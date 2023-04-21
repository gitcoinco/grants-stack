import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { getUTCDateTime } from "common";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";
import { useRoundById } from "../../context/RoundContext";
import {
  PassportResponse,
  PassportState,
  fetchPassport,
} from "../api/passport";

export default function PassportBanner(props: {
  chainId?: string;
  roundId?: string;
}) {
  const chainId = props.chainId;
  const roundId = props.roundId;

  const navigate = useNavigate();

  const [, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  const { round } = useRoundById(chainId!, roundId!);

  useEffect(() => {
    setPassportState(PassportState.LOADING);

    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;

    if (isConnected && address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const scoreResponse = await res.json();

          if (scoreResponse.status == "PROCESSING") {
            console.log("processing, calling again in 3000 ms");
            setTimeout(async () => {
              await callFetchPassport();
            }, 3000);
            return;
          }

          if (scoreResponse.status == "ERROR") {
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
    <>
      <button
        className="ml-3 font-medium text-sm underline"
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
    </>
  );

  const UpdateScoreButton = () => (
    <>
      <button
        className="ml-3 font-medium text-sm underline"
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
    </>
  );

  const CreatePassportButton = () => (
    <>
      <button
        className="ml-3 font-medium text-sm underline"
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
    </>
  );

  const ConnectWalletButton = () => (
    <>
      <button
        className="ml-3 font-medium text-sm underline"
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
    </>
  );

  const InvalidPassportButton = () => (
    <>
      <button
        className="ml-3 font-medium text-sm underline mr-1.5"
        data-testid="visit-passport-button"
        onClick={() =>
          navigate(`/round/${chainId}/${roundId}/passport/connect`)
        }
      >
        Please configure your Gitcoin Passport
      </button>
      <svg
        width="16"
        height="14"
        viewBox="0 0 16 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893L15.7071 6.29289C16.0976 6.68342 16.0976 7.31658 15.7071 7.70711L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L12.5858 8L1 8C0.447716 8 0 7.55229 0 7C0 6.44772 0.447716 6 1 6H12.5858L8.29289 1.70711C7.90237 1.31658 7.90237 0.683418 8.29289 0.292893Z"
          fill="#0E0333"
        />
      </svg>
    </>
  );

  const AlertIcon = () => {
    return (
      <div className="flex justify-center items-center h-7 w-7 relative text-white items-center rounded-full bg-yellow-400">
        <ExclamationCircleIcon className="fill-yellow-400 stroke-yellow-100 h-4 w-4 relative text-white items-center rounded-full" />
      </div>
    );
  };

  const bannerConfig = {
    [PassportState.NOT_CONNECTED]: {
      icon: (
        <ExclamationCircleIcon className="fill-purple-500 stroke-purple-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-purple-200",
      testId: "wallet-not-connected",
      body: `Want to make sure your donations get matched? Verify your Gitcoin Passport by ${getUTCDateTime(
        round!.roundEndTime
      )}.`,
      button: <ConnectWalletButton />,
    },
    [PassportState.MATCH_ELIGIBLE]: {
      icon: (
        <CheckBadgeIcon className="fill-teal-400 stroke-teal-100 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-teal-100",
      testId: "match-eligible",
      body: "Gitcoin Passport score verified. Your donation will be matched!",
      button: <ViewScoreButton />,
    },
    [PassportState.MATCH_INELIGIBLE]: {
      icon: <AlertIcon />,
      color: "bg-yelllow-100",
      testId: "match-ineligible",
      body: `Your Gitcoin Passport is not currently eligible for donation matching. Please update by ${getUTCDateTime(
        round!.roundEndTime
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
      color: "bg-yellow-100",
      testId: "invalid-passport",
      body: `You don't have a Gitcoin Passport. Please create one by ${getUTCDateTime(
        round!.roundEndTime
      )}.`,
      button: <CreatePassportButton />,
    },
    [PassportState.ERROR]: {
      icon: (
        <ExclamationCircleIcon className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-red-200",
      testId: "error-loading-passport",
      body: "An error occurred while loading your Gitcoin Passport. Please try again later.",
      button: null,
    },
    [PassportState.INVALID_RESPONSE]: {
      icon: (
        <ExclamationCircleIcon className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-red-200",
      testId: "error-loading-passport",
      body: "Passport Profile not detected. Please open Passport to troubleshoot.",
      button: null,
    },
  };

  return (
    <div className="relative top-16">
      <div className={bannerConfig[passportState].color}>
        <div className="max-w-full py-3 px-3 sm:px-6 lg:px-8 z-0">
          <div className="flex flex-row flex-wrap items-center justify-center">
            <div className="relative">{bannerConfig[passportState].icon}</div>
            <span
              data-testid={bannerConfig[passportState].testId}
              className="ml-3 font-medium text-sm"
            >
              {bannerConfig[passportState].body}
            </span>
            {bannerConfig[passportState].button}
          </div>
        </div>
      </div>
    </div>
  );
}
