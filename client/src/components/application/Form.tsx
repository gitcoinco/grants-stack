import { useEffect, useState } from "react";
import { ValidationError } from "yup";
import { RoundApplicationMetadata } from "../../types";
import { TextArea, TextInput } from "../grants/inputs";
import { validateApplication } from "../base/formValidation";
import Radio from "../grants/Radio";
import Button, { ButtonVariants } from "../base/Button";

interface DynamicFormInputs {
  [key: string]: string | number;
}

const validation = {
  message: "",
  valid: false,
};

export default function Form({
  roundApplication,
}: {
  roundApplication: RoundApplicationMetadata;
}) {
  const [formInputs, setFormInputs] = useState<DynamicFormInputs>({});
  const [submitted, setSubmitted] = useState(false);
  const [formValidation, setFormValidation] = useState(validation);
  const schema = [
    ...roundApplication.applicationSchema,
    {
      id: roundApplication.applicationSchema.length + 1,
      question: "Recipient Address",
      type: "TEXT", // this will be a limited set [TEXT, TEXTAREA, RADIO, MULTIPLE]
      required: true,
      info: "Address that will receive funds",
    },
  ];

  const handleInput = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setFormInputs({ ...formInputs, [e.target.name]: value });
  };

  const validate = async () => {
    try {
      await validateApplication(schema, formInputs);
      setFormValidation({
        message: "",
        valid: true,
      });
    } catch (e) {
      const error = e as ValidationError;
      setFormValidation({
        message: error.message,
        valid: false,
      });
    }
  };

  const submitApplication = async () => {
    setSubmitted(true);
    await validate();
    // TODO: Submit application to RM
  };

  // perform validation after the fields state is updated
  useEffect(() => {
    validate();
  }, [formInputs]);

  return (
    <>
      {schema.map((input) => {
        switch (input.type) {
          case "TEXT":
            return (
              <TextInput
                key={input.id}
                label={input.question}
                info={input.info}
                name={`question-${input.id}`}
                value={formInputs[input.id] ?? ""}
                changeHandler={handleInput}
              />
            );
          case "TEXTAREA":
            return (
              <TextArea
                key={input.id}
                label={input.question}
                info={input.info}
                name={`question-${input.id}`}
                value={formInputs[input.id] ?? ""}
                changeHandler={handleInput}
              />
            );
          case "RADIO":
            return (
              <Radio
                key={input.id}
                label={input.question}
                name={`question-${input.id}`}
                value={
                  formInputs[input.id] ?? (input.choices && input.choices[0])
                }
                info={input.info}
                choices={input.choices}
                changeHandler={handleInput}
              />
            );
          // case "MULTIPLE":
          // placeholder until we support multiple input
          //   return (
          //     <Radio
          //       label={appInput.question}
          //       name={id}
          //       info={appInput.info}
          //       choices={appInput.choices}
          //       changeHandler={(e) => console.log(e)}
          //     />
          //   );
          default:
            return (
              <TextInput
                key={input.id}
                label={input.question}
                name={`question-${input.id}`}
                value={formInputs[input.id] ?? ""}
                changeHandler={handleInput}
              />
            );
        }
      })}
      {!formValidation.valid && submitted && (
        <p className="text-danger-text w-full text-center font-semibold my-2">
          {formValidation.message}
        </p>
      )}
      <Button
        variant={ButtonVariants.primary}
        onClick={submitApplication}
        // disabled={submitted}
      >
        Submit
      </Button>
    </>
  );
}
