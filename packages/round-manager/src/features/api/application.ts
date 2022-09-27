import { fetchFromIPFS, graphql_fetch } from "./utils";
import {
  GrantApplication,
  GrantApplicationId,
  MetadataPointer,
  Project,
  ProjectStatus,
  Web3Instance,
} from "./types";
import { projectRegistryContract } from "./contracts";
import { Contract } from "ethers";

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
