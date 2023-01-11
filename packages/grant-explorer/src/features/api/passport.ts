export enum PassportState {
  NOT_CONNECTED,
  INVALID_PASSPORT,
  MATCH_ELIGIBLE,
  MATCH_INELIGIBLE,
  LOADING,
  ERROR,
}

export type PassportResponse = {
  address?: string;
  score?: string;
  detail?: string;
};

export const fetchPassport = (
  address: string | undefined,
  communityId: string
): Promise<Response> => {
  const url = `${process.env.REACT_APP_PASSPORT_API_ENDPOINT}/registry/score/${communityId}/${address}`;
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_PASSPORT_API_KEY}`,
    },
  });
};
