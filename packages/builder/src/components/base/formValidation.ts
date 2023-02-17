import { object, array, string } from "yup";
import { FormInputs } from "../../types";
import {
  RoundApplicationAnswers,
  RoundApplicationQuestion,
} from "../../types/roundApplication";

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
  questions: RoundApplicationQuestion[],
  answers: RoundApplicationAnswers
) {
  const schema = questions.reduce((acc, input) => {
    let validation;

    if (input.type === "project") {
      return acc;
    }

    if (input.type === "email") {
      validation = string().email(
        `${input.title} must be a valid email address`
      );

      if (input.required) {
        validation = validation.required(`${input.title} is required`);
      }
    } else if (input.type === "address") {
      validation = string().matches(/^0x[a-fA-F0-9]{40}$/g, {
        excludeEmptyString: true,
        message: `${input.title} must be a valid Ethereum address`,
      });

      if (input.required) {
        validation = validation.required(`${input.title} is required`);
      }
    } else if (input.type === "recipient") {
      return {
        ...acc,
        isSafe: string().required(
          "You must select an answer to whether your payout wallet is a Gnosis Safe or multisig"
        ),
        [input.id]: string()
          .matches(/^0x[a-fA-F0-9]{40}$/g, {
            excludeEmptyString: true,
            message: "Payout Wallet Address must be a valid Ethereum address",
          })
          .required("Payout Wallet Address is required"),
      };
    } else if (input.type === "checkbox") {
      validation = array(string());

      if (input.required) {
        validation = validation.min(
          1,
          `You must select at least one value for ${input.title}`
        );
      }
    } else {
      validation = string();

      if (input.required) {
        validation = validation.required(`${input.title} is required`);
      }
    }

    return {
      ...acc,
      [input.id]: validation,
    };
  }, {});

  // todo: fix this
  // const validateEmail = await object(schema).validateAt("", formInputs);

  const validatedInputs = await object(schema).validate(answers, {
    abortEarly: false,
  });

  return validatedInputs;
}
