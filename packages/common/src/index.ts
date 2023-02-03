import useSWR from "swr";

export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  MATCH_ELIGIBLE,
  MATCH_INELIGIBLE,
  LOADING,
  ERROR,
}

type PassportEvidence = {
  type: string;
  rawScore: string;
  threshold: string;
};

export type PassportResponse = {
  address?: string;
  score?: string;
  status?: string;
  evidence?: PassportEvidence;
  error?: string;
  detail?: string;
};

type UsePassportHook = {
  /** Passport for the given address and communityId */
  passport: PassportResponse | undefined;
  /** State of the hook
   * Handles loading, error and other states */
  state: PassportState;
  /** Error during fetching of passport score */
  error: Response | undefined;
  /** Re-submits the address for passport scoring
   * Promise resolves when the submission is successful, NOT when the score is updated */
  recalculateScore: () => Promise<Response>;
  /**
   * Refreshes the score without resubmitting for scoring */
  refreshScore: () => Promise<void>;
};

export function usePassport(address: string, communityId: string): UsePassportHook {
  const { data, error, mutate } = useSWR<PassportResponse>(
    [address, communityId],
    ([address, communityId]: [address: string, communityId: string]) =>
      fetchPassport(address, communityId).then((res) => res.json())
  );

  return {
    error,
    state: PassportState.NOT_CONNECTED,
    refreshScore: async () => {
      await mutate();
    },
    recalculateScore: () => submitPassport(address, communityId),
    passport: data
  };
}


/**
 * Endpoint used to fetch the passport score for a given address
 *
 * @param address
 * @param communityId
 * @returns
 */
export const fetchPassport = (
  address: string,
  communityId: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/score/${communityId}/${address}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`
    }
  });
};

/**
 * Endpoint used to submit user's passport score for given communityId
 *
 * @param address string
 * @param communityId string
 * @returns
 */
export const submitPassport = (
  address: string,
  communityId: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/submit-passport`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`
    },
    body: JSON.stringify({
      address,
      community: communityId,
      signature: "",
      nonce: ""
    })
  });
};
