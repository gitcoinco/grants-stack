import { stringify as stringifyCsv } from "csv-stringify";
import { Lit } from "./lit";

export async function roundApplicationsToCSV(
  roundId: string,
  chainId: number,
  chainName: string
) {
  const remoteUrl = `${process.env.REACT_APP_ALLO_API_URL}/data/${chainId}/rounds/${roundId}/applications.json`;

  // Fetch the CSV data
  const response = await fetch(remoteUrl);

  if (response.status !== 200) {
    throw new Error(`Failed to fetch applications from ${remoteUrl}`);
  }

  const applications = await response.json();

  const lit = new Lit({
    chain: chainName.toLowerCase(),
    contract: roundId,
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
