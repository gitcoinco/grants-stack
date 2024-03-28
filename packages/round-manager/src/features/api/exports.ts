import { stringify as stringifyCsv } from "csv-stringify";
import { Lit } from "./lit";
import { Application } from "allo-indexer-client";

type ApplicationWithMetadata = Application & {
  metadata?: {
    signature: string;
    application: {
      project: {
        title: string;
        website: string;
        projectTwitter: string;
        projectGithub: string;
        userGithub: string;
      };
      recipient: string;
      answers: {
        question: string;
        answer?: string;
        encryptedAnswer?: {
          ciphertext: string;
          encryptedSymmetricKey: string;
        };
      }[];
    };
  };
};

export async function roundApplicationsToCSV(
  roundId: string,
  chainId: number,
  litContract: string,
  approvedOnly?: boolean
) {
  const remoteUrl = `${process.env.REACT_APP_ALLO_API_URL}/data/${chainId}/rounds/${roundId}/applications.json`;

  // Fetch the CSV data
  const response = await fetch(remoteUrl);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch applications from ${remoteUrl}`);
  }

  let applications: ApplicationWithMetadata[] = await response.json();

  if (approvedOnly) {
    applications = applications.filter(
      (application) => application.status === "APPROVED"
    );
  }

  const lit = new Lit({
    chainId: chainId,
    contract: litContract,
  });

  const decryptedData: Record<string, string>[] = [];

  for (const application of applications) {
    const answers =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      application.metadata?.application.answers.flatMap((answer: any) => {
        if (answer.answer) {
          return [[answer.question, answer.answer]];
        } else if (answer.encryptedAnswer) {
          const encryptedValue: {
            ciphertext: string;
            encryptedSymmetricKey: string;
          } = answer.encryptedAnswer;

          const blob = new Blob([
            Uint8Array.from(
              window
                .atob(encryptedValue.ciphertext)
                .split("")
                .map((x) => x.charCodeAt(0))
            ),
          ]);

          return [
            [
              answer.question,
              lit.decryptString(blob, encryptedValue.encryptedSymmetricKey),
            ],
          ];
        } else {
          return [];
        }
      }) ?? [];

    // await for async field decryption
    for (const answer of answers) {
      answer[1] = await answer[1];
    }

    decryptedData.push({
      id: application.id,
      projectId: application.projectId,
      status: application.status,
      title: application.metadata?.application?.project?.title,
      payoutAddress: application.metadata?.application?.recipient,
      signature: application.metadata?.signature,
      website: application.metadata?.application?.project?.website,
      projectTwitter:
        application.metadata?.application?.project?.projectTwitter,
      projectGithub: application.metadata?.application?.project?.projectGithub,
      userGithub: application.metadata?.application?.project?.userGithub,
      ...Object.fromEntries(answers),
    });
  }

  const csv = (await new Promise((resolve, reject) => {
    stringifyCsv(decryptedData, { header: true }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })) as string;

  return csv;
}
