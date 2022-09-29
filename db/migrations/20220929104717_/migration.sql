/*
  Warnings:

  - Made the column `order` on table `Training` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Training" ALTER COLUMN "order" SET NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;
