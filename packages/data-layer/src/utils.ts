import { v2Project } from ".";

export const mergeCanonicalAndLinkedProjects = (projects: v2Project[]) => {
  const canonicalProjects = projects.filter(
    (project) => project.projectType === "CANONICAL",
  );
  const linkedProjects = projects.filter(
    (project) => project.projectType === "LINKED",
  );

  const tmpProjects: Record<string, v2Project> = {};
  for (const project of canonicalProjects) {
    tmpProjects[project.id] = project;
  }

  for (const project of linkedProjects) {
    if (tmpProjects[project.id]) {
      if (!tmpProjects[project.id].linkedChains) {
        tmpProjects[project.id].linkedChains = [];
      }
      tmpProjects[project.id]!.linkedChains!.push(project.chainId);
    }
  }

  return Object.values(tmpProjects);
};
