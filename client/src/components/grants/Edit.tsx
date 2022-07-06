import { useParams } from "react-router-dom";
import { useState } from "react";
import ProjectForm from "../base/ProjectForm";
import Button, { ButtonVariants } from "../base/Button";
import colors from "../../styles/colors";
import Cross from "../icons/Cross";
import ExitModal from "../base/ExitModal";

function EditProject() {
  const [modalOpen, toggleModal] = useState(false);

  const params = useParams();

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
        <div className="w-full md:w-2/3">
          <ProjectForm currentGrantId={params.id} />
        </div>
      </div>
      <ExitModal modalOpen={modalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default EditProject;
