import { useState } from "react";
import { PassportState, usePassport } from "../api/passport";
import { useAccount } from "wagmi";
import { ReactComponent as GitcoinPassportLogo } from "../../assets/passport-logo.svg";
import { ReactComponent as GitcoinPassportBWLogo } from "../../assets/passport-logo-bw.svg";
import { ReactComponent as GitcoinPassportLogoFull } from "../../assets/passport-logo-full.svg";
import { Dropdown as DropdownIcon } from "common/src/icons/Dropdown";

export function PassportWidget() {
  const { address } = useAccount();

  const { passportState, passportScore, passportColor, donationImpact } =
    usePassport({ address });

  const [open, setOpen] = useState(false);

  function handleClick() {
    if (
      passportState === PassportState.SCORE_AVAILABLE ||
      passportState === PassportState.INVALID_PASSPORT
    ) {
      setOpen(!open);
    }
  }

  return (
    <>
      <div
        className="flex flex-row gap-2 mt-1 relative"
        onClick={() => handleClick()}
      >
        {passportState === PassportState.SCORE_AVAILABLE ? (
          <div className="relative">
            <GitcoinPassportLogo className="h-8 w-8" />
            <div
              className={`
              ${
                passportColor === "green"
                  ? "bg-green-500"
                  : passportColor === "yellow"
                  ? "bg-yellow-500"
                  : "bg-orange-500"
              }
              absolute bottom-0.5 right-0 w-3 h-3 rounded-full sm:block md:hidden`}
            ></div>
          </div>
        ) : (
          <GitcoinPassportBWLogo className="h-8 w-8" />
        )}
        {passportState === PassportState.SCORE_AVAILABLE && (
          <div
            className={`${
              passportColor === "green"
                ? "text-green-400"
                : passportColor === "yellow"
                ? "text-yellow-400"
                : "text-orange-400"
            }
            text-lg font-semibold hidden md:block`}
          >
            {passportScore}
          </div>
        )}
        <DropdownIcon
          className="inline mt-3 hidden md:block"
          direction={open ? "up" : "down"}
        />
        <div
          className={`absolute mt-1 top-12 border-2 z-10 ml-[-75px] md:right-0 md:ml-0 md:mr-[-20px] w-96 bg-grey-150 md:bg-opacity-80 py-4 px-6 rounded-xl shadow-lg ${
            open ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-4 mt-1">
            <GitcoinPassportLogoFull />
            {passportState === PassportState.SCORE_AVAILABLE ? (
              <>
                <div className="flex flex-row gap-2 w-full justify-center">
                  <div
                    className={`${
                      passportColor === "green"
                        ? "bg-green-100"
                        : passportColor === "yellow"
                        ? "bg-yellow-100"
                        : "bg-orange-100"
                    } w-40 p-4 justify-start rounded-2xl`}
                  >
                    <p className="mb-2">Passport Score</p>
                    <p>{passportScore}</p>
                  </div>
                  <div
                    className={`${
                      passportColor === "green"
                        ? "bg-green-100"
                        : passportColor === "yellow"
                        ? "bg-yellow-100"
                        : "bg-orange-100"
                    } w-40 p-4 justify-start rounded-2xl`}
                  >
                    <p className="mb-2">Donation Impact</p>
                    <p>+{donationImpact}%</p>
                  </div>
                </div>
                <p className="text-left text-sm">
                  Your donation impact is a reflection of your Passport score.
                  This percentage ensures a fair and proportional match. You can
                  always update your score by heading over to Passport.
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-lg">
                  Passport score not detected.
                </p>
                <p className="text-left text-sm">
                  You either do not have a Passport or no stamps added to your
                  Passport yet. Please head over to Passport to configure your
                  score.
                </p>
              </>
            )}
            <div className="flex justify-center">
              <button
                className="flex flex-row gap-2 bg-gray-800 w-1/2 p-2 rounded-xl text-white"
                onClick={() =>
                  window.open("https://passport.gitcoin.co", "_blank")
                }
              >
                <GitcoinPassportLogo className="h-6 w-6" />
                Open Passport
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
