/*
  Warnings:

  - A unique constraint covering the columns `[roundId]` on the table `match` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "match_projectId_roundId_key";

-- CreateIndex
CREATE UNIQUE INDEX "match_roundId_key" ON "match"("roundId");
