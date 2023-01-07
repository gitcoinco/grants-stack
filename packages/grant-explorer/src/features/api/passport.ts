import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  MATCH_ELIGIBLE,
  MATCH_INELIGIBLE,
  LOADING,
  ERROR,
}

type PassportResponse = {
  address?: string;
  score?: string;
  detail?: string;
}

export function usePassport(): {
  passport: PassportResponse | undefined;
  error: Response | undefined;
  passportState: PassportState;
  setPassportState: (state: PassportState) => void;
} {
  const [passport, setPassport] = useState<PassportResponse | undefined>();
  const [error, setError] = useState<Response | undefined>();
  const { address, isConnected } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(PassportState.LOADING);

  const PASSPORT_THRESHOLD = 0.0; // TODO: determine passport threshold

  useEffect(() => {
    const checkPassport = () => {
      setPassportState(PassportState.LOADING);
      const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/score/${process.env.REACT_APP_PASSPORT_API_COMMUNITY_ID}/${address}`;
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`
        },
      })
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          } else {
            setError(resp);
            throw resp;
          }
        })
        .then((data: PassportResponse) => {
          if (data) {
            if (Number(data.score) >= PASSPORT_THRESHOLD) {
              setPassportState(PassportState.MATCH_ELIGIBLE);
            } else {
              setPassportState(PassportState.MATCH_INELIGIBLE);
            }
            setPassport(data);
          } else {
            setPassportState(PassportState.INVALID_PASSPORT);
          }
        })
        .catch((err: Response) => {
          switch (err.status) {
            case 400: // unregistered/nonexistent passport address
              setPassportState(PassportState.INVALID_PASSPORT);
              console.log(err.json());
              break;
            case 401: // invalid API key
              setPassportState(PassportState.ERROR);
              console.log(err.json());
              break;
            default:
              setPassportState(PassportState.ERROR);
              console.error("Error fetching passport", err);
          }
        });
    };

    if (isConnected) {
      // NOTE: we should cache these results and state
      checkPassport();
    } else {
      setPassportState(PassportState.NOT_CONNECTED);
    }
  }, [isConnected, address]);

  return {
    passport,
    error,
    passportState,
    setPassportState,
  };
}
