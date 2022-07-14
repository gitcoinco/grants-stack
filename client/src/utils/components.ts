import { Metadata } from "../types";
import PinataClient from "../services/pinata";

export const getProjectImage = (loading: boolean, project?: Metadata) => {
  if (loading || (project && !project.projectImg)) {
    return "./assets/card-img.png";
  }

  const pinataClient = new PinataClient();
  return pinataClient.fileURL(project?.projectImg!);
};

export default {};
