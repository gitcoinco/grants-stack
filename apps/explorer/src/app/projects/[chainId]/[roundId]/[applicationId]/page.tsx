import ExploreProjects from "@/features/projects/components/ExploreProjects";

interface Params {
  chainId: string;
  roundId: string;
  applicationId: string;
}

export default function Projects({ params }: { params: Params }) {
  return (
    <main className="">
      <ExploreProjects
        applicationId={params.applicationId}
        chainId={parseInt(params.chainId)}
        roundId={params.roundId}
      />
    </main>
  );
}
