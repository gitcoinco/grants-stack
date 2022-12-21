-- CreateEnum
CREATE TYPE "ChainId" AS ENUM ('GOERLI', 'OPTIMISM_MAINNET', 'FANTOM_MAINNET', 'FANTOM_TESTNET', 'LOCAL_ROUND_LAB', 'MAINNET');

-- CreateEnum
CREATE TYPE "VotingStrategy" AS ENUM ('LINEAR_QUADRATIC_FUNDING', 'QUADRATIC_VOTING');

-- CreateTable
CREATE TABLE "round" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "chainId" "ChainId" NOT NULL,
    "roundId" TEXT NOT NULL,
    "votingStrategyName" "VotingStrategy" NOT NULL,
    "isSaturated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "chainId" "ChainId" NOT NULL,
    "roundId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "matchAmountInUSD" DOUBLE PRECISION NOT NULL,
    "totalContributionsInUSD" DOUBLE PRECISION NOT NULL,
    "matchPoolPercentage" DOUBLE PRECISION NOT NULL,
    "matchAmountInToken" DOUBLE PRECISION NOT NULL,
    "roundId" TEXT NOT NULL,
    "projectPayoutAddress" TEXT NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roundSummary" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "contributionCount" INTEGER NOT NULL,
    "uniqueContributors" INTEGER NOT NULL,
    "totalContributionsInUSD" DOUBLE PRECISION NOT NULL,
    "averageUSDContribution" DOUBLE PRECISION NOT NULL,
    "roundId" TEXT NOT NULL,

    CONSTRAINT "roundSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projectSummary" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "contributionCount" INTEGER NOT NULL,
    "uniqueContributors" INTEGER NOT NULL,
    "totalContributionsInUSD" DOUBLE PRECISION NOT NULL,
    "averageUSDContribution" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "projectSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "round_roundId_key" ON "round"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "project_projectId_key" ON "project"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_roundId_key" ON "project"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "match_projectId_key" ON "match"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "roundSummary_roundId_key" ON "roundSummary"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "projectSummary_projectId_key" ON "projectSummary"("projectId");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "round"("roundId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "round"("roundId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roundSummary" ADD CONSTRAINT "roundSummary_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "round"("roundId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projectSummary" ADD CONSTRAINT "projectSummary_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
