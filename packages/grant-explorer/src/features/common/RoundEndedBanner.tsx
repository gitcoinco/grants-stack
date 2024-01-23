import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export default function RoundEndedBanner() {
  return (
    <div>
      <div className="bg-pink-100">
        <div className="max-w-full py-3 px-3 sm:px-6 lg:px-8 z-0">
          <div className="flex flex-row flex-wrap items-center justify-center">
            <ExclamationCircleIcon
              aria-label={"Exclamation icon"}
              className="fill-red-500 stroke-red-200 h-7 w-7 relative text-white items-center rounded-full"
            />
            <span className="ml-3 font-medium text-sm">
              This round has ended. Thank you for your support!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
