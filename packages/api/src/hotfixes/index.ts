import { QFContribution } from "../types";
import { addMissingUNICEFContributions } from  "./unicefMissingContributions";

export const hotfixForRounds = async (roundId: string, contributions: QFContribution[]): Promise<QFContribution[]> => {
  // Unicef contributions sent to optimism (wrong network)
  if (roundId == "0xdf75054cd67217aee44b4f9e4ebc651c00330938") {
    contributions = await addMissingUNICEFContributions(contributions);
  }

  return contributions;
}