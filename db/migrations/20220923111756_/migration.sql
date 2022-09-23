-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recordId" TEXT;

-- CreateTable
CREATE TABLE "TrainingAnswer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordId" TEXT NOT NULL,
    "code" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL,

    CONSTRAINT "TrainingAnswer_pkey" PRIMARY KEY ("id")
);
