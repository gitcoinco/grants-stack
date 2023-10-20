import { datadogLogs } from "@datadog/browser-logs";
import {
  submitPassport,
  fetchPassport,
  PassportResponse,
  PassportState,
} from "common";
import { useEffect, useState } from "react";

export { submitPassport, fetchPassport, PassportState };
export type { PassportResponse };

export function usePassport({ address }: { address: string | undefined }) {
  const [, setError] = useState<Response | undefined>();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  const [passportScore, setPassportScore] = useState<number>();
  const [passportColor, setPassportColor] = useState<string>("");
  const [donationImpact, setDonationImpact] = useState<number>(0);

  useEffect(() => {
    setPassportState(PassportState.LOADING);

    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;

    if (PASSPORT_COMMUNITY_ID === undefined) {
      throw new Error("passport community id not set");
    }

    if (address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);

        if (!res) {
          datadogLogs.logger.error(
            `error: callFetchPassport - fetch failed`,
            res
          );
          setPassportState(PassportState.ERROR);
          return;
        }

        if (res.ok) {
          const scoreResponse: PassportResponse = await res.json();

          if (scoreResponse.status === "PROCESSING") {
            console.log("processing, calling again in 3000 ms");
            setTimeout(async () => {
              await callFetchPassport();
            }, 3000);
            return;
          }

          if (
            !scoreResponse.score ||
            !scoreResponse.evidence ||
            scoreResponse.status === "ERROR"
          ) {
            datadogLogs.logger.error(
              `error: callFetchPassport - invalid score response`,
              scoreResponse
            );
            setPassportState(PassportState.INVALID_RESPONSE);
            return;
          }

          const score = Number(scoreResponse.evidence.rawScore);
          setPassportScore(score);
          setPassportState(PassportState.SCORE_AVAILABLE);
          if (score < 15) {
            setPassportColor("orange");
            setDonationImpact(0);
          } else if (score >= 15 && score < 25) {
            setPassportColor("yellow");
            setDonationImpact(50);
          } else {
            setPassportColor("green");
            setDonationImpact(100);
          }
        } else {
          setError(res);
          datadogLogs.logger.error(
            `error: callFetchPassport - passport NOT OK`,
            res
          );
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
  }, [address]);

  return {
    passportState,
    passportScore,
    passportColor,
    donationImpact,
  };
}
