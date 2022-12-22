import { ExclamationCircleIcon } from "@heroicons/react/outline";

export default function Banner() {
  return (
    <div className="bg-pink-100">
      <div className="max-w-full py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex flex-row flex-wrap items-center justify-center">
          <div className="h-6 w-6 relative rounded-full bg-pink-400">
            <ExclamationCircleIcon className="h-4 w-4 absolute top-1 left-1 text-white items-center" />
          </div>
          <span className="ml-3 font-medium">
            This round has ended. Thank you for your support!
          </span>
        </div>
      </div>
    </div>
  );
}
