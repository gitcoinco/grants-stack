import { Spinner, Stack } from "@chakra-ui/react";

// Other properties can be added as needed for reuse
function LoadingSpinner({
  label,
  size,
  thickness,
  showText,
}: {
  label: string;
  size: string;
  thickness: string;
  showText: boolean;
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Stack spacing={4} direction="column">
        <Spinner
          label={label}
          className="flex items-center justify-center"
          thickness={thickness}
          boxSize={size}
          speed="0.80s"
          emptyColor="gray.200"
          color="purple.500"
        />
        {showText ? (
          <span className="flex items-center justify-center text-gitcoin-grey-400 text-[18px]">
            Loading...
          </span>
        ) : null}
      </Stack>
    </div>
  );
}

export default LoadingSpinner;
