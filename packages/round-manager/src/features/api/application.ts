import { fetchFromIPFS, graphql_fetch, pinToIPFS } from "./utils";
import {
  GrantApplication,
  GrantApplicationId,
  MetadataPointer,
  Project,
  ProjectStatus,
  Web3Instance,
} from "./types";
import {
  projectRegistryContract,
  roundImplementationContract,
} from "./contracts";
import { Contract, ethers } from "ethers";
import { Signer } from "@ethersproject/abstract-signer";

export const getApplicationById = async (
  id: string,
  signerOrProvider: Web3Instance["provider"]
): Promise<GrantApplication> => {
  try {
    const { chainId } = await signerOrProvider.getNetwork();

    const res = await graphql_fetch(
      `
        query GetGrantApplications($id: String) {
          roundProjects(where: {
            id: $id
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
      { id }
    );

    const grantApplicationExists = res.data.roundProjects.length > 0;
    if (!grantApplicationExists) {
      throw new Error("Grant Application doesn't exist");
    }

    const _projectRegistryContract = projectRegistryContract(chainId);
    const projectRegistry = new Contract(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      _projectRegistryContract.address!,
      _projectRegistryContract.abi,
      signerOrProvider
    );

    const grantApplications = await fetchApplicationData(
      res,
      id,
      projectRegistry
    );

    const grantApplicationsFromContract =
      await updateApplicationStatusFromContract(
        grantApplications,
        res.data.roundProjects[0].round.projectsMetaPtr
      );

    return grantApplicationsFromContract[0];
  } catch (err) {
    console.error("error", err);
    throw err;
  }
};

export const getApplicationsByRoundId = async (
  roundId: string,
  signerOrProvider: any
): Promise<GrantApplication[]> => {
  try {
    // fetch chain id
    const { chainId } = await signerOrProvider.getNetwork();

    // query the subgraph for all rounds by the given account in the given program
    const res = await graphql_fetch(
      `
        query GetApplicationsByRoundId($roundId: String!, $status: String) {
          roundProjects(where: {
            round: $roundId
      ` +
        // TODO : uncomment when indexing IPFS via graph
        // (status ? `status: $status` : ``)
        // +
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
      { roundId }
    );

    const grantApplications: GrantApplication[] = [];

    for (const project of res.data.roundProjects) {
      const metadata = await fetchFromIPFS(project.metaPtr.pointer);

      // const signature = metadata?.signature;
      const application = metadata.application
        ? metadata.application
        : metadata;

      grantApplications.push({
        ...application,
        status: project.status,
        id: project.id,
        projectsMetaPtr: project.round.projectsMetaPtr,
      });
    }

    const grantApplicationsFromContract =
      res.data.roundProjects.length > 0
        ? await updateApplicationStatusFromContract(
            grantApplications,
            res.data.roundProjects[0].round.projectsMetaPtr
          )
        : grantApplications;

    return grantApplicationsFromContract;
  } catch (err) {
    console.error("error", err);
    throw err;
  }
};

/**
 * Check status of a grant application
 *
 * @param id - the application id
 * @param projectsMetaPtr - the pointer to a decentralized storage
 */
export const checkGrantApplicationStatus = async (
  id: GrantApplicationId,
  projectsMetaPtr: MetadataPointer
): Promise<ProjectStatus> => {
  let reviewedApplications: any = [];

  if (projectsMetaPtr) {
    reviewedApplications = await fetchFromIPFS(projectsMetaPtr.pointer);
  }

  const obj = reviewedApplications.find((o: any) => o.id === id);

  return obj ? obj.status : "PENDING";
};

const fetchApplicationData = async (
  res: any,
  id: string,
  projectRegistry: Contract
): Promise<GrantApplication[]> =>
  Promise.all(
    res.data.roundProjects.map(
      async (project: any): Promise<GrantApplication> => {
        const metadata = await fetchFromIPFS(project.metaPtr.pointer);

        const application = metadata.application
          ? metadata.application
          : metadata;

        let status = project.status;

        if (id) {
          status = await checkGrantApplicationStatus(
            project.id,
            project.round.projectsMetaPtr
          );
        }

        const projectMetadata = application.project;
        const projectRegistryId = projectMetadata.id;
        const projectOwners = await projectRegistry.getProjectOwners(
          projectRegistryId
        );
        const grantApplicationProjectMetadata: Project = {
          ...projectMetadata,
          owners: projectOwners.map((address: string) => ({ address })),
        };

        return {
          ...application,
          status,
          id: project.id,
          project: grantApplicationProjectMetadata,
          projectsMetaPtr: project.round.projectsMetaPtr,
        } as GrantApplication;
      }
    )
  );

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

export const updateRoundContract = async (
  roundId: string,
  signer: Signer,
  newProjectsMetaPtr: string
): Promise<{ transactionBlockNumber: number }> => {
  const roundImplementation = new ethers.Contract(
    roundId,
    roundImplementationContract.abi,
    signer
  );

  const tx = await roundImplementation.updateProjectsMetaPtr({
    protocol: 1,
    pointer: newProjectsMetaPtr,
  });

  const receipt = await tx.wait();

  console.log("✅ Transaction hash: ", tx.hash);

  const blockNumber = receipt.blockNumber;
  return {
    transactionBlockNumber: blockNumber,
  };
};

// TODO - should add tests for this too
export const updateApplicationList = async (
  applications: GrantApplication[],
  roundId: string,
  chainId: number
): Promise<string> => {
  let reviewedApplications: any[] = [];
  let foundEntry = false;

  // fetch latest ipfs pointer to the list of application for the round
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
};
