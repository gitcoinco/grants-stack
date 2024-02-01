import {
  RoundApplicationAnswers,
  RoundApplicationMetadata,
} from "data-layer/dist/roundApplication.types";
import Lit from "../services/lit";
import { Project, RoundApplication } from "../types";

export default class RoundApplicationBuilder {
  enableEncryption: boolean;

  private project: Project;

  private ram: RoundApplicationMetadata;

  private roundAddress: string;

  private chainName: string;

  private lit: Lit;

  constructor(
    enableEncryption: boolean,
    project: Project,
    ram: RoundApplicationMetadata,
    roundAddress: string,
    chainName: string
  ) {
    this.enableEncryption = enableEncryption;
    this.project = project;
    this.ram = ram;
    this.roundAddress = roundAddress;
    this.chainName = chainName;
    const litInit = {
      chain: chainName,
      contract: this.roundAddress,
    };

    this.lit = new Lit(litInit);
  }

  async encryptAnswer(answer: string) {
    if (!this.enableEncryption) {
      return {
        ciphertext: answer,
        encryptedSymmetricKey: "",
      };
    }

    const { encryptedString, encryptedSymmetricKey } =
      await this.lit.encryptString(answer);
    const encryptedStringText = await this.blobToDataString(encryptedString);

    return {
      ciphertext: encryptedStringText,
      encryptedSymmetricKey,
    };
  }

  async blobToDataString(blob: Blob): Promise<string> {
    const fr = new FileReader();
    fr.readAsDataURL(blob);
    return new Promise<string>((resolve, reject) => {
      fr.addEventListener("loadend", () => {
        const { result } = fr;
        if (result !== null && typeof result === "string") {
          resolve(result.split(",")[1]);
        }
        reject(new Error("cannot read blob data"));
      });
    });
  }

  async build(
    roundAddress: string,
    formInputs: RoundApplicationAnswers
  ): Promise<RoundApplication> {
    const answers = [];
    let recipient: string;

    // eslint-disable-next-line
    for (let i = 0; i < this.ram.applicationSchema.questions.length; i++) {
      const question = this.ram.applicationSchema.questions[i];

      switch (question.type) {
        case "recipient":
          // FIXME: validate recipient here?
          recipient = String(formInputs[question.id]);
          break;

        case "project":
          break;

        default:
          // eslint-disable-next-line
          let answer;
          // eslint-disable-next-line
          let encryptedAnswer;
          if (question.encrypted) {
            // eslint-disable-next-line
            encryptedAnswer = await this.encryptAnswer(
              (formInputs[question.id] as string) ?? ""
            );
          } else {
            answer = formInputs[question.id];
          }

          answers.push({
            questionId: question.id,
            question: question.title,
            type: question.type,
            hidden: question.hidden,
            answer,
            encryptedAnswer,
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
