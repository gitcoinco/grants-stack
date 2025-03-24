import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export function AlloVersionBanner({ roundId }: { roundId: string }) {
  const isAlloV1 = roundId.startsWith("0x");

  return (
    <>
      <div className="fixed z-20 left-0 top-[64px] w-full bg-[#FFEFBE] p-4 text-center font-medium flex items-center justify-center">
        <ExclamationCircleIcon className="h-5 w-5 mr-2" />
        <span>
          This round has been deployed on Allo {isAlloV1 ? "v1" : "v2"}. Any
          projects that you add to your cart will have to be donated to
          separately from projects on rounds deployed on Allo{" "}
          {isAlloV1 ? "v2" : "v1"}. Learn more{" "}
          <a href="#" target="_blank" rel="noreferrer" className="underline">
            here
          </a>
          .
        </span>
      </div>
      <div className="h-[64px] w-full"></div>
    </>
  );
}
