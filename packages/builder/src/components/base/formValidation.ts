import {
  RoundApplicationAnswers,
  RoundApplicationQuestion,
} from "data-layer/dist/roundApplication.types";
import { array, number, object, string } from "yup";
import { FormInputs } from "../../types";

const urlRegex =
  /^(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9]+\.[A-Za-z]{2,}(?:\/.*)?$/;

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

// strings can be empty
// strings should not contain @
// strings should	not be a url
function createValidationSchema(field: string) {
  return string()
    .test("has-no-at", `${field} should not include an @ symbol`, (value) =>
      value ? !value.includes("@") : true
    )
    .test("is-not-url", `${field} should not be a URL`, (value) =>
      value ? !urlRegex.test(value) : true
    );
}

export async function validateVerificationForm(inputs: FormInputs) {
  const schema = object({
    projectTwitter: createValidationSchema("Project Twitter"),
    userGithub: createValidationSchema("Your GitHub Username"),
    projectGithub: createValidationSchema("GitHub Organization"),
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
      validation = string().required("Project is required");
    } else if (input.type === "email") {
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
    } else if (input.type === "link") {
      validation = string().url(
        `${input.title} must be a valid url. e.g. https://gitcoin.co/`
      );

      if (input.required) {
        validation = validation.required(`${input.title} is required`);
      }
    } else if (input.type === "number") {
      validation = number().typeError(`${input.title} must be a number`);

      if (input.required) {
        validation = validation.required(`${input.title} is required`);
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

  const validatedInputs = await object(schema).validate(answers, {
    abortEarly: false,
  });

  return validatedInputs;
}
