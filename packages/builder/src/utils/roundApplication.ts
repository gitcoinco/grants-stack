import { ethers } from "ethers";
import { RoundApplicationMetadata } from "../types/roundApplication";

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

const projectQuestion = {
  question: "Select a project you would like to apply for funding:",
  type: "PROJECT", // this will be a limited set [TEXT, TEXTAREA, RADIO, MULTIPLE]
  required: true,
};

const recipientAddressQuestion = {
  question: "Recipient Address",
  type: "RECIPIENT",
  required: true,
  info: "Address that will receive funds",
};

export const buildRoundApplicationMetadata = (
  object: any
): RoundApplicationMetadata => {
  const metadata: RoundApplicationMetadata = {
    version: object.version,
    lastUpdatedOn: object.lastUpdatedOn,
    applicationSchema: object.applciationSchema,
  };

  // Build metadata from first version, which doesnt't have a version defined
  if (object.version === undefined) {
    let { applicationSchema } = object;

    if (applicationSchema) {
      applicationSchema = object.application_schema;
    }

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

  const recipientQuestionId = metadata.applicationSchema.questions.length;

  metadata.applicationSchema.questions.unshift({
    ...recipientAddressQuestion,
    id: recipientQuestionId,
  });
  metadata.recipientQuestionId = recipientQuestionId;

  const projectQuestionId = metadata.applicationSchema.questions.length;

  metadata.applicationSchema.questions.unshift({
    ...projectQuestion,
    id: projectQuestionId,
  });

  metadata.projectQuestionId = projectQuestionId;

  return metadata;
};
