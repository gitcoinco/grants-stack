import { Badge, Box, Spinner } from "@chakra-ui/react";
import { formatDateFromSecs } from "../../../utils/components";

export default function RoundDetailsCard({
  heading,
  round,
}: {
  heading: string;
  round?: any;
}) {
  const renderApplicationDate = () => (
    <>
      {formatDateFromSecs(round?.roundStartTime)} -{" "}
      {formatDateFromSecs(round?.roundEndTime)}
    </>
  );

  const renderRoundBadge = () => {
    if (round.roundEndTime * 1000 < Date.now()) {
      return (
        <Badge
          className="inline-block justify-center items-center bg-gitcoin-gray-100 fit-content"
          borderRadius="full"
          p={1}
          textTransform="none"
        >
          <span className="pt-1 px-2 text-[14px]">Ended</span>
        </Badge>
      );
    }

    return <span className="text-green-500 text-[14px]">Active</span>;
  };

  return (
    <div>
      <Box mb={2}>
        <span className="text-[16px] text-gitcoin-gray-500">{heading}</span>
      </Box>
      {round && (
        <>
          <div className="flex flex-1 flex-col md:flex-row justify-between">
            <Box className="text-[14px] text-gitcoin-gray-500">
              <div className="mb-1">{round?.roundMetaname}</div>
              {round ? (
                <span className="text-[14px] text-gitcoin-grey-400">
                  {renderApplicationDate()}
                </span>
              ) : (
                <Spinner />
              )}
            </Box>
          </div>
          <Box className="mt-4 text-[14px] text-gitcoin-gray-400">
            {renderRoundBadge()}
          </Box>
        </>
      )}
    </div>
  );
}
