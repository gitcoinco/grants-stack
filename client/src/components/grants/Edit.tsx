import { useParams } from "react-router-dom";
import ProjectForm from "../base/ProjectForm";

function EditProject() {
  const params = useParams();

  return (
    <>
      <h3>Edit Project</h3>
      <div className="w-full flex flex-wrap">
        <div className="w-full md:w-1/3">
          <p>Make sure to Save &amp; Exit, so your changes are saved.</p>
        </div>
        <div className="w-full md:w-2/3">
          <ProjectForm currentGrantId={params.id} />
        </div>
      </div>
    </>
  );
}

export default EditProject;
