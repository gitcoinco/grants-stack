"use client";

import React from "react";
import Link from "next/link";

import { useProjects } from "@/kit/features/project/hooks/useProjects";
import ProjectCard from "@/kit/features/project/components/ProjectCard";
import { Project } from "@/kit/domain/types";

type Props = {
  query: string;
};

export default function ProjectDisplayGrid(props: Props) {
  // const rounds = useRounds(props.query);
  const projects = useProjects(props.query);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* <div>{JSON.stringify(projects)}</div> */}
      {projects?.data?.map((object: Project, i: number) => {
        return (
          <Link key={i} href={`/project/${object.chainId}/${object.id}`}>
            <ProjectCard project={object} />
          </Link>
        );
      })}
    </div>
  );
}
