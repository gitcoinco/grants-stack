import useSWR, { SWRResponse } from "swr";
import { ChainId } from "common";
import { createISOTimestamp } from "../discovery/utils/createRoundsStatusFilter";
import { RoundGetRound, RoundsQueryVariables, useDataLayer } from "data-layer";

export const useRounds = (
  variables: RoundsQueryVariables,
  chainIds: ChainId[]
): SWRResponse<RoundGetRound[]> => {
  const dataLayer = useDataLayer();

  const query = useSWR(
    // Cache requests on chainIds and variables as keys (when these are the
    // same, cache will be used instead of new requests)
    ["rounds", chainIds, variables],
    async () => {
      const spamRounds = await fetchSpamRounds();
      const { rounds } = await dataLayer.getRounds({
        ...variables,
        first: 100,
        chainIds,
      });

      return rounds.filter(
        (round) => !spamRounds[round.chainId]?.[round.id.toLowerCase()]
      );
    }
  );

  const data = query.data
    // Limit final results returned
    ?.slice(0, variables.first ?? query.data?.length);

  return { ...query, data };
};

export function filterRoundsWithProjects(rounds: RoundGetRound[]) {
  /*
0 projects + application period is still open: show
0 projects + application period has closed: hide
  */
  const currentTimestamp = createISOTimestamp();
  return rounds.filter(
    (round) =>
      new Date(round.applicationsEndTime).getTime() * 1000 >
        Date.parse(currentTimestamp) || round?.applications?.length > 0
  );
}

export const filterOutPrivateRounds = (rounds: RoundGetRound[]) => {
  return rounds.filter((round) => round.roundMetadata.roundType !== "private");
};

type SpamRoundsMaps = {
  [chainId: number]: {
    [roundId: string]: boolean;
  };
};

// Temporary round curation to avoid spam
export async function fetchSpamRounds(): Promise<SpamRoundsMaps> {
  const spam: SpamRoundsMaps = {};

  const csvContent = await fetch(
    "https://docs.google.com/spreadsheets/d/10jekVhMuFg6IQ0sYAN_dxh_U-OxU7EAuGMNvTtlpraM/export?format=tsv"
  ).then((res) => res.text());

  const rows = csvContent.split("\n");
  rows
    // skip the header row
    .slice(1)
    .forEach((line) => {
      const columns = line.split("\t");
      const url = columns[1];
      // extract chainId and roundId
      const regex =
        /https:\/\/explorer\.gitcoin\.co\/#\/round\/(\d+)\/([0-9a-fA-Fx]+)/;
      const match = url.match(regex);
      if (match) {
        const chainId = parseInt(match[1]);
        const roundId = match[2].toLowerCase();
        spam[chainId] ||= {};
        spam[chainId][roundId] = true;
      }
    });

  return spam;
}
