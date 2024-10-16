import React from "react";
import ProjectHero from "@/kit/features/project/components/ProjectHero";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string; chainId: string };
}) {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen ">
      <ProjectHero projectId={params.projectId} chainId={params.chainId} />
    </main>
  );
}
