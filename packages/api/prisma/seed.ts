import { PrismaClient } from "@prisma/client";
import { ChainId } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const newRound = await prisma.round.create({
    data: {
      id: 1,
      chainId: ChainId.GOERLI,
      roundId: "0xce68988b0cc5d3adf9039514d19dfd7b4ec2ab5d",
      votingStrategyName: "QUADRATIC_VOTING",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
