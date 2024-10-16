import React from "react";
import RoundHero from "@/kit/features/rounds/components/RoundHero";

export default function RoundPage({
  params,
}: {
  params: { chainId: string; roundId: string };
}) {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen ">
      <RoundHero chainId={params.chainId} roundId={params.roundId} />
    </main>
  );
}
