/*
  Warnings:

  - You are about to alter the column `contributionCount` on the `projectSummary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `contributionCount` on the `roundSummary` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `contributionCount` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" ADD COLUMN     "contributionCount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "projectSummary" ALTER COLUMN "contributionCount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "roundSummary" ALTER COLUMN "contributionCount" SET DATA TYPE INTEGER;
