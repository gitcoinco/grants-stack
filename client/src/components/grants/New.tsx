import { useState } from "react";
import { Link } from "react-router-dom";
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
    <>
      <div className="flex justify-between">
        <h3 className="mb-10">Create Project</h3>
        <div className="flex justify-end">
          <div>
            <Button
              variant={ButtonVariants.outlineDanger}
              onClick={() => toggleModal(true)}
            >
              <div className="flex items-center">
                <Cross color={colors["danger-background"]} />{" "}
                <span className="pl-2">Exit</span>
              </div>
            </Button>
          </div>
          {/* Commenting out until we figure out how drafts will be saved
        <Button variant={ButtonVariants.outline}>
          <Cross color={colors["primary-text"]} /> Save Draft
        </Button> */}
        </div>
      </div>
      <div className="w-full flex flex-wrap">
        <div className="w-full md:w-1/3">
          <p>Tell us what you are working on.</p>
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
            <Link to={slugs.grants}>
              <Button variant={ButtonVariants.danger}>Yes, Exit</Button>
            </Link>
          </div>
        </>
      </BaseModal>
    </>
  );
}

export default NewProject;
