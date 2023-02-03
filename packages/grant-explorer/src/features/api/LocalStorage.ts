import { Project } from "./types";

export function saveShortlist(shortlist: Project[], roundId: string): void {
  window.localStorage.setItem(
    `shortlist-round-${roundId}`,
    JSON.stringify(shortlist)
  );
}

export function loadShortlist(roundId: string): Project[] {
  const serializedShortlist = window.localStorage.getItem(
    `shortlist-round-${roundId}`
  );
  if (!serializedShortlist) {
    return [];
  }
  return JSON.parse(serializedShortlist);
}

export function saveFinalBallot(finalBallot: Project[], roundId: string): void {
  window.localStorage.setItem(
    `finalBallot-round-${roundId}`,
    JSON.stringify(finalBallot)
  );
}

export function loadFinalBallot(roundId: string): Project[] {
  const serializedFinalBallot = window.localStorage.getItem(
    `finalBallot-round-${roundId}`
  );
  if (!serializedFinalBallot) {
    return [];
  }
  return JSON.parse(serializedFinalBallot);
}
