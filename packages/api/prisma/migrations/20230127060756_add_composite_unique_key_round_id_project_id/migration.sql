/*
  Warnings:

  - A unique constraint covering the columns `[roundId,projectId]` on the table `match` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,roundId]` on the table `project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,roundId]` on the table `projectSummary` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roundId` to the `projectSummary` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projectSummary" DROP CONSTRAINT "projectSummary_projectId_fkey";

-- DropIndex
DROP INDEX "match_projectId_key";

-- DropIndex
DROP INDEX "project_projectId_key";

-- DropIndex
DROP INDEX "projectSummary_projectId_key";

-- AlterTable
ALTER TABLE "projectSummary" ADD COLUMN     "roundId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "match_roundId_projectId_key" ON "match"("roundId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_projectId_roundId_key" ON "project"("projectId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "projectSummary_projectId_roundId_key" ON "projectSummary"("projectId", "roundId");

-- AddForeignKey
ALTER TABLE "projectSummary" ADD CONSTRAINT "projectSummary_projectId_roundId_fkey" FOREIGN KEY ("projectId", "roundId") REFERENCES "project"("projectId", "roundId") ON DELETE RESTRICT ON UPDATE CASCADE;
