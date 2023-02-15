import { object, string } from "yup";
import { DynamicFormInputs, FormInputs } from "../../types";
import { RoundApplicationQuestion } from "../../types/roundApplication";

export async function validateProjectForm(inputs: FormInputs) {
  const schema = object({
    title: string().required("Project Name is required"),
    description: string().required("Project Description is required"),
    website: string()
      .url("Project Website must be a valid url. e.g. https://gitcoin.co/")
      .required("Project Website is required"),
  });

  const sanitizedInput = await schema.validate(inputs, { abortEarly: false });

  return sanitizedInput;
}

export async function validateApplication(
  defaultInputs: RoundApplicationQuestion[],
  formInputs: DynamicFormInputs
) {
  const schema = defaultInputs.reduce((acc, input) => {
    if (input.inputType === "recipient") {
      return {
        ...acc,
        recipient: string()
          .matches(/^0x[a-fA-F0-9]{40}$/g, {
            excludeEmptyString: true,
            message: "Payout Wallet Address must be a valid Ethereum address",
          })
          .required("Payout Wallet Address is required"),
      };
    }

    if (input.inputType === "project") {
      return acc;
    }

    if (input.id !== undefined) {
      return {
        ...acc,
        [input.id]: input.required
          ? string().required(`${input?.title} is required`)
          : string(),
        isSafe: string().required(
          "You must select an answer to whether your payout wallet is a Gnosis Safe or multisig"
        ),
      };
    }
    return acc;
  }, {});

  // todo: fix this
  // const validateEmail = await object(schema).validateAt("", formInputs);

  const validatedInputs = await object(schema).validate(formInputs, {
    abortEarly: false,
  });

  return validatedInputs;
}
