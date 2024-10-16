import React from "react";
import { ApplicationStatusBadge } from "@allo-team/kit";
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { ChevronRight } from "lucide-react";

type ProjectCardProps = {
  title: string;
};

export default function ProjectCard({
  title,
  description,
  type,
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {/* <CardDescription>{type}</CardDescription> */}
      </CardHeader>
      <CardContent>{/* <p>{description}</p> */}</CardContent>
      <CardFooter>
        <Button variant="outline">
          Learn More <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        <ApplicationStatusBadge status={"REJECTED"} />
      </CardFooter>
    </Card>
  );
}
