/*
  Warnings:

  - Added the required column `amountInToken` to the `match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchPercentage` to the `match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "match" ADD COLUMN     "amountInToken" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "matchPercentage" DOUBLE PRECISION NOT NULL;
