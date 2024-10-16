"use client";

import { useState } from "react";
import { Home, CircleDollarSign, Briefcase } from "lucide-react";

import {
  DiscoverProjects,
  DiscoverRounds,
  ProjectsQuery,
  RoundsQuery,
} from "@allo-team/kit";
import { Button } from "@/kit/primitives/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/primitives/shadcn/card";
import { Input } from "@/kit/primitives/shadcn/input";
import { Label } from "@/kit/primitives/shadcn/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/kit/primitives/shadcn/tabs";
import { activeProjects, activeRounds } from "@/kit/domain/rounds/QueryFilters";
import RoundDisplayGrid from "@/kit/features/rounds/components/RoundDisplayGrid";
import ProjectDisplayGrid from "@/kit/features/project/components/ProjectDisplayGrid";

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
      content: <RoundDisplayGrid query={activeRounds()} />,
    },
    rounds: {
      tab: "Rounds",
      title: "Active Funding Rounds",
      content: <RoundDisplayGrid query={activeRounds()} />,
    },
    projects: {
      tab: "Projects",
      title: "Featured Projects",
      content: <ProjectDisplayGrid query={activeProjects()} />,
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
