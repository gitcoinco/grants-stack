"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnimatedNumber = ({
  end,
  duration = 2000,
}: {
  end: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      setCount(Math.floor(end * percentage));
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
};

export default function InfoCard() {
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
