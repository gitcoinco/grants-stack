import { fetchFromIPFS, PayoutToken, pinToIPFS } from "./utils";
import {
  AppStatus,
  GrantApplication,
  GrantApplicationId,
  MetadataPointer,
  Project,
  ProjectStatus,
} from "./types";
import { projectRegistryContract } from "./contracts";
import { graphql_fetch } from "common";
import {
  getAddress,
  getContract,
  Hex,
  PublicClient,
  TransactionReceipt,
  zeroAddress,
} from "viem";
import { erc20ABI, WalletClient } from "wagmi";
import { publicClient } from "../../app/wagmi";
import RoundImplementationABI from "./abi/RoundImplementationABI";

type RoundApplication = {
  id: string;
  metaPtr: {
    protocol: number;
    pointer: string;
  };
  status: string;
  round: {
    projectsMetaPtr: {
      protocol: number;
      pointer: string;
    };
  };
  createdAt: number;
};

type Res = {
  data: {
    roundApplications: RoundApplication[];
  };
};

export const getApplicationById = async (
  id: string,
  publicClient: PublicClient
): Promise<GrantApplication> => {
  try {
    const chainId = await publicClient.getChainId();

    const res: Res = await graphql_fetch(
      `
        query GetGrantApplications($id: String) {
          roundApplications(where: {
            id: $id
          }) {
            id
            metaPtr {
              protocol
              pointer
            }
            status
            applicationIndex
            createdAt
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

    const grantApplicationExists = res.data.roundApplications.length > 0;
    if (!grantApplicationExists) {
      throw new Error("Grant Application doesn't exist");
    }

    const grantApplications = await fetchApplicationData(
      res,
      id,
      chainId,
      publicClient
    );

    const grantApplicationsFromContract =
      await updateApplicationStatusFromContract(
        grantApplications,
        res.data.roundApplications[0].round.projectsMetaPtr
      );

    return grantApplicationsFromContract[0];
  } catch (error) {
    console.error("getApplicationById", error);
    throw error;
  }
};

function convertStatus(status: number) {
  switch (status) {
    case 0:
      return "PENDING";
    case 1:
      return "APPROVED";
    case 2:
      return "REJECTED";
    case 3:
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

export const getApplicationsByRoundId = async (
  roundId: string,
  publicClient: PublicClient
): Promise<GrantApplication[]> => {
  try {
    const chainId = await publicClient.getChainId();

    // query the subgraph for all rounds by the given account in the given program
    const res = await graphql_fetch(
      `
        query GetApplicationsByRoundId($roundId: String!, $status: String) {
          roundApplications(where: {
            round: $roundId
      ` +
        // TODO : uncomment when indexing IPFS via graph
        // (status ? `status: $status` : ``)
        // +
        `
          }
          first: 1000) {
            id
            metaPtr {
              protocol
              pointer
            }
            applicationIndex
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

    for (const project of res.data.roundApplications) {
      const metadata = await fetchFromIPFS(project.metaPtr.pointer);

      const projectStatus = convertStatus(project.status);

      // const signature = metadata?.signature;
      const application = metadata.application
        ? metadata.application
        : metadata;

      grantApplications.push({
        ...application,
        status: projectStatus,
        applicationIndex: project.applicationIndex,
        id: project.id,
        projectsMetaPtr: project.round.projectsMetaPtr,
      });
    }

    return res.data.roundApplications.length > 0
      ? await updateApplicationStatusFromContract(
          grantApplications,
          res.data.roundApplications[0].round.projectsMetaPtr
        )
      : grantApplications;
  } catch (error) {
    console.error("getApplicationsByRoundId", error);
    throw error;
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
  let reviewedApplications: GrantApplication[] = [];

  if (projectsMetaPtr) {
    reviewedApplications = await fetchFromIPFS(projectsMetaPtr.pointer);
  }

  const obj = reviewedApplications.find((o) => o.id === id);

  return obj ? (obj.status as ProjectStatus) : "PENDING";
};

const fetchApplicationData = async (
  res: Res,
  id: string,
  chainId: number,
  publicClient: PublicClient
): Promise<GrantApplication[]> =>
  Promise.all(
    res.data.roundApplications.map(
      async (project): Promise<GrantApplication> => {
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
        const fixedId = projectRegistryId.includes(":")
          ? projectRegistryId.split(":")[2]
          : projectRegistryId;

        const _projectRegistryContract = projectRegistryContract(chainId);
        const projectRegistry = getContract({
          address: _projectRegistryContract.address as Hex,
          abi: _projectRegistryContract.abi,
          publicClient,
        });

        const projectOwners = await projectRegistry.read.getProjectOwners(
          fixedId
        );
        const grantApplicationProjectMetadata: Project = {
          ...projectMetadata,
          owners: (projectOwners as string[]).map((address: string) => ({
            address,
          })),
        };

        return {
          ...application,
          status,
          id: project.id,
          project: grantApplicationProjectMetadata,
          projectsMetaPtr: project.round.projectsMetaPtr,
          createdAt: project.createdAt,
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
  // Handle scenario where operator hasn't reviewed any projects in the round
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
        (applicationFromContract: GrantApplication) =>
          application.id === applicationFromContract.id
      );
      // update status of application from contract / default to pending
      application.status =
        index >= 0 ? applicationsFromContract[index].status : 0;
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

export const updateApplicationStatuses = async (
  roundId: string,
  walletClient: WalletClient,
  statuses: AppStatus[]
): Promise<{ transactionBlockNumber: bigint }> => {
  const roundImplementation = getContract({
    address: roundId as Hex,
    abi: RoundImplementationABI,
    walletClient,
  });
  console.log("Updating application statuses...", statuses);

  const tx = await roundImplementation.write.setApplicationStatuses([
    statuses.map((status) => ({
      index: BigInt(status.index),
      statusRow: BigInt(status.statusRow),
    })),
  ]);
  console.log("✅ Transaction hash: ", tx);

  return {
    transactionBlockNumber: BigInt(0),
  };
};

// TODO - should add tests for this too
export const updateApplicationList = async (
  applications: GrantApplication[],
  roundId: string,
  chainId: number
): Promise<string> => {
  let reviewedApplications = [];
  let foundEntry = false;

  const res: {
    data: {
      rounds: {
        projectsMetaPtr: {
          pointer: string;
        };
      }[];
    };
  } = await graphql_fetch(
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
    foundEntry = reviewedApplications.find((o: GrantApplication, i: number) => {
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

export const fundRoundContract = async (
  roundId: string,
  walletClient: WalletClient,
  payoutToken: PayoutToken,
  amount: bigint
): Promise<{ txBlockNumber: bigint; txHash: string }> => {
  let receipt: TransactionReceipt;
  let txHash: Hex;
  roundId = getAddress(roundId);

  if (payoutToken.address === (zeroAddress as Hex)) {
    const txObj = {
      to: roundId as Hex,
      value: amount,
    };

    txHash = await walletClient.sendTransaction(txObj);
    receipt = await publicClient({}).waitForTransactionReceipt({
      hash: txHash,
    });
  } else {
    const tokenContract = getContract({
      address: payoutToken.address,
      abi: erc20ABI,
      walletClient,
    });

    txHash = await tokenContract.write.transfer([roundId as Hex, amount]);
    receipt = await publicClient({}).waitForTransactionReceipt({
      hash: txHash,
    });
  }

  return {
    txBlockNumber: receipt.blockNumber,
    txHash,
  };
};

export const approveTokenOnContract = async (
  walletClient: WalletClient,
  roundId: string,
  tokenAddress: string,
  amount: bigint
) => {
  roundId = getAddress(roundId);
  tokenAddress = getAddress(tokenAddress);

  const tokenContract = getContract({
    address: getAddress(tokenAddress),
    abi: erc20ABI,
    walletClient,
  });

  await tokenContract.write.approve([getAddress(roundId), amount]);
};
