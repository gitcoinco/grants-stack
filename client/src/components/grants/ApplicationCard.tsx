import { Badge, Box, Button, SimpleGrid } from "@chakra-ui/react";

// interface ApplicationCardProps {}

export default function ApplicationCard() {
  return (
    <Box className="border-gray-300 p-2" borderWidth="1px" borderRadius="md">
      <Box p={2}>
        <span className="text-[20px]">My Applications</span>
      </Box>
      <Box p={2}>
        <span className="text-[16px]">Fantom</span>
      </Box>
      <SimpleGrid columns={2} spacing={2}>
        <Box className="pl-2">
          <span>Round 1</span>
        </Box>
        <Box className="pl-2 text-right">
          <Badge borderRadius="full" px={2}>
            Pending
          </Badge>
        </Box>
      </SimpleGrid>
      <Box p={2}>
        <span>Jan 1st, 2022 - Sep 2nd, 2022</span>
      </Box>
      <Box p={1} pr={1} className="text-center pt-4 pb-6">
        <Button colorScheme="purple" width="100%">
          View Application
        </Button>
      </Box>
    </Box>
  );
}
