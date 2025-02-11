import { Badge } from "../common/styles";

interface RoundProjectsProps {
  roundStates: Array<"active" | "accepting-applications" | "ended"> | undefined;
  totalApplicationCount: number;
  approvedApplications: number;
}

export const RoundProjects: React.FC<RoundProjectsProps> = ({
  roundStates,
  totalApplicationCount,
  approvedApplications,
}) => {
  if (roundStates?.includes("accepting-applications")) {
    return (
      <Badge
        disabled={totalApplicationCount === 0}
        data-testid="applications-count"
      >
        {totalApplicationCount} applications
      </Badge>
    );
  } else {
    return (
      <Badge
        disabled={approvedApplications === 0}
        data-testid="approved-applications-count"
      >
        {approvedApplications} projects
      </Badge>
    );
  }
};
