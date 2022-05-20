import ProjectForm from "../base/ProjectForm";

function NewProject() {
  return (
    <>
      <h3>Create Project</h3>
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
