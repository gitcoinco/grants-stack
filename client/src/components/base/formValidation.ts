import { object, string } from "yup";
import { FormInputs, RoundApplicationQuestion } from "../../types";

export async function validateProjectForm(inputs: FormInputs) {
  const schema = object({
    title: string().required("Project Name is required"),
    description: string().required("Project Description is required"),
    website: string()
      .url("Project Website must be a valid url. e.g. https://gitcoin.co/")
      .required("Project Website is required"),
  });

  const validatedInputs = await schema.validate(inputs, { abortEarly: false });
  return validatedInputs;
}

export async function validateApplication(
  defaultInputs: RoundApplicationQuestion[],
  formInputs: any
) {
  const schema = defaultInputs.reduce((acc, input) => {
    const { id, required } = input;
    if (id !== undefined) {
      return {
        ...acc,
        [id]: required
          ? string().required(`${input.question} is required`)
          : string(),
      };
    }
    return acc;
  }, {});

  const validatedInputs = await object(schema).validate(formInputs);
  return validatedInputs;
}
