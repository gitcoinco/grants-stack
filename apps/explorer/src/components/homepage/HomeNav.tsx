"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight, Home, CircleDollarSign, Briefcase } from "lucide-react";

const NavButton = ({ icon, label, isActive, onClick }) => (
  <Button
    variant={isActive ? "default" : "ghost"}
    className="justify-start w-full"
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Button>
);

const ItemCard = ({ title, description, type }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{type}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>{description}</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline">
        Learn More <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </CardFooter>
  </Card>
);

export default function HomeNav() {
  const [activeView, setActiveView] = useState("home");

  const views = {
    home: {
      title: "Featured Rounds and Projects",
      content: (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ItemCard
            title="Sustainable Energy Initiative"
            description="A round focused on funding innovative renewable energy projects."
            type="Round"
          />
          <ItemCard
            title="Ocean Cleanup Robot"
            description="An autonomous robot designed to collect plastic waste from the ocean."
            type="Project"
          />
          <ItemCard
            title="Urban Farming Solutions"
            description="Funding for vertical farming projects in urban areas."
            type="Round"
          />
        </div>
      ),
    },
    rounds: {
      title: "Active Funding Rounds",
      content: (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ItemCard
            title="Tech for Good"
            description="Supporting technology projects with positive social impact."
            type="Round"
          />
          <ItemCard
            title="Climate Action Fund"
            description="Initiatives addressing climate change and environmental protection."
            type="Round"
          />
          <ItemCard
            title="Education Innovation"
            description="Funding for projects revolutionizing learning and education."
            type="Round"
          />
        </div>
      ),
    },
    projects: {
      title: "Featured Projects",
      content: (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ItemCard
            title="AI for Healthcare"
            description="Developing AI solutions to improve medical diagnostics."
            type="Project"
          />
          <ItemCard
            title="Sustainable Housing"
            description="Eco-friendly, affordable housing solutions for urban areas."
            type="Project"
          />
          <ItemCard
            title="Clean Water Initiative"
            description="Innovative water purification technology for developing regions."
            type="Project"
          />
        </div>
      ),
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
