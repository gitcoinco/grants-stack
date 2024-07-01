import { Program } from "./types";
import { datadogLogs } from "@datadog/browser-logs";
import { DataLayer } from "data-layer";
import { getAlloVersion } from "common/src/config";
import { getChainById, stringToBlobUrl } from "common";
import { allChains } from "../../app/wagmi";

/**
 * Fetch a list of programs
 * @param address - a valid program operator
 * @param signerOrProvider - provider
 *
 */
export async function listPrograms(
  address: string,
  chainId: number, // TODO: verify if this is needed
  dataLayer: DataLayer
): Promise<Program[]> {
  try {
    // fetch chain id
    const chainIds = allChains.map(chain => chain.id);

    // fetch programs from indexer

    const programsRes = await dataLayer.getProgramsByUser({
      address,
      chainIds,
      tags: getAlloVersion() === "allo-v1" ? ["allo-v1"] : [],
    });

    if (!programsRes) {
      throw Error("Unable to fetch programs");
    }

    const programs: Program[] = [];

    for (const program of programsRes.programs) {
      const chain = getChainById(program.chainId);
      programs.push({
        id: program.id,
        metadata: program.metadata,
        operatorWallets: program.roles.map(
          (role: { address: string }) => role.address
        ),
        tags: program.tags,
        chain: {
          id: program.chainId,
          name: chain.prettyName,
          logo: stringToBlobUrl(chain.icon),
        },
        createdByAddress: program.createdByAddress,
        roles: program.roles,
        qfRoundsCount: program.qfRounds?.length || 0,
        dgRoundsCount: program.dgRounds?.length || 0,
      });
    }
    return programs;
  } catch (error) {
    datadogLogs.logger.error(`error: listPrograms - ${error}`);
    console.error("listPrograms", error);
    throw Error("Unable to fetch programs");
  }
}

// TODO(shavinac) change params to expect chainId instead of signerOrProvider
export async function getProgramById(
  programId: string,
  chainId: number,
  dataLayer: DataLayer
): Promise<Program | null> {
  // fetch program from indexer
  const { program: program } = await dataLayer.getProgramById({
    programId,
    chainId,
  });

  // no program found
  if (program === null) {
    return null;
  }

  const chain = getChainById(chainId);

  return {
    id: program.id,
    metadata: program.metadata,
    operatorWallets: program.roles.map(
      (role: { address: string }) => role.address
    ),
    tags: program.tags,
    chain: {
      id: chainId,
      name: chain.prettyName,
      logo: stringToBlobUrl(chain.icon),
    },
    roles: program.roles,
  };
}
