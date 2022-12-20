/*
  Warnings:

  - You are about to drop the column `contributionCount` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueContributors` on the `match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match" DROP COLUMN "contributionCount",
DROP COLUMN "uniqueContributors";
