/*
  Warnings:

  - You are about to drop the column `amount` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `sumOfContributions` on the `match` table. All the data in the column will be lost.
  - Added the required column `amountInUSD` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalContributionsInUSD` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" DROP COLUMN "amount",
DROP COLUMN "sumOfContributions",
ADD COLUMN     "amountInUSD" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalContributionsInUSD" DOUBLE PRECISION NOT NULL;
