import { fetchFromIPFS, graphql_fetch } from "./utils";
import { Program } from "./types";
import { Web3Provider } from "@ethersproject/providers";

// TODO consider always returning an array and also error state, so return type is consistent
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
