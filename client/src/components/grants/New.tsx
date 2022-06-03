import { Link } from "react-router-dom";
import { slugs } from "../../routes";
import colors from "../../styles/colors";
import Button, { ButtonVariants } from "../base/Button";
import ProjectForm from "../base/ProjectForm";
import Cross from "../icons/Cross";

function NewProject() {
  return (
    <>
      <div className="flex justify-between">
        <h3 className="mb-10">Create Project</h3>
        <div className="flex justify-end">
          <Link to={slugs.grants}>
            <Button variant={ButtonVariants.outlineDanger}>
              <div className="flex items-center">
                <Cross color={colors["danger-background"]} />{" "}
                <span className="pl-2">Exit</span>
              </div>
            </Button>
          </Link>
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
    </>
  );
}

export default NewProject;
