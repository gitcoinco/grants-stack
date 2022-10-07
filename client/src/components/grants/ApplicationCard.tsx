import { Badge, Box, SimpleGrid } from "@chakra-ui/react";

// todo: get user projects
// todo: get user applications for this project

export default function ApplicationCard() {
  return (
    <Box p={2} className="border-gray-300" borderWidth="1px" borderRadius="md">
      <Box p={2} mb={4}>
        <span className="text-[16px] text-gitcoin-gray-400">Fantom</span>
      </Box>
      <SimpleGrid columns={2} spacing={2}>
        <Box className="pl-2 text-gitcoin-gray-400">
          <span>Round 1</span>
        </Box>
        <Box className="pl-2 text-right text-gitcoin-gray-400">
          <Badge className="bg-gitcoin-gray-100" borderRadius="full" p={2}>
            Applied
          </Badge>
        </Box>
      </SimpleGrid>
      <Box className="pl-2 text-gitcoin-gray-400">
        <span>Jan 1st, 2022 - Sep 2nd, 2022</span>
      </Box>
      <Box p={2} className="mt-4 mb-6">
        <p>
          Have any questions about your grant round application? Contact{" "}
          <a className="text-purple-500" href="/">
            [Program Support]
          </a>
        </p>
      </Box>
    </Box>
  );
}
