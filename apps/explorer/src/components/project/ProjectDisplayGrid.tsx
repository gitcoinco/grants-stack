"use client";

import React from "react";
import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";
import { useProjects } from "@/hooks/projects/useProjects";

type Props = {
  query: string;
};

export default function ProjectDisplayGrid(props: Props) {
  // const rounds = useRounds(props.query);
  const projects = useProjects(props.query);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* {projects?.data?.map((object, i) => {
        return (
          <Link key={i} href={`/project/${object.id}`}>
            
   
            <ProjectCard title={object.name} description={object.description} />
          </Link>
        );
      })} */}
    </div>
  );
}
