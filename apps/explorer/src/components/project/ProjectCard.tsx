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
  description: string | undefined;
};

export default function ProjectCard({ title, description }: ProjectCardProps) {
  return (
    <Card className="w-[350px] overflow-hidden">
      <div className="relative">
        {/* Banner Image */}
        <img
          src="/placeholder.svg?height=150&width=350"
          alt="Banner"
          className="w-full h-[150px] object-cover"
        />
        {/* Profile Photo */}
        <div className="absolute bottom-0 transform -translate-x-1/2 translate-y-1/2 left-1/2">
          <img
            src="/placeholder.svg?height=100&width=100"
            alt="Profile"
            className="rounded-full w-[100px] h-[100px] border-4 border-white"
          />
        </div>
      </div>
      <CardContent className="pt-16 text-center">
        <h2 className="mb-2 text-2xl font-bold">John Doe</h2>
        <p className="text-muted-foreground">
          Software Developer | React Enthusiast
        </p>
      </CardContent>
    </Card>
  );
}
