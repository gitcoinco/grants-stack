import { LinkIcon } from "@heroicons/react/24/outline";

export const ShareStatsButton = ({
  handleClick,
}: {
  handleClick: () => void;
}): JSX.Element => {
  return (
    <button
      onClick={handleClick}
      className="rounded-lg px-4 py-2.5 font-mono sm:text-lg bg-green-200 hover:bg-green-300 text-white transition-all flex items-center justify-center gap-2"
      data-testid="share-results-footer"
    >
      <LinkIcon className="w-4 h-4" />
      Share
    </button>
  );
};
