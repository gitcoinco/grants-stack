import { ethers } from "ethers";
import { api } from "..";
import { roundImplementationContract } from "../contracts";
import { GrantApplication, MetadataPointer } from "../types";
import {
  checkGrantApplicationStatus,
  fetchFromIPFS,
  graphql_fetch,
  pinToIPFS,
} from "../utils";

const updateApplicationList = (
  applications: GrantApplication[],
  roundId: string,
  provider: any
): Promise<string> => {
  /* ESLint ignore is fine since we handle the throws*/
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      let reviewedApplications: any = [];
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

      const applicationListPointer =
        res.data.rounds[0].projectsMetaPtr?.pointer;

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

      resolve(resp.IpfsHash);
    } catch (err) {
      console.log("error", err);
      reject("Unable to update grant application");
    }
  });
};

/**
 * Fetches project applications status from metaptr and updates result
 * Note: This function is a short term fix until the indexing IPFS content
 * via the graph is deterministic
 *
 * @param applications
 * @param projectsMetaPtr
 * @param filterByStatus
 *
 * @dev Once indexing IPFS content via graph is deterministic.
 *  - redeploy subgraph
 *  - remove updateApplicationStatusFromContract
 *  - remove commented out status filter in GetGrantApplications query
 */
const updateApplicationStatusFromContract = async (
  applications: GrantApplication[],
  projectsMetaPtr: MetadataPointer,
  filterByStatus?: string
) => {
  // Handle scenario where operator hasn't review any projects in the round
  if (!projectsMetaPtr)
    return filterByStatus
      ? applications.filter(
          (application) => application.status === filterByStatus
        )
      : applications;

  const applicationsFromContract = await fetchFromIPFS(projectsMetaPtr.pointer);

  // Iterate over all applications indexed by graph
  applications.map((application) => {
    try {
      // fetch matching application index from contract
      const index = applicationsFromContract.findIndex(
        (applicationFromContract: any) =>
          application.id === applicationFromContract.id
      );
      // update status of application from contract / default to pending
      application.status =
        index >= 0 ? applicationsFromContract[index].status : "PENDING";
    } catch {
      application.status = "PENDING";
    }
    return application;
  });

  if (filterByStatus) {
    return applications.filter(
      (application) => application.status === filterByStatus
    );
  }

  return applications;
};

/**
 * Contract interactions API for a Grant Application
 */
export const grantApplicationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listGrantApplications: builder.query<
      GrantApplication[],
      {
        roundId: string;
        signerOrProvider: any;
        id?: string;
        status?: "PENDING" | "APPROVED" | "REJECTED";
      }
    >({
      queryFn: async ({ roundId, signerOrProvider, id, status }) => {
        try {
          // fetch chain id
          const { chainId } = await signerOrProvider.getNetwork();

          // query the subgraph for all rounds by the given account in the given program
          const res = await graphql_fetch(
            `
              query GetGrantApplications($roundId: String!, $id: String, $status: String) {
                roundProjects(where: {
                  round: $roundId
            ` +
              // TODO : uncomment when indexing IPFS via graph
              // (status ? `status: $status` : ``)
              // +
              (id ? `id: $id` : ``) +
              `
                }) {
                  id
                  metaPtr {
                    protocol
                    pointer
                  }
                  status
                  round {
                    projectsMetaPtr {
                      protocol
                      pointer
                    }
                  }
                }
              }
            `,
            chainId,
            { roundId, id, status }
          );

          const grantApplications: GrantApplication[] = [];

          for (const project of res.data.roundProjects) {
            const metadata = await fetchFromIPFS(project.metaPtr.pointer);

            let status = project.status;

            if (id) {
              status = await checkGrantApplicationStatus(
                project.id,
                project.round.projectsMetaPtr
              );
            }

            grantApplications.push({
              ...metadata,
              status,
              id: project.id,
              projectsMetaPtr: project.round.projectsMetaPtr,
            });
          }

          const grantApplicationsFromContract =
            res.data.roundProjects.length > 0
              ? await updateApplicationStatusFromContract(
                  grantApplications,
                  res.data.roundProjects[0].round.projectsMetaPtr,
                  status
                )
              : grantApplications;

          return { data: grantApplicationsFromContract };
        } catch (err) {
          console.log("error", err);
          return { error: "Unable to fetch grant applications" };
        }
      },
      providesTags: ["GrantApplication"],
    }),
    updateGrantApplication: builder.mutation<
      string,
      {
        roundId: string;
        application: GrantApplication;
        signer: any;
        provider: any;
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
        } catch (err: any) {
          return { error: err.message };
        }
      },
      invalidatesTags: ["GrantApplication", "Round"],
    }),
    bulkUpdateGrantApplications: builder.mutation<
      string,
      {
        roundId: string;
        applications: GrantApplication[];
        signer: any;
        provider: any;
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
  useListGrantApplicationsQuery,
  useUpdateGrantApplicationMutation,
  useBulkUpdateGrantApplicationsMutation,
} = grantApplicationApi;
