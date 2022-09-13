import { useParams } from "react-router-dom";
import { useState } from "react";
import ProjectForm from "../base/ProjectForm";
import Button, { ButtonVariants } from "../base/Button";
import colors from "../../styles/colors";
import Cross from "../icons/Cross";
import ExitModal from "../base/ExitModal";
import VerificationForm from "../base/VerificationForm";
import { ProjectFormStatus } from "../../types";
import Preview from "../base/Preview";

function EditProject() {
  const params = useParams();
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
            currentProjectId={params.id}
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
            currentProjectId={params.id}
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
        <h3 className="mb-2">Edit Project</h3>
        <div className="w-full mb-2 inline-block sm:hidden">
          <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
        </div>
        <Button
          variant={ButtonVariants.outlineDanger}
          onClick={() => toggleModal(true)}
          styles={["w-full sm:w-auto mx-w-full ml-0"]}
        >
          <i className="icon mt-1.5">
            <Cross color={colors["danger-background"]} />
          </i>{" "}
          <span className="pl-2">Exit</span>
        </Button>
      </div>

      <div className="w-full flex">
        <div className="w-full md:w-1/3 mb-2 hidden sm:inline-block">
          <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
        </div>

        <div className="w-full md:w-2/3">{currentForm(formStatus)}</div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default EditProject;
