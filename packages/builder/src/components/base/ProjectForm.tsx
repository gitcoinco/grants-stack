import { datadogRum } from "@datadog/browser-rum";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNetwork } from "wagmi";
import { ValidationError } from "yup";
import { metadataImageSaved, metadataSaved } from "../../actions/projectForm";
import { RootState } from "../../reducers";
import { ChangeHandlers, ProjectFormStatus } from "../../types";
import { Select, TextArea, TextInput, WebsiteInput } from "../grants/inputs";
import Button, { ButtonVariants } from "./Button";
import ExitModal from "./ExitModal";
import { validateProjectForm } from "./formValidation";
import ImageInput from "./ImageInput";

const validation = {
  messages: [""],
  valid: false,
  errorCount: 0,
};

function ProjectForm({
  setVerifying,
}: {
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const dispatch = useDispatch();

  const props = useSelector(
    (state: RootState) => ({
      currentChain: state.web3.chainID,
      status: state.newGrant.status,
      error: state.newGrant.error,
      formMetaData: state.projectForm.metadata,
    }),
    shallowEqual
  );

  const [formValidation, setFormValidation] = useState(validation);
  const [submitted, setSubmitted] = useState(false);
  const [modalOpen, toggleModal] = useState(false);
  const [feedback, setFeedback] = useState([
    { title: "", type: "none", message: "" },
  ]);
  const { chains } = useNetwork();

  const [, setLogoImg] = useState<Blob | undefined>();
  const [, setBannerImg] = useState<Blob | undefined>();

  const handleInput = (e: ChangeHandlers) => {
    const { value } = e.target;
    dispatch(
      metadataSaved({
        ...props.formMetaData,
        [e.target.name]: value,
      })
    );
  };

  const logoChangedHandler = (logo?: Blob) => {
    setLogoImg(logo);
    dispatch(metadataImageSaved(logo, "logoImgData"));
  };

  const bannerChangedHandler = (banner?: Blob) => {
    setBannerImg(banner);
    dispatch(metadataImageSaved(banner, "bannerImgData"));
  };

  const validate = async () => {
    try {
      await validateProjectForm(props.formMetaData);
      setFormValidation({
        messages: [],
        valid: true,
        errorCount: 0,
      });
      setFeedback([{ title: "", type: "none", message: "" }]);
    } catch (e) {
      const error = e as ValidationError;
      datadogRum.addError(error);
      setFormValidation({
        messages: error.inner.map((er) => (er as ValidationError).message),
        valid: false,
        errorCount: error.inner.length,
      });
      setFeedback([
        ...error.inner.map((er) => {
          const err = er as ValidationError;
          console.log("ERROR", { err });
          if (err !== null) {
            return {
              title: err.path!,
              type: "error",
              message: err.message,
            };
          }
          return {
            title: "",
            type: "none",
            message: "",
          };
        }),
      ]);
    }
  };

  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current && submitted) {
      validate();
    }
    didMountRef.current = true;
  }, [props.formMetaData]);

  const nextStep = () => {
    validate();
    setSubmitted(true);
    if (formValidation.valid) {
      setVerifying(ProjectFormStatus.Verification);
    }
  };

  return (
    <div className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text p-0 sm:p-4">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative mt-4 w-full sm:w-1/2">
          <Select
            name="network"
            defaultValue={props.currentChain}
            label="Project Deployment Network:"
            options={chains.map((i) => ({
              id: i.id.toString(),
              title: i.name,
            }))}
            changeHandler={() => null}
            disabled
            required
            feedback={{ type: "none", message: "" }}
          />
        </div>
        <div className="border w-full mt-8" />
        <TextInput
          label="Project Name"
          name="title"
          placeholder="What's the project name?"
          value={props.formMetaData.title}
          changeHandler={handleInput}
          required
          feedback={
            feedback.find((fb) => fb.title === "title") ?? {
              type: "none",
              message: "",
            }
          }
        />
        <WebsiteInput
          label="Project Website"
          name="website"
          placeholder="Your project's website"
          value={props.formMetaData.website}
          changeHandler={handleInput}
          required
          feedback={
            feedback.find((fb) => fb.title === "website") ?? {
              type: "none",
              message: "",
            }
          }
        />

        <ImageInput
          label="Project Logo"
          dimensions={{
            width: 300,
            height: 300,
          }}
          circle
          imageHash={props.formMetaData.logoImg}
          imageData={props.formMetaData.logoImgData}
          imgHandler={(buffer: Blob) => logoChangedHandler(buffer)}
        />

        <ImageInput
          label="Project Banner"
          dimensions={{
            width: 1500,
            height: 500,
          }}
          imageHash={props.formMetaData.bannerImg}
          imageData={props.formMetaData.bannerImgData}
          imgHandler={(buffer: Blob) => bannerChangedHandler(buffer)}
        />

        <TextArea
          label="Project Description"
          name="description"
          placeholder="What is the project about and what kind of impact does it aim to have?"
          value={props.formMetaData.description}
          changeHandler={handleInput}
          required
          rows={15}
          containerClass="sm:w-full"
          feedback={
            feedback.find((fb) => fb.title === "description") ?? {
              type: "none",
              message: "",
            }
          }
        />

        {!process.env.REACT_APP_DISABLE_PROJECTS_MARKDOWN && (
          <div className="pt-2 text-sm text-gray-400">
            <span>Formatting with </span>
            <a
              className="text-gitcoin-violet-400"
              href="https://www.markdownguide.org/basic-syntax/"
              rel="noreferrer"
              target="_blank"
            >
              Markdown
            </a>
            <span> is supported.</span>
          </div>
        )}

        {!formValidation.valid && submitted && (
          <div
            className="p-4 text-gitcoin-pink-500 border rounded border-red-900/10 bg-gitcoin-pink-100 mt-8"
            role="alert"
          >
            <strong className="text-gitcoin-pink-500 font-medium text-sm">
              There {formValidation.errorCount === 1 ? "was" : "were"}{" "}
              {formValidation.errorCount}{" "}
              {formValidation.errorCount === 1 ? "error" : "errors"} with your
              form submission
            </strong>
            <ul className="mt-1 ml-2 text-black text-sm list-disc list-inside">
              {formValidation.messages.map((o) => (
                <li className="text-black my-1" key={o}>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex w-full justify-end mt-6">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => toggleModal(true)}
          >
            Cancel
          </Button>
          <Button
            disabled={!formValidation.valid && submitted}
            variant={ButtonVariants.primary}
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      </form>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default ProjectForm;
