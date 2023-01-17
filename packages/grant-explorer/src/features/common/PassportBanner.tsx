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
import { useNavigate } from "react-router-dom";

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
  useEffect(() => {
    setPassportState(PassportState.LOADING);

    // TODO: fetch from round metadata
    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;

    if (isConnected && address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const json = await res.json();

          // TODO: Handle exponential backoff
          if (json.status == "PROCESSING") {
            await callFetchPassport();
            return;
          }

          setPassport(json);
          setPassportState(
            json.evidence.rawScore >= json.evidence.threshold
              ? PassportState.MATCH_ELIGIBLE
              : PassportState.MATCH_INELIGIBLE
          );
        } else {
          setError(res);
          switch (res.status) {
            case 400: // unregistered/nonexistent passport address
              setPassportState(PassportState.INVALID_PASSPORT);
              console.error(
                "unregistered/nonexistent passport address",
                res.json()
              );
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
        className="ml-3 font-medium text-sm underline mr-1.5"
        data-testid="visit-passport-button"
        onClick={() =>
          navigate(`/round/${chainId}/${roundId}/passport/connect`)
        }
      >
        Please configure your passport
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
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="12" fill="#FFCC00" />
          <path
            d="M8.40015 15.5999L15.6001 8.3999M8.40015 8.3999L15.6001 15.5999"
            stroke="#FFF8DB"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "bg-yellow-100",
      testId: "invalid-passport",
      body: "Passport score not detected.",
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
  );
}
