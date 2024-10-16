import React from "react";
import { Card, CardContent } from "@/kit/primitives/shadcn/card";
import { Badge } from "@/kit/primitives/shadcn/badge";
import { Button } from "@/kit/primitives/shadcn/button";
import { ChevronRight } from "lucide-react";
import { Round } from "@/kit/domain/types";

type RoundCardProps = {
  round: Round;
};

export default function RoundCard({ round }: RoundCardProps) {
  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{round.roundMetadata.name}</h2>
              <p className="text-muted-foreground line-clamp-3">
                {round.roundMetadata.eligibility.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">APPLY NOW</Badge>
              <Badge variant="secondary">VOTE NOW</Badge>
              <Badge variant="secondary">SOMETHING ELSE?</Badge>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 md:text-right">
            <div className="flex flex-col gap-2">
              <Button className="py-4">View</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: 2 days ago
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
