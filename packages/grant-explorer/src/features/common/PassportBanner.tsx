import {
  ExclamationCircleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid'
import { PassportState, usePassport } from "../api/passport";
import { ReactComponent as PassportLogo } from "../../assets/passport-logo.svg";


export default function PassportBanner() {

  const { passportState } = usePassport();

  const bannerConfig = {
    [PassportState.NOT_CONNECTED]: {
      icon: <ExclamationCircleIcon
        className="fill-purple-500 stroke-purple-200 h-7 w-7 relative text-white items-center rounded-full"/>,
      color: "bg-purple-200",
      body: (
        <div data-testid="wallet-not-connected">
          In order to for your donations to be matched, you must first verify your Passport.
        </div>
      ),
      button: (
        <>
          <button
            className="ml-3 font-medium text-sm underline"
            onClick={() => {
              document.getElementById("connect-wallet-button")?.querySelector("button")?.click();
            }}
            data-testid="connect-wallet-button"
          >
            Connect your wallet to verify
          </button>
        </>
      ),
    },
    [PassportState.MATCH_ELIGIBLE]: {
      icon: <CheckBadgeIcon
        className="fill-teal-400 stroke-teal-100 h-7 w-7 relative text-white items-center rounded-full"/>,
      color: "bg-teal-100",
      body: (
        <div data-testid="match-eligible">
          Passport score verified. Your donation will be matched!
        </div>
      ),
      button: (
        <>
          <button
            className="ml-3 font-medium text-sm underline"
            data-testid="view-score-button"
          >
            View score
          </button>
          <div className="pl-1">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 relative text-gray-900 items-center"/>
          </div>
        </>
      ),
    },
    [PassportState.MATCH_INELIGIBLE]: {
      icon: <XCircleIcon
        className="fill-pink-400 stroke-pink-100 h-7 w-7 relative text-white items-center rounded-full"/>,
      color: "bg-pink-100",
      body: (
        <div data-testid="match-ineligible">
          Your Passport does not have the score needed to be eligible for donation matching.
        </div>
      ),
      button: (
        <>
          <button
            className="ml-3 font-medium text-sm underline"
            data-testid="view-score-button"
          >
            View score
          </button>
          <div className="pl-1">
            <ArrowTopRightOnSquareIcon className="h-4 w-4 relative text-gray-900 items-center"/>
          </div>
        </>
      ),
    },
    [PassportState.LOADING]: {
      icon: <PassportLogo className="animate-spin opacity-75"/>,
      color: "bg-white",
      body: (
        <div className="opacity-50 pt-1" data-testid="loading-passport-score">
          Loading Passport...
        </div>
      ),
      button: null,
    },
    [PassportState.INVALID_PASSPORT]: {
      icon: null,
      color: "bg-yellow-300",
      body: (
        <div data-testid="invalid-passport">
          Invalid Passport. Please verify with a Passport.
        </div>
      ),
      button: (
        <button
          className="ml-3 font-medium text-sm underline"
          data-testid="visit-passport-button"
        >
          Visit Passport
        </button>
      )
    },
    [PassportState.ERROR]: {
      icon: <ExclamationCircleIcon
        className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full"/>,
      color: "bg-red-200",
      body: (
        <div data-testid="error-loading-passport">
          An error occurred while loading your Passport. Please try again later.
        </div>
      ),
      button: null,
    }
  };

  return (
    <div className={bannerConfig[passportState].color}>
      <div className="max-w-full py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-row flex-wrap items-center justify-center">
          <div className="h-7 w-7 relative">
            {bannerConfig[passportState].icon}
          </div>
          <span className="ml-3 font-medium text-sm">{bannerConfig[passportState].body}</span>
          {bannerConfig[passportState].button}
        </div>
      </div>
    </div>
  )
}
