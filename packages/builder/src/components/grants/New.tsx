import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import colors from "../../styles/colors";
import Button, { ButtonVariants } from "../base/Button";
import ProjectForm from "../base/ProjectForm";
import Cross from "../icons/Cross";
import ExitModal from "../base/ExitModal";
import VerificationForm from "../base/VerificationForm";
import { ProjectFormStatus } from "../../types";
import Preview from "../base/Preview";
import { formReset } from "../../actions/projectForm";
import NetworkForm from "../base/NetworkForm";

function NewProject() {
  const dispatch = useDispatch();

  const [modalOpen, toggleModal] = useState(false);
  const [formStatus, setFormStatus] = useState<ProjectFormStatus>(
    ProjectFormStatus.Network
  );

  useEffect(
    () => () => {
      dispatch(formReset());
    },
    []
  );

  const currentSubText = (status: ProjectFormStatus) => {
    let data: { title: string; description: string } | undefined;
    switch (status) {
      case ProjectFormStatus.Metadata:
        data = {
          title: "Project Details",
          description: "Tell us more about what you’re working on.",
        };
        break;
      case ProjectFormStatus.Verification:
        data = {
          title: "Project Socials",
          description: "Share where we can learn more about your project.",
        };
        break;
      case ProjectFormStatus.Preview:
        data = {
          title: "Project Preview",
          description: "Preview your project's page.",
        };
        break;
      default:
        return null;
    }

    return data ? (
      <>
        <h5 className="mb-2">{data.title}</h5>
        <p>{data.description}</p>
      </>
    ) : null;
  };

  const currentForm = (status: ProjectFormStatus) => {
    switch (status) {
      case ProjectFormStatus.Network:
        return (
          <NetworkForm setVerifying={(newStatus) => setFormStatus(newStatus)} />
        );
      case ProjectFormStatus.Metadata:
        return (
          <ProjectForm
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      case ProjectFormStatus.Verification:
        return (
          <VerificationForm
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      case ProjectFormStatus.Preview:
        return (
          <Preview
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <h3 className="my-2">Create a Project</h3>
        <div className="w-full mb-2 inline-block sm:hidden">
          {currentSubText(formStatus)}
        </div>
        <Button
          variant={ButtonVariants.outlineDanger}
          onClick={() => toggleModal(true)}
          styles={["w-full sm:w-auto mx-w-full ml-0"]}
        >
          <i className="mt-1.5">
            <Cross color={colors["danger-background"]} />
          </i>
          <span className="pl-2">Exit</span>
        </Button>
      </div>

      <div className="w-full flex">
        <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
          {currentSubText(formStatus)}
          <p className="mt-8">
            Need Help? Check out the{" "}
            <a
              target="_blank"
              rel="noreferrer"
              className="text-gitcoin-violet-400"
              href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-program/project-owners"
            >
              Builder Guide.
            </a>
          </p>
        </div>
        <div className="w-full md:w-2/3">{currentForm(formStatus)}</div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default NewProject;
