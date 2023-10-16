import { useEffect, useState } from "react";
import { PassportResponse, fetchPassport } from "../api/passport";
import { useAccount } from "wagmi";
import { ReactComponent as GitcoinPassportLogo } from "../../assets/passport-logo.svg";

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
    <div className="flex flex-row gap-2">
      <GitcoinPassportLogo className="h-8 w-8" />
      {passportState === PassportState.SCORE_AVAILABLE && (
        <div className="text-lg font-semibold text-green-400">
          {passportScore}
        </div>
      )}
    </div>
  );
}
