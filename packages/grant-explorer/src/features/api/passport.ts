import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  MATCH_ELIGIBLE,
  MATCH_INELIGIBLE,
  LOADING,
}

export function usePassport() {
  const [passport, setPassport] = useState();
  const [error, setError] = useState<Response | undefined>();
  const { address, isConnected, isDisconnected, status } = useAccount();

  const [passportState, setPassportState] = useState<PassportState>(PassportState.LOADING);

  const PASSPORT_THRESHOLD = 0.0; // TODO: determine passport threshold

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
        }
      })
      .then((data) => {
        if (data) {
          // TODO: figure out a good score threshold
          if (Number(data.score) >= PASSPORT_THRESHOLD) {
            setPassportState(PassportState.MATCH_ELIGIBLE);
          } else {
            setPassportState(PassportState.MATCH_INELIGIBLE);
          }
        } else {
          setPassportState(PassportState.INVALID_PASSPORT);
        }
      });
  };

  useMemo(() => {
    if (isConnected) {
      checkPassport();
    } else {
      setPassportState(PassportState.NOT_CONNECTED);
    }
  }, [isConnected, address]);

  return {
    data: passport,
    error,
    passportState,
    setPassportState,
  };
}
