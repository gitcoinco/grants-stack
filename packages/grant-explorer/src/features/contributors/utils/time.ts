import moment from "moment";

export function formatTimeAgo(timestamp: number) {
  return moment(timestamp * 1000).fromNow();
}
