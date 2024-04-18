import { useState } from "react";
import { PassportState, usePassport } from "../api/passport";
import { useAccount } from "wagmi";
import { ReactComponent as GitcoinPassportLogoFull } from "../../assets/passport-logo-full.svg";
import { ReactComponent as GitcoinPassportLogo } from "../../assets/passport-logo.svg";
import { Dropdown as DropdownIcon } from "common/src/icons/Dropdown";
import { Round } from "data-layer";
import {
  ChainId,
  isRoundUsingPassportLite,
  roundToPassportURLMap,
} from "common";
import { PassportShield } from "./PassportShield";

type PassportWidgetProps = {
  round: Round;
  alignment?: "left" | "right";
};

export function PassportWidget({ round, alignment }: PassportWidgetProps) {
  const { address } = useAccount();

  const { passportState, passportScore, passportColor, donationImpact } =
    usePassport({ address, round });

  const [isOpen, setIsOpen] = useState(false);

  const passportURL = roundToPassportURLMap(round);

  function handleClick() {
    if (
      passportState === PassportState.SCORE_AVAILABLE ||
      passportState === PassportState.INVALID_PASSPORT
    ) {
      setIsOpen(!isOpen);
    }
  }

  return (
    <>
      {isRoundUsingPassportLite(round) ? (
        <div title="This round is protected by a combination of Passport’s model-based detection system and specialized donation verification.">
          <GitcoinPassportLogo className="h-8 w-8" />
        </div>
      ) : (
        <div
          className="flex flex-row gap-2 mt-1 relative cursor-pointer"
          onClick={() => handleClick()}
        >
          <div className="pt-4">
            {alignment === "right" ? (
              <GitcoinPassportLogoFull />
            ) : (
              <GitcoinPassportLogo />
            )}
          </div>
          {passportState === PassportState.SCORE_AVAILABLE ? (
            <div className="relative hidden md:flex justify-center items-center">
              <PassportShield color={passportColor} />
              <p
                className="absolute text-sm font-modern-era-medium"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                {passportScore.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="relative hidden md:flex justify-center items-center">
              <PassportShield color={"white"} />
              <p
                className="absolute text-sm font-modern-era-medium"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                0.0
              </p>
            </div>
          )}
          <DropdownIcon
            className="inline mt-6 md:block"
            direction={isOpen ? "up" : "down"}
          />
          <div
            className={`backdrop-blur-[2px] cursor-auto absolute mt-1 top-12 ${
              alignment === "left" ? "left-[60px] md:left-[-20px]" : ""
            } border-2
           z-20 ml-[-75px] font-modern-era-medium md:right-0
            md:ml-0 md:mr-[-20px] w-96 bg-white md:bg-white/90 py-4 px-6
             rounded-3xl shadow-lg ${isOpen ? "block" : "hidden"}`}
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
                      <p className={"font-modern-era-regular text-xl"}>
                        {passportScore.toFixed(2)}
                      </p>
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
                      <p className={"font-modern-era-regular text-xl"}>
                        +{donationImpact.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-left text-xs font-dm-mono">
                    Your donation impact is calculated based on your Passport
                    score.
                    {round.chainId !== ChainId.AVALANCHE && (
                      <span>
                        Scores higher than 15 will begin to be eligible for
                        matching, and your donation impact scales as your
                        Passport score increases.
                      </span>
                    )}
                    <span>
                      {" "}
                      You can update your score by heading over to Passport.{" "}
                    </span>
                    {round.chainId === ChainId.AVALANCHE && (
                      <span>
                        To learn more about the Avalanche Custom Scorer, click{" "}
                        <a
                          href={
                            "https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/supporter-donor-faq/passport-custom-scorer"
                          }
                          className={"underline"}
                        >
                          here
                        </a>
                        .
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-center text-lg">
                    Passport score not detected.
                  </p>
                  <p className="text-left text-sm">
                    You either do not have a Passport or no stamps added to your
                    Passport yet. Please head over to{" "}
                    <a
                      href={"https://passport.gitcoin.co"}
                      className={"underline"}
                    >
                      Passport
                    </a>{" "}
                    to configure your score.
                  </p>
                </>
              )}
              <div className="flex justify-center">
                <button
                  className="flex flex-row gap-2 bg-gray-800 w-1/2 p-2 rounded-xl text-white text-base"
                  onClick={() => window.open(passportURL, "_blank")}
                >
                  <GitcoinPassportLogo className="h-6 w-6" />
                  Open Passport
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
