import { useState } from "react";
import { slugs } from "../../routes";
import colors from "../../styles/colors";
import Button, { ButtonVariants } from "../base/Button";
import ProjectForm from "../base/ProjectForm";
import Cross from "../icons/Cross";
import { BaseModal } from "../base/BaseModal";
import Shield from "../icons/Shield";

function NewProject() {
  const [modalOpen, toggleModal] = useState(false);

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
        <div className="w-full md:w-2/3">
          <ProjectForm />
        </div>
      </div>
      <BaseModal isOpen={modalOpen} onClose={() => toggleModal(false)}>
        <>
          <div className="flex">
            <div className="w-1/5">
              <div className="rounded-full h-12 w-12 bg-primary-background/10 border flex justify-center items-center">
                <Shield color={colors["primary-background"]} />
              </div>
            </div>
            <div className="w-4/5">
              <h5 className="font-semibold mb-2">Save Changes?</h5>
              <p className="mb-4">You are about to loose any changes made.</p>
              <p className="mb-4">Are you sure you want to exit?</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant={ButtonVariants.outline}
              onClick={() => toggleModal(false)}
            >
              Go Back
            </Button>
            <Button path={slugs.grants} variant={ButtonVariants.danger}>
              Yes, Exit
            </Button>
          </div>
        </>
      </BaseModal>
    </div>
  );
}

export default NewProject;
