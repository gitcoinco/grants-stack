import { fetchFromIPFS, graphql_fetch } from "./utils";
import {
  GrantApplication,
  GrantApplicationId,
  MetadataPointer,
  Project,
  ProjectStatus,
} from "./types";
import { updateApplicationStatusFromContract } from "./services/grantApplication";
import { projectRegistryContract } from "./contracts";
import { Contract } from "ethers";

export const getApplicationById = async (
  id: string,
  signerOrProvider: any
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
  } catch (e) {
    console.error("error", e);
    throw e;
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

        let status = project.status;

        if (id) {
          status = await checkGrantApplicationStatus(
            project.id,
            project.round.projectsMetaPtr
          );
        }

        const projectRegistryId = metadata.project.id;
        const projectOwners = await projectRegistry.getProjectOwners(
          projectRegistryId
        );
        const grantApplicationProjectMetadata: Project = {
          ...metadata.project,
          owners: projectOwners.map((address: string) => ({ address })),
        };

        return {
          ...metadata,
          status,
          id: project.id,
          project: grantApplicationProjectMetadata,
          projectsMetaPtr: project.round.projectsMetaPtr,
        } as GrantApplication;
      }
    )
  );
