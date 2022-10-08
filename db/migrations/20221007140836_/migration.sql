/*
  Warnings:

  - Made the column `explanation` on table `Training` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Training" ALTER COLUMN "explanation" SET NOT NULL;
