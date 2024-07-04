import { BigNumber, ethers } from "ethers";
import {
  ApplicationMetadata,
  GrantApplication,
  InputType,
  IPFSObject,
  RevisedMatch,
} from "./types";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { getChainById } from "common";
import { ProjectApplicationForManager } from "data-layer";

export type SupportType = {
  name: string;
  regex: string;
  default: boolean;
};

/**
 * Fetch data from IPFS
 * TODO: include support for fetching abitrary data e.g images
 *
 * @param cid - the unique content identifier that points to the data
 */
export const fetchFromIPFS = (cid: string) => {
  return fetch(`${process.env.REACT_APP_IPFS_BASE_URL}/ipfs/${cid}`).then(
    (resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    }
  );
};

/**
 * Pin data to IPFS
 * The data could either be a file or a JSON object
 *
 * @param obj - the data to be pinned on IPFS
 * @returns the unique content identifier that points to the data
 */
export const pinToIPFS = (obj: IPFSObject): Promise<{ IpfsHash: string }> => {
  const params = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
    },
    body: {
      pinataMetadata: obj.metadata,
      pinataOptions: {
        cidVersion: 1,
      },
    },
  };

  /* typeof Blob === 'object', so we need to check against instanceof */
  if (obj.content instanceof Blob) {
    // content is a blob
    const fd = new FormData();
    fd.append("file", obj.content as Blob);
    fd.append("pinataOptions", JSON.stringify(params.body.pinataOptions));
    fd.append("pinataMetadata", JSON.stringify(params.body.pinataMetadata));

    return fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      ...params,
      body: fd,
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  } else {
    // content is a JSON object
    return fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...params.body, pinataContent: obj.content }),
    }).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }

      return Promise.reject(resp);
    });
  }
};

export const abbreviateAddress = (address: string) =>
  `${address.slice(0, 8)}...${address.slice(-4)}`;

export interface SchemaQuestion {
  id: number;
  title: string;
  type: InputType;
  required: boolean;
  hidden: boolean;
  choices?: string[];
  encrypted: boolean;
  fixed?: boolean;
  metadataExcluded?: boolean;
}

export interface ProjectRequirementsSchema {
  twitter: {
    required: boolean;
    verification: boolean;
  };
  github: {
    required: boolean;
    verification: boolean;
  };
}

export interface ApplicationSchema {
  questions: Array<SchemaQuestion>;
  requirements: ProjectRequirementsSchema;
}

/**
 * This function generates the round application schema to be stored in a decentralized storage
 *
 * @param questions - The metadata of a round application
 * @param requirements
 * @returns The application schema
 */
export const generateApplicationSchema = (
  questions: ApplicationMetadata["questions"],
  requirements: ApplicationMetadata["requirements"]
): ApplicationSchema => {
  const schema = { questions: new Array<SchemaQuestion>(), requirements };
  if (!questions) return schema;

  schema.questions = questions
    .filter((q) => !q.metadataExcluded)
    .map((question, index) => {
      return {
        id: index,
        title: question.title,
        type: question.type,
        required: question.required,
        info: "",
        choices: question.choices,
        hidden: question.hidden,
        encrypted: question.encrypted,
      };
    });

  return schema;
};

export function typeToText(s: string) {
  if (s == "address") return "Wallet address";
  if (s == "checkbox") return "Checkboxes";
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace("-", " ");
}

/**
 * Fetch link to contract on Etherscan or other explorer
 *
 * @param chainId - The chain ID of the blockchain
 * @param contractAddress - The address of the contract
 * @returns The link to the contract on Etherscan or other
 * explorer for the given chain ID and contract address
 */
export const getTxExplorerForContract = (
  chainId: number,
  contractAddress: string
) => {
  return getChainById(chainId).blockExplorer + "address/" + contractAddress;
};

export const formatCurrency = (
  value: BigNumber,
  decimal: number,
  fraction?: number
) => {
  return parseFloat(
    ethers.utils.formatUnits(value.toString(), decimal)
  ).toLocaleString("en-US", {
    maximumFractionDigits: fraction || 3,
  });
};

export const useMatchCSVParser = (file: File | null) => {
  const [data, setData] = useState<RevisedMatch[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setData(undefined);
      setError(undefined);
      return;
    }

    const parseCSV = (file: File) => {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const matches: RevisedMatch[] = results.data.map((row: any) => ({
              revisedContributionCount: parseInt(row["contributionsCount"]),
              revisedMatch: BigInt(row["matched"]),
              matched: BigInt(row["matched"]),
              contributionsCount: parseInt(row["contributionsCount"]),
              projectId: row["projectId"],
              applicationId: row["applicationId"],
              projectName: row["projectName"],
              payoutAddress: row["payoutAddress"],
            }));
            setData(matches);
            setLoading(false);
          },
          error: (error: Error) => {
            setError(error);
            setLoading(false);
          },
        });
      };
      reader.onerror = (error: Event) => {
        setError(error as unknown as Error);
        setLoading(false);
      };
      reader.readAsText(file);
    };

    parseCSV(file);
  }, [file]);

  return { data, loading, error };
};

export const convertApplications = (
  dataLayerApplications: ProjectApplicationForManager[]
) => {
  const applications: GrantApplication[] = dataLayerApplications.flatMap(
    (application) => {
      if (application.canonicalProject === null) {
        console.error(
          `Canonical project not found for application ${application.id}`
        );
        return [];
      }

      return [
        {
          id: application.id,
          applicationIndex: Number(application.id),
          round: application.roundId,
          status: application.status,
          metadata: application.metadata,
          project: {
            ...application.metadata.application.project,
            owners: application.canonicalProject.roles,
            id: application.projectId,
          },
          projectId: application.projectId,
          inReview: application.status === "IN_REVIEW",
          recipient: application.metadata.application.recipient,
          createdAt: "0",
          projectsMetaPtr: { protocol: 1, pointer: "" },
          payoutStrategy: {
            strategyName: application.round.strategyName,
            id: application.round.strategyAddress,
            payouts: [],
          },
          distributionTransaction: application.distributionTransaction,
          statusSnapshots: application.statusSnapshots.map((snapshot) => ({
            ...snapshot,
            updatedAt: new Date(snapshot.updatedAt),
          })),
          anchorAddress: application.anchorAddress,
          answers: application.metadata.application.answers,
        },
      ];
    }
  );

  return applications;
};