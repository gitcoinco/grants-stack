import { InformationCircleIcon } from "@heroicons/react/20/solid";

function PurpleNotificationBox({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-md p-4 bg-gitcoin-violet-100 mr-4 ${className}`}
    >
      <p className="flex">
        <InformationCircleIcon
          className="flex text-gitcoin-grey-300 fill-gitcoin-violet-400"
          color="gitcoin-violet-500"
          width={20}
          height={20}
        />
      </p>
      <p className="flex mx-5 text-sm text-gitcoin-violet-500 text=[14px]">
        {children}
      </p>
    </div>
  );
}

export default PurpleNotificationBox;
