import { RoundApplicationMetadata, Project, RoundApplication } from "../types";

export default class RoundApplicationBuilder {
  private project: Project;

  private ram: RoundApplicationMetadata;

  constructor(project: Project, ram: RoundApplicationMetadata) {
    this.project = project;
    this.ram = ram;
  }

  encryptAnswer(answer: string): string {
    return answer;
  }

  build(
    roundAddress: string,
    formInputs: { [id: number]: string }
  ): RoundApplication {
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
            answer = this.encryptAnswer(answer);
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
