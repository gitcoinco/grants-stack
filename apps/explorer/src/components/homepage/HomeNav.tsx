"use client";

import { useState } from "react";
import { Home, CircleDollarSign, Briefcase } from "lucide-react";
import RoundDisplayGrid from "@/components/round/RoundDisplayGrid";
import ProjectDisplayGrid from "@/components/project/ProjectDisplayGrid";
import {
  DiscoverProjects,
  DiscoverRounds,
  ProjectsQuery,
  RoundsQuery,
} from "@allo-team/kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NavButton = ({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    className="justify-start w-full"
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Button>
);

export default function HomeNav() {
  const [activeView, setActiveView] = useState("home");

  const featuredQuery: RoundsQuery = {
    where: { status: { equalTo: 8453 } },
    orderBy: { match_amount_in_usd: "desc" },
    first: 10,
  };

  const allRoundsQuery: RoundsQuery = {
    where: { chainId: { equalTo: 8453 } },
    orderBy: { match_amount_in_usd: "desc" },
    first: 10,
  };

  const allProjectsQuery: ProjectsQuery = {
    where: { chainId: { equalTo: 8453 } },
    // orderBy: { match_amount_in_usd: "desc" },
    first: 10,
  };

  const views = {
    home: {
      tab: "Home",
      title: "Featured Rounds and Projects",
      content: <RoundDisplayGrid query={featuredQuery} />,
    },
    rounds: {
      tab: "Rounds",
      title: "Active Funding Rounds",
      content: <RoundDisplayGrid query={allRoundsQuery} />,
    },
    projects: {
      tab: "Projects",
      title: "Featured Projects",
      content: <ProjectDisplayGrid query={allRoundsQuery} />,
    },
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <Tabs defaultValue="Home" className="py-8">
        <TabsList className="grid w-full grid-cols-3 mb-12">
          <TabsTrigger value={views.home.tab}>{views.home.tab}</TabsTrigger>
          <TabsTrigger value={views.rounds.tab}>{views.rounds.tab}</TabsTrigger>
          <TabsTrigger value={views.projects.tab}>
            {views.projects.tab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="Home">
          <main>
            <h2 className="mb-6 text-2xl font-bold">{views.home.title}</h2>
            {views.home.content}
          </main>
        </TabsContent>
        <TabsContent value="Rounds">
          <main>
            <h2 className="mb-6 text-2xl font-bold">{views.rounds.title}</h2>
            {views.rounds.content}
          </main>
        </TabsContent>
        <TabsContent value="Projects">
          <main>
            <h2 className="mb-6 text-2xl font-bold">{views.projects.title}</h2>
            {views.projects.content}
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
}
