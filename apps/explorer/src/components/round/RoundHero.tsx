"use client";

import { motion } from "framer-motion";
import StatsCard from "../homepage/StatsCard";
import { useParams } from "next/navigation";
import { useRoundById } from "@allo-team/kit";
import { bigIntReplacer } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users } from "lucide-react";

type RoundHeroProps = {
  chainId: string;
  roundId: string;
};

export default function RoundHero(props: RoundHeroProps) {
  // console.log(JSON.stringify(props));

  const round = useRoundById(props.roundId, { chainId: props.chainId });

  console.log(JSON.stringify(round, bigIntReplacer));

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="flex flex-col justify-center col-span-3 space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                {round.data?.name}
              </h1>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {/* <Button>Learn More</Button> */}
              <Badge>New Release2</Badge>
              <Button variant="outline">Contact Sales</Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="secondary">New Release</Badge>
              <Badge>New Release2</Badge>
              <span className="text-muted-foreground">Version 2.0</span>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <PassportWidget round={round} alignment="right" />

              <div className="flex items-center space-x-4">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">
                    Release Date
                  </p>
                  <p className="text-sm text-muted-foreground">
                    January 15, 2024
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">
                    Availability
                  </p>
                  <p className="text-sm text-muted-foreground">Worldwide</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium leading-none">
                    Target Audience
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enterprise & SMBs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="py-12 text-muted-foreground md:text-xl">
          {round.data?.description}
        </div>
      </div>
    </section>
  );
}
