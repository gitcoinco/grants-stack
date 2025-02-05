import { RoundApplicationMetadata, RoundApplicationQuestion } from "data-layer";
import { ethers } from "ethers";

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
      (q: any): RoundApplicationQuestion => ({
        id: q.id,
        type: q.question === "Email Address" ? "email" : q.type,
        title: q.question,
        required: q.required,
        encrypted: q.encrypted,
        hidden: false,
      })
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

  metadata.applicationSchema.questions =
    metadata.applicationSchema.questions.map(
      (q: any): RoundApplicationQuestion => ({
        id: q.id,
        type: q.question === "Email Address" ? "email" : q.type,
        title: q.title || q.question,
        options: q.options || q.choices,
        required: q.required,
        encrypted: q.encrypted,
        hidden: q.hidden,
      })
    );

  const maxId = Math.max(
    0,
    ...metadata.applicationSchema.questions.map((q) => q.id)
  );

  metadata.applicationSchema.questions = [
    {
      id: maxId + 1,
      type: "project",
    },
    {
      id: maxId + 2,
      type: "recipient",
    },
    ...metadata.applicationSchema.questions,
  ];

  return metadata;
};
