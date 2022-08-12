import { useState } from "react";
import colors from "../../styles/colors";
import Button, { ButtonVariants } from "../base/Button";
import ProjectForm from "../base/ProjectForm";
import Cross from "../icons/Cross";
import ExitModal from "../base/ExitModal";
import VerificationForm from "../base/VerificationForm";
import { ProjectFormStatus } from "../../types";
import Preview from "../base/Preview";

function NewProject() {
  const [modalOpen, toggleModal] = useState(false);
  const [formStatus, setFormStatus] = useState<ProjectFormStatus>(
    ProjectFormStatus.Metadata
  );

  const currentForm = (status: ProjectFormStatus) => {
    switch (status) {
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
        return (
          <ProjectForm
            setVerifying={(verifyUpdate) => setFormStatus(verifyUpdate)}
          />
        );
    }
  };

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <h3 className="mb-2">Create Project</h3>
        <div className="w-full mb-2 inline-block sm:hidden">
          <p>Tell us what you’re working on.</p>
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
          <p>Tell us what you’re working on.</p>
        </div>
        <div className="w-full md:w-2/3">{currentForm(formStatus)}</div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default NewProject;
