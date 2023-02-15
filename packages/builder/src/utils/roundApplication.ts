import { ethers } from "ethers";
import {
  RoundApplicationMetadata,
  RoundApplicationQuestion,
} from "../types/roundApplication";

const generateUniqueRoundApplicationID = (
  projectChainId: number,
  projectNumber: string,
  projectRegistryAddress: string
) =>
  ethers.utils.solidityKeccak256(
    ["uint256", "address", "uint256"],
    [projectChainId, projectRegistryAddress, projectNumber]
  );

export default generateUniqueRoundApplicationID;

export const parseRoundApplicationMetadata = (
  object: any
): RoundApplicationMetadata => {
  const metadata: RoundApplicationMetadata = {
    version: object.version,
    lastUpdatedOn: object.lastUpdatedOn,
    applicationSchema: object.applicationSchema,
  };

  // Build metadata from first version, which doesnt't have a version defined
  if (object.version === undefined) {
    let { applicationSchema } = object;

    if (!applicationSchema) {
      applicationSchema = object.application_schema;
    }

    applicationSchema = applicationSchema.map(
      (q: any): RoundApplicationQuestion => {
        if (q.question === "Email Address") {
          return {
            id: q.id,
            inputType: "email",
            title: q.question,
            required: q.required,
            encrypted: q.encrypted,
            hidden: true,
          };
        }

        return {
          id: q.id,
          inputType: "text",
          title: q.question,
          required: q.required,
          encrypted: q.encrypted,
          hidden: true,
        };
      }
    );

    metadata.applicationSchema = {
      questions: applicationSchema,
      requirements: {
        twitter: {
          required: false,
          verification: false,
        },
        github: {
          required: false,
          verification: false,
        },
      },
    };
  }

  metadata.applicationSchema.questions = [
    { inputType: "project" },
    { inputType: "recipient" },
    ...metadata.applicationSchema.questions,
  ];

  return metadata;
};
