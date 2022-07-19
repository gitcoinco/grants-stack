import { useEffect, useState } from "react";
import { ValidationError } from "yup";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  ChangeHandlers,
  RoundApplicationMetadata,
  ProjectOptions,
  Round,
} from "../../types";
import { Select, TextArea, TextInput } from "../grants/inputs";
import { validateApplication } from "../base/formValidation";
import Radio from "../grants/Radio";
import Button, { ButtonVariants } from "../base/Button";
import { RootState } from "../../reducers";
import { loadProjects } from "../../actions/projects";

interface DynamicFormInputs {
  [key: string]: string | number;
}

const validation = {
  message: "",
  valid: false,
};

export default function Form({
  roundApplication,
  round,
}: {
  roundApplication: RoundApplicationMetadata;
  round: Round;
}) {
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      projects: state.projects.projects,
      allProjectMetadata: state.grantsMetadata,
    }),
    shallowEqual
  );

  const [formInputs, setFormInputs] = useState<DynamicFormInputs>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formValidation, setFormValidation] = useState(validation);
  const [projectOptions, setProjectOptions] = useState<ProjectOptions[]>();

  const schema = [
    ...roundApplication.applicationSchema,
    {
      id: roundApplication.applicationSchema.length,
      question: "Recipient Address",
      type: "TEXT", // this will be a limited set [TEXT, TEXTAREA, RADIO, MULTIPLE]
      required: true,
      info: "Address that will receive funds",
    },
  ];

  const handleInput = (e: ChangeHandlers) => {
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

  const projectSelected = (e: ChangeHandlers) => {
    console.log({ e });
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

  useEffect(() => {
    dispatch(loadProjects(true));
  }, [dispatch]);

  useEffect(() => {
    const currentOptions = props.projects.map((project) => ({
      id: project.id,
      title: props.allProjectMetadata[project.id].metadata?.title,
    }));

    setProjectOptions(currentOptions);
  }, [props.allProjectMetadata]);

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text p-0 sm:p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        <Select
          name="project-select"
          label="Select a project you would like to apply for funding:"
          options={projectOptions ?? []}
          disabled={preview}
          changeHandler={projectSelected}
        />
        <p className="text-xs mt-4 mb-1">
          To complete your application to {round.roundMetadata.name}, a little
          more info is needed:
        </p>
        <hr />
        {schema.map((input) => {
          switch (input.type) {
            case "TEXT":
              return (
                <TextInput
                  key={input.id}
                  label={input.question}
                  info={input.info}
                  name={`question-${input.id}`}
                  value={formInputs[`question-${input.id}`] ?? ""}
                  disabled={preview}
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
                  value={formInputs[`question-${input.id}`] ?? ""}
                  disabled={preview}
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
                    formInputs[`question-${input.id}`] ??
                    (input.choices && input.choices[0])
                  }
                  info={input.info}
                  choices={input.choices}
                  disabled={preview}
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
                  value={formInputs[`question-${input.id}`] ?? ""}
                  disabled={preview}
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
        <div className="flex justify-end">
          {!preview ? (
            <Button
              variant={ButtonVariants.primary}
              onClick={() => setPreview(true)}
            >
              Preview Application
            </Button>
          ) : (
            <div className="flex justify-end">
              <Button
                variant={ButtonVariants.outline}
                onClick={() => setPreview(false)}
              >
                Back to Editing
              </Button>
              <Button
                variant={ButtonVariants.primary}
                onClick={submitApplication}
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
