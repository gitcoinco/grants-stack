import { AttestationFrameProps } from "../../api/types";

export const getRoundsToFetchNames = (props: AttestationFrameProps) => {
  if (props.projects.length === 0) {
    return {};
  }
  const roundsToFetchNames: Record<number, string> = {};
  props.projects.forEach((project) => {
    roundsToFetchNames[project?.chainId ?? 0] = project.roundId ?? "";
  });
  roundsToFetchNames[props.topRound?.chainId ?? 0] =
    props.topRound?.roundId ?? "";

  return roundsToFetchNames;
};
