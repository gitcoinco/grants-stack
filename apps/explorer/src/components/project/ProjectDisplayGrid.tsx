"use client";

import React from "react";
import { RoundsQuery, useProjects, useRounds } from "@allo-team/kit";
import Link from "next/link";
import ProjectCard from "@/components/project/ProjectCard";

type Props = {
  query: RoundsQuery;
};

export default function ProjectDisplayGrid(props: Props) {
  // const rounds = useRounds(props.query);
  const projects = useProjects(props.query);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects?.data?.map((object, i) => {
        return (
          <Link key={i} href={`/project/${object.id}`}>
            {/* <RoundCard
                            key={i}
                            strategy={object.strategy}
                            id={object.id}
                            name={object.name}
                            description={object.description}
                            eligibility={object.eligibility}
                            chainId={object.chainId}
                            matching={object.matching}
                            roles={object.roles}
                            phases={object.phases}
                            // bannerUrl={object.bannerUrl}
                        /> */}
            <ProjectCard title={object.name} />
          </Link>
        );
      })}
    </div>
  );
}
