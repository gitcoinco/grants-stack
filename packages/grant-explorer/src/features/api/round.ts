import { fetchFromIPFS, graphql_fetch } from "./utils";
import { Round } from "./types";


export async function getRoundById(
  roundId: string,
  chainId: any
): Promise<Round> {
  try {
    // get the subgraph for round by $roundId
    const res = await graphql_fetch(
      `
        query GetRoundById($roundId: String) {
          rounds(where: {
            id: $roundId
          }) {
            id
            program {
              id
            }
            roundMetaPtr {
              protocol
              pointer
            }
            applicationMetaPtr {
              protocol
              pointer
            }
            applicationsStartTime
            applicationsEndTime
            roundStartTime
            roundEndTime
          }
        }
      `,
      chainId,
      { roundId }
    );

    const round = res.data.rounds[0];

    const roundMetadata = await fetchFromIPFS(round.roundMetaPtr.pointer);

    return {
      id: roundId,
      roundMetadata,
      applicationsStartTime: new Date(
        round.applicationsStartTime * 1000
      ),
      applicationsEndTime: new Date(round.applicationsEndTime * 1000),
      roundStartTime: new Date(round.roundStartTime * 1000),
      roundEndTime: new Date(round.roundEndTime * 1000),
      token: round.token,
      votingStrategy: round.votingStrategy,
      ownedBy: round.program.id,
    };
  } catch (err) {
    console.log("error", err);
    throw Error("Unable to fetch round");
  }
}