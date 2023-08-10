import {
  submitPassport,
  fetchPassport,
  PassportResponse,
  PassportState,
} from "common";
import { useEffect, useState } from "react";

export { submitPassport, fetchPassport, PassportState };
export type { PassportResponse };

export function usePassport({ address }: { address: string }) {
  const [passport, setPassport] = useState<PassportResponse | undefined>();
  const [, setError] = useState<Response | undefined>();

  const [passportState, setPassportState] = useState<PassportState>(
    PassportState.LOADING
  );

  useEffect(() => {
    setPassportState(PassportState.LOADING);

    const PASSPORT_COMMUNITY_ID =
      process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID;
    if (PASSPORT_COMMUNITY_ID === undefined) {
      throw new Error("passport community id not set");
    }
    const PASSPORT_THRESHOLD = 0;

    if (address && PASSPORT_COMMUNITY_ID) {
      const callFetchPassport = async () => {
        const res = await fetchPassport(address, PASSPORT_COMMUNITY_ID);
        if (res.ok) {
          const json = await res.json();

          if (json.status === "PROCESSING") {
            console.log("processing, calling again in 3000 ms");
            setTimeout(async () => {
              await callFetchPassport();
            }, 3000);
            return;
          } else if (json.status === "ERROR") {
            // due to error at passport end
            setPassportState(PassportState.ERROR);
            return;
          }

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
    passport,
  };
}
