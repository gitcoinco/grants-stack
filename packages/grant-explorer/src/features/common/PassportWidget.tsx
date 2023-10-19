import { useEffect, useState } from "react";
import { PassportResponse, fetchPassport } from "../api/passport";
import { useAccount } from "wagmi";
import { ReactComponent as GitcoinPassportLogo } from "../../assets/passport-logo.svg";
import { ReactComponent as GitcoinPassportBWLogo } from "../../assets/passport-logo-bw.svg";
import { ReactComponent as GitcoinPassportLogoFull } from "../../assets/passport-logo-full.svg";
import { Dropdown as DropdownIcon } from "common/src/icons/Dropdown";

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  SCORE_AVAILABLE,
  LOADING,
  ERROR,
  INVALID_RESPONSE,
}

export function PassportWidget() {
  const [, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  const [passportScore, setPassportScore] = useState<number>();
  const [textColor, setTextColor] = useState<string>("gray");
  const [donationImpact, setDonationImpact] = useState<number>(0);
  const [open, setOpen] = useState(false);

  function handleClick() {
    if (
      passportState === PassportState.SCORE_AVAILABLE ||
      passportState === PassportState.INVALID_PASSPORT
    ) {
      setOpen(!open);
    }
  }

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
          setPassportScore(Number(scoreResponse.evidence.rawScore));
          setPassportState(PassportState.SCORE_AVAILABLE);
          const score = Number(scoreResponse.evidence.rawScore);
          if (score < 15) {
            setTextColor("orange");
            setDonationImpact(0);
          } else if (score >= 15 && score < 25) {
            setTextColor("yellow");
            setDonationImpact(50);
          } else {
            setTextColor("green");
            setDonationImpact(100);
          }
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
              className={`absolute bottom-0.5 right-0 w-3 h-3 bg-${textColor}-500 rounded-full sm:block md:hidden`}
            ></div>
          </div>
        ) : (
          <GitcoinPassportBWLogo className="h-8 w-8" />
        )}
        {passportState === PassportState.SCORE_AVAILABLE && (
          <div
            className={`text-lg font-semibold text-${textColor}-400 hidden md:block`}
          >
            {passportScore}
          </div>
        )}
        <DropdownIcon
          className="inline mt-3 hidden md:block"
          direction={open ? "up" : "down"}
        />
        <div
          className={`absolute top-24 mt-1 ml-[-75px] md:top-16 md:right-0 md:ml-0 md:mr-[-20px] w-96 bg-grey-150 bg-opacity-80 py-4 px-6 rounded-xl shadow-lg ${
            open ? "block" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-4 mt-1">
            <GitcoinPassportLogoFull />
            {passportState === PassportState.SCORE_AVAILABLE ? (
              <>
                <div className="flex flex-row gap-2 w-full justify-center">
                  <div
                    className={`bg-${textColor}-100 w-40 p-4 justify-start rounded-2xl`}
                  >
                    <p className="mb-2">Passport Score</p>
                    <p>{passportScore}</p>
                  </div>
                  <div
                    className={`bg-${textColor}-100 w-40 p-4 justify-start rounded-2xl`}
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
