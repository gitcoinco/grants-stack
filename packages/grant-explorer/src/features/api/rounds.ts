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
      const [spamRounds, { rounds }] = await Promise.all([
        fetchSpamRounds(),
        dataLayer.getRounds({
          ...variables,
          first: 100,
          chainIds,
        }),
      ]);

      return rounds.filter(
        (round) =>
          !spamRounds[round.chainId]?.[round.id.toLowerCase()] &&
          round.strategyName !== ""
      );
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
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

const OVERRIDE_PRIVATE_ROUND_IDS = [
  /* Zuzalu Q1 Round */
  "0xf89aad3fad6c3e79ffa3ccc835620fcc7e55f919",
];

export const filterOutPrivateRounds = (rounds: RoundGetRound[]) => {
  return rounds.filter(
    (round) =>
      round.roundMetadata.roundType !== "private" ||
      OVERRIDE_PRIVATE_ROUND_IDS.includes(round.id.toLowerCase())
  );
};

type SpamRoundsMaps = {
  [chainId: number]: {
    [roundId: string]: boolean;
  };
};

// Temporary round curation to avoid spam
export async function fetchSpamRounds(): Promise<SpamRoundsMaps> {
  try {
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
          /https:\/\/(explorer|explorer-v1)\.gitcoin\.co\/#\/round\/(\d+)\/([0-9a-fA-Fx]+)/;
        const match = url.match(regex);
        if (match) {
          const chainId = parseInt(match[2]);
          const roundId = match[3].toLowerCase();
          spam[chainId] ||= {};
          spam[chainId][roundId] = true;
        }
      });

    return spam;
  } catch (e) {
    return {};
  }
}
