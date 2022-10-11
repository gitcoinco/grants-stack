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
