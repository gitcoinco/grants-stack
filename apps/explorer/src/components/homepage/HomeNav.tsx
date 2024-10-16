"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, CircleDollarSign, Briefcase } from "lucide-react";
import RoundDisplayGrid from "@/components/round/RoundDisplayGrid";
import ProjectDisplayGrid from "@/components/project/ProjectDisplayGrid";
import {
  DiscoverProjects,
  DiscoverRounds,
  ProjectsQuery,
  RoundsQuery,
} from "@allo-team/kit";

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
      title: "Featured Rounds and Projects",
      content: <RoundDisplayGrid query={featuredQuery} />,
    },
    rounds: {
      title: "Active Funding Rounds",
      content: <RoundDisplayGrid query={allRoundsQuery} />,
    },
    projects: {
      title: "Featured Projects",
      content: <RoundDisplayGrid query={allRoundsQuery} />,
    },
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="space-y-2">
          <NavButton
            icon={<Home className="w-4 h-4" />}
            label="Home"
            isActive={activeView === "home"}
            onClick={() => setActiveView("home")}
          />
          <NavButton
            icon={<CircleDollarSign className="w-4 h-4" />}
            label="Rounds"
            isActive={activeView === "rounds"}
            onClick={() => setActiveView("rounds")}
          />
          <NavButton
            icon={<Briefcase className="w-4 h-4" />}
            label="Projects"
            isActive={activeView === "projects"}
            onClick={() => setActiveView("projects")}
          />
        </nav>
        <main>
          <h2 className="mb-6 text-2xl font-bold">{views[activeView].title}</h2>
          {views[activeView].content}
        </main>
      </div>
    </div>
  );
}
