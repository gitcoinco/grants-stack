"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/kit/primitives/shadcn/card";
import { AnimatedNumber } from "../../kit/primitives/AnimatedNumber";

export default function StatsCard() {
  return (
    <Card className="px-12 py-12">
      {/* <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">By the numbers...</CardTitle>
      </CardHeader> */}
      <CardContent className="grid gap-6 sm:grid-cols-3 md:grid-cols-1">
        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="text-4xl font-bold text-primary">
            <AnimatedNumber end={4600000} />
          </span>
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Unique Donations
          </span>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="text-4xl font-bold text-primary">
            <AnimatedNumber end={5242} />
          </span>
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            Projects Raised Funds
          </span>
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="text-4xl font-bold text-primary">
            $<AnimatedNumber end={60000000} />+
          </span>
          <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">
            In Funding Distributed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
