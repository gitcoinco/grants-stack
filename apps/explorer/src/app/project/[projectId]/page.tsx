import React from "react";
import ProjectHero from "@/components/project/ProjectHero";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen ">
      <ProjectHero projectId={params.projectId} />
    </main>
  );
}
