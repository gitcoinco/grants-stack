import { useParams } from "react-router-dom";
import ProjectForm from "../base/ProjectForm";

function EditProject() {
  const params = useParams();

  return (
    <>
      <h3>Edit a Project</h3>
      <ProjectForm currentGrantId={params.id} />
    </>
  );
}

export default EditProject;
