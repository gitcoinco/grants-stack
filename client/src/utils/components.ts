import { Metadata } from "../types";

export const getProjectImage = (loading: boolean, project?: Metadata) => {
  if (loading || (project && !project.projectImg)) {
    return "./assets/card-img.png";
  }
  return `https://ipfs.io/ipfs/${project?.projectImg}`;
};

export default {};
