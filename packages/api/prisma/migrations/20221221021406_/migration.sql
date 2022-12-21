/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "match_projectId_key" ON "match"("projectId");
