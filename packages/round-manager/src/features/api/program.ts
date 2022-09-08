import { fetchFromIPFS, graphql_fetch } from "./utils";
import { Program } from "./types";
import { Web3Provider } from "@ethersproject/providers";

/**
 * Fetch a list of programs
 * @param address - a valid program operator
 * @param signerOrProvider - signer
 *
 */
export async function listPrograms(
  address: string,
  signerOrProvider: Web3Provider
): Promise<Program[]> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // get the subgraph for all programs owned by the given address
    const res = await graphql_fetch(
      `
              query GetPrograms($address: String!) {
                programs(where: {
                  accounts_: {
                    address: $address
                  }
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  roles(where: {
                    role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
                  }) {
                    accounts {
                      address
                    }
                  }
                }
              }
            `,
      chainId,
      { address: address.toLowerCase() }
    );

    const programs: Program[] = [];

    for (const program of res.data.programs) {
      const metadata = await fetchFromIPFS(program.metaPtr.pointer);

      programs.push({
        id: program.id,
        metadata,
        operatorWallets: program.roles[0].accounts.map(
          (account: { address: string }) => account.address
        ),
      });
    }

    return programs;
  } catch (err) {
    console.log("error", err);
    throw Error("Unable to fetch programs");
  }
}

// TODO(shavinac) change params to expect chainId instead of signerOrProvider
export async function getProgramById(programId: string, signerOrProvider: any): Promise<Program> {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork()

    // get the subgraph for program by $programId
    const res = await graphql_fetch(
      `
              query GetPrograms($programId: String) {
                programs(where: {
                  id: $programId
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  roles(where: {
                    role: "0xaa630204f2780b6f080cc77cc0e9c0a5c21e92eb0c6771e709255dd27d6de132"
                  }) {
                    accounts {
                      address
                    }
                  }
                }
              }
            `,
      chainId,
      {programId}
    )

    const programDataFromGraph = res.data.programs[0]
    const metadata = await fetchFromIPFS(programDataFromGraph.metaPtr.pointer)

    return {
      id: programDataFromGraph.id,
      metadata,
      operatorWallets: programDataFromGraph.roles[0].accounts.map((program: any) => program.address)
    }

  } catch (err) {
    console.log("error", err)
    throw Error("Unable to fetch program")
  }
}