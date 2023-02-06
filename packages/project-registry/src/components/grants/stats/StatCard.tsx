import { Box, Tooltip } from "@chakra-ui/react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

export default function StatCard({
  heading,
  value,
  bg,
  border,
  tooltip,
}: {
  heading: string;
  value: string | number;
  bg?: string;
  border?: boolean;
  tooltip?: string;
}) {
  return (
    <Box
      p={3}
      className={`${
        bg ? `bg-${bg}` : ""
      } border-grey-100 mx-2 mt-2 sm:table-row md:table-cell`}
      borderWidth={border ? "1px" : "0px"}
      borderRadius="md"
      minWidth="193px"
      height="88px"
    >
      <Box mb={2}>
        <div className="table-row">
          <div className="text-[14px] text-gitcoin-grey-500 font-semibold table-cell">
            {heading}{" "}
          </div>

          {tooltip && (
            <div className="table-cell">
              <Tooltip bg="purple.900" hasArrow label={tooltip}>
                <InformationCircleIcon className="w-4 h-4 ml-1" color="gray" />
              </Tooltip>
            </div>
          )}
        </div>
      </Box>
      <Box mb={2}>
        <span className="text-[24px] text-gitcoin-grey-400">{value}</span>
      </Box>
    </Box>
  );
}
