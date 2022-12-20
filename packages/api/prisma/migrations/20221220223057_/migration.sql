/*
  Warnings:

  - You are about to drop the column `contributionCount` on the `match` table. All the data in the column will be lost.
  - Added the required column `uniqueContributors` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" DROP COLUMN "contributionCount",
ADD COLUMN     "uniqueContributors" INTEGER NOT NULL;
