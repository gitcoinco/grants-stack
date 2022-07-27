import { RoundApplicationMetadata, Project, RoundApplication } from "../types";

// eslint-disable-next-line
const TEST_PUB_KEY = `{"alg":"RSA-OAEP-256","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"rbdXxZMJb7LCvaH6ZCzkI8VpkdZEMu46-t4-vk8WKtk-pQ02JivvGY93v3TT7K1UQxhjpmSvYuCofp0mXT32rMf83p7zxo6pN2dwxDAXbEvQSHmXPrvmi1xvfl_agAJvMQPKDi2tiHYdRlzAllaBGWSW1rH91ClSM63tTUyBl6d_KOsifkU21_0w4OwIk6OYCb1CJj_mFhbUKKlrz-hAvJiySWVyTrCOiILY5ZzvFZ6dsCKpLDRqQHD7wxg5tLERvRfEEWrA2kBXioRN4YJUAGSS1UPnDAGlukVFL--G2-BNbhENwFgc3J5sR4ZYFbSA4SeY1FjkMbhRqJpbc_Z2nP18bb-tngm7E08908ubq7jaPPj_7FP_1JJ6qXzOmbfAST04uVnRLURdf0yV0KYaovIDVBF8jKNm9yVvXqlz4AlNK5kHCsWuGvNMW6O886CIOWo1pjpXO2itnSlnkjUdlxtUf2GmwPVUfCwAfnIdynkyrgU8Zk5OkVqCy9QQuiPvyg1leMIB2iFxhzF8AM2migr1F-vP5l7BwTksHvemeQ3AXx9VMBp55CryG2112sLXkOsSqUmWOUvy7mjRz9ns9JTVj56NThd11KC-yfh2fa4fiHl71aW49noRYZOrMQl_9YZyqyoDV7ltQAUC7-0x32WuVV_UhC4u4XyBwI4snXs"}`;

export default class RoundApplicationBuilder {
  enableEncryption: boolean;

  private project: Project;

  private ram: RoundApplicationMetadata;

  constructor(
    enableEncryption: boolean,
    project: Project,
    ram: RoundApplicationMetadata
  ) {
    this.enableEncryption = enableEncryption;
    this.project = project;
    this.ram = ram;
  }

  async encryptAnswer(answer: string): Promise<string> {
    if (!this.enableEncryption) {
      return answer;
    }

    const algorithm = {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    };

    const pubKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(TEST_PUB_KEY),
      algorithm,
      true,
      ["encrypt"]
    );
    const encoded = new TextEncoder().encode(answer);
    const encrypted = await crypto.subtle.encrypt(algorithm, pubKey, encoded);
    const encryptedBase64 = btoa(
      String.fromCharCode(...Array.from(new Uint8Array(encrypted)))
    );

    return encryptedBase64;
  }

  async build(
    roundAddress: string,
    formInputs: { [id: number]: string }
  ): Promise<RoundApplication> {
    const answers = [];
    let recipient: string;

    // eslint-disable-next-line
    for (let i = 0; i < this.ram.applicationSchema.length; i++) {
      const question = this.ram.applicationSchema[i];

      switch (question.type) {
        case "RECIPIENT":
          // FIXME: validate recipient here?
          recipient = String(formInputs[question.id]);
          break;
        case "PROJECT":
          break;
        default:
          // eslint-disable-next-line
          let answer = formInputs[question.id];
          if (question.encrypted) {
            // eslint-disable-next-line
            answer = await this.encryptAnswer(answer);
          }

          answers.push({
            questionId: question.id,
            question: question.question,
            answer,
          });
      }
    }

    return {
      round: roundAddress,
      recipient: recipient!,
      project: this.project,
      answers,
    };
  }
}
