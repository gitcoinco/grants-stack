import { ethers } from "ethers";
import { api } from "..";
import { roundImplementationContract } from "../contracts";
import { GrantApplication } from "../types";
import { fetchFromIPFS, graphql_fetch, pinToIPFS } from "../utils";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";

const updateApplicationList = async (
  applications: GrantApplication[],
  roundId: string,
  provider: Web3Provider
): Promise<string> => {
  try {
    let reviewedApplications: any[] = [];
    let foundEntry = false;

    // fetch latest ipfs pointer to the list of application for the round

    const { chainId } = await provider.getNetwork(); // fetch chain id

    const res = await graphql_fetch(
      `
          query GetApplicationListPointer($roundId: String!) {
            rounds(first: 1, where: {
              id: $roundId
            }) {
              projectsMetaPtr {
                pointer
              }
            }
          }
        `,
      chainId,
      { roundId }
    );

    const applicationListPointer = res.data.rounds[0].projectsMetaPtr?.pointer;

    // read data from ipfs
    if (applicationListPointer) {
      reviewedApplications = await fetchFromIPFS(applicationListPointer);
    }

    for (const application of applications) {
      // if grant application is already reviewed overwrite the entry
      foundEntry = reviewedApplications.find((o: any, i: any) => {
        if (o.id === application.id) {
          reviewedApplications[i] = {
            id: application.id,
            status: application.status,
            payoutAddress: application.recipient,
          };
          return true; // stop searching
        }
        return false;
      });

      // create a new reviewed application entry
      if (!foundEntry || !applicationListPointer) {
        reviewedApplications.push({
          id: application.id,
          status: application.status,
          payoutAddress: application.recipient,
        });
      }
    }

    // pin new list IPFS
    const resp = await pinToIPFS({
      content: reviewedApplications,
      metadata: {
        name: "reviewed-applications",
      },
    });
    console.log("✅  Saved data to IPFS:", resp.IpfsHash);

    return resp.IpfsHash;
  } catch (err) {
    console.log("error", err);
    throw "Unable to update grant application";
  }
};

/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    updateGrantApplication: builder.mutation<
      string,
      {
        roundId: string;
        application: GrantApplication;
        signer: Signer;
        provider: Web3Provider;
      }
    >({
      queryFn: async ({ roundId, application, signer, provider }) => {
        try {
          const ipfsHash = await updateApplicationList(
            [application],
            roundId,
            provider
          );

          const roundImplementation = new ethers.Contract(
            roundId,
            roundImplementationContract.abi,
            signer
          );

          const tx = await roundImplementation.updateProjectsMetaPtr({
            protocol: 1,
            pointer: ipfsHash,
          });

          await tx.wait(); // wait for transaction receipt

          console.log("✅ Transaction hash: ", tx.hash);

          return { data: tx.hash };
        } catch (err: unknown) {
          return { error: (err as Error).message };
        }
      },
      invalidatesTags: ["GrantApplication", "Round"],
    }),
    bulkUpdateGrantApplications: builder.mutation<
      string,
      {
        roundId: string;
        applications: GrantApplication[];
        signer: Signer;
        provider: Web3Provider;
      }
    >({
      queryFn: async ({ roundId, applications, signer, provider }) => {
        try {
          const ipfsHash = await updateApplicationList(
            applications,
            roundId,
            provider
          );

          // update projects meta pointer in round implementation contract
          const roundImplementation = new ethers.Contract(
            roundId,
            roundImplementationContract.abi,
            signer
          );

          const tx = await roundImplementation.updateProjectsMetaPtr({
            protocol: 1,
            pointer: ipfsHash,
          });

          await tx.wait(); // wait for transaction receipt

          console.log("✅ Transaction hash: ", tx.hash);

          return { data: tx.hash };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to update the grant applications" };
        }
      },
      invalidatesTags: ["GrantApplication", "Round"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateGrantApplicationMutation,
  useBulkUpdateGrantApplicationsMutation,
} = grantApplicationApi;
