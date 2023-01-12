import {
  ExclamationCircleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import {
  fetchPassport,
  PassportResponse,
  PassportState,
} from "../api/passport";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from 'react-router-dom';


export default function PassportBanner(props: {chainId?: string, roundId?: string}) {

  const chainId =props.chainId;
  const roundId = props.roundId;

  const navigate = useNavigate();

  const [, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );
  useEffect(() => {
    setPassportState(PassportState.LOADING);

    // TODO: fetch from round metadata
    const PASSPORT_COMMUNITY_ID = process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;
    const PASSPORT_THRESHOLD = 0;

    if (isConnected && address && PASSPORT_COMMUNITY_ID) {

      const callFetchPassport = async () => {

        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const json = await res.json();
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
              console.error("unregistered/nonexistent passport address", res.json());
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
      }

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
        onClick={() => navigate(`/round/${chainId}/${roundId}/passport/connect`)}
      >
        View score
      </button>
      <div className="pl-1">
        <ArrowTopRightOnSquareIcon className="h-4 w-4 relative text-gray-900 items-center" />
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
    </>
  );

  const InvalidPassportButton = () => (
    <>
      <button
        className="ml-3 font-medium text-sm underline"
        data-testid="visit-passport-button"
        onClick={() => navigate(`/round/${chainId}/${roundId}/passport/connect`)}
      >
        Visit Passport
      </button>
    </>
  );

  const bannerConfig = {
    [PassportState.NOT_CONNECTED]: {
      icon: (
        <ExclamationCircleIcon className="fill-purple-500 stroke-purple-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-purple-200",
      testId: "wallet-not-connected",
      body: "In order to for your donations to be matched, you must first verify your Passport.",
      button: <ConnectWalletButton />,
    },
    [PassportState.MATCH_ELIGIBLE]: {
      icon: (
        <CheckBadgeIcon className="fill-teal-400 stroke-teal-100 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-teal-100",
      testId: "match-eligible",
      body: "Passport score verified. Your donation will be matched!",
      button: <ViewScoreButton />,
    },
    [PassportState.MATCH_INELIGIBLE]: {
      icon: (
        <XCircleIcon className="fill-pink-400 stroke-pink-100 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-pink-100",
      testId: "match-ineligible",
      body: "Your Passport does not have the score needed to be eligible for donation matching.",
      button: <ViewScoreButton />,
    },
    [PassportState.LOADING]: {
      icon: <PassportLogo className="animate-spin opacity-75" />,
      color: "bg-white",
      testId: "loading-passport-score",
      body: "Loading Passport...",
      button: null,
    },
    [PassportState.INVALID_PASSPORT]: {
      icon: null,
      color: "bg-yellow-300",
      testId: "invalid-passport",
      body: "Invalid Passport. Please verify with a Passport.",
      button: <InvalidPassportButton />,
    },
    [PassportState.ERROR]: {
      icon: (
        <ExclamationCircleIcon className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full" />
      ),
      color: "bg-red-200",
      testId: "error-loading-passport",
      body: "An error occurred while loading your Passport. Please try again later.",
      button: null,
    },
  };

  return (
    <div className={bannerConfig[passportState].color}>
      <div className="max-w-full py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-row flex-wrap items-center justify-center">
          <div className="h-7 w-7 relative">
            {bannerConfig[passportState].icon}
          </div>
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
  );
}
