-- CreateEnum
CREATE TYPE "ChainId" AS ENUM ('GOERLI', 'OPTIMISM_MAINNET', 'FANTOM_MAINNET', 'FANTOM_TESTNET', 'LOCAL_ROUND_LAB');

-- CreateEnum
CREATE TYPE "VotingStrategy" AS ENUM ('LINEAR_QUADRATIC_FUNDING', 'QUADRATIC_VOTING');

-- CreateTable
CREATE TABLE "round" (
    "id" SERIAL NOT NULL,
    "chainId" "ChainId" NOT NULL,
    "roundId" TEXT NOT NULL,
    "votingStrategyName" "VotingStrategy" NOT NULL,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout" (
    "id" SERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "token" TEXT NOT NULL,
    "roundId" INTEGER NOT NULL,

    CONSTRAINT "payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "round_roundId_key" ON "round"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "payout_projectId_roundId_key" ON "payout"("projectId", "roundId");

-- AddForeignKey
ALTER TABLE "payout" ADD CONSTRAINT "payout_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
