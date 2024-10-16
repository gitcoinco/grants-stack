import React from "react";
import { Button } from "@/kit/primitives/shadcn/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/kit/primitives/shadcn/card";
import { ChevronRight } from "lucide-react";
import { Project } from "@/kit/domain/types";
import Image from "next/image";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="w-[350px] overflow-hidden">
      <div className="relative">
        <Image
          // src="/placeholder.svg?height=150&width=350"
          src={
            project?.metadata?.bannerImg
              ? "https://ipfs.io/ipfs/" + project.metadata.bannerImg
              : "https://placehold.co/300x100"
          }
          width={350}
          height={50}
          alt="Banner"
          className="w-full h-[150px] object-cover"
        />
        <div className="absolute bottom-0 transform -translate-x-1/2 translate-y-1/2 left-1/2">
          <Image
            src={
              project?.metadata?.logoImg
                ? "https://ipfs.io/ipfs/" + project.metadata.logoImg
                : "https://placehold.co/300x100"
            }
            width={60}
            height={60}
            alt="Profile"
            className="rounded-full w-[60px] h-[60px] border-4 border-white"
          />
        </div>
      </div>
      <CardContent className="pt-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">{project?.metadata?.title}</h2>
        <p className="text-muted-foreground line-clamp-2">
          {project?.metadata?.description}
        </p>
      </CardContent>
    </Card>
  );
}
