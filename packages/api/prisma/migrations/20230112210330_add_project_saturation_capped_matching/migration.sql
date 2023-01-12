/*
  Warnings:

  - Added the required column `originalMatchAmountInUSD` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" ADD COLUMN     "isSaturated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalMatchAmountInUSD" DOUBLE PRECISION NOT NULL;
