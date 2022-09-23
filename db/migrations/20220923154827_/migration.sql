/*
  Warnings:

  - Made the column `pass` on table `TrainingAnswer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TrainingAnswer" ALTER COLUMN "pass" SET NOT NULL;
