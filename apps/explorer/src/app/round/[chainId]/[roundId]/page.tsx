import HomeNav from "@/components/homepage/HomeNav";
import RoundHero from "@/components/round/RoundHero";

export default function Round({
  params,
}: {
  params: { chainId: string; roundId: string };
}) {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen ">
      <RoundHero chainId={params.chainId} roundId={params.roundId} />
      <HomeNav />
    </main>
  );
}
