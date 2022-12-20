/*
  Warnings:

  - You are about to drop the column `amountInToken` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `amountInUSD` on the `match` table. All the data in the column will be lost.
  - You are about to drop the column `matchPercentage` on the `match` table. All the data in the column will be lost.
  - Added the required column `matchAmountInToken` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchAmountInUSD` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchPoolPercentage` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" DROP COLUMN "amountInToken",
DROP COLUMN "amountInUSD",
DROP COLUMN "matchPercentage",
ADD COLUMN     "matchAmountInToken" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "matchAmountInUSD" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "matchPoolPercentage" DOUBLE PRECISION NOT NULL;
