-- CreateTable
CREATE TABLE "Training" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "jsFramework" JSONB NOT NULL,
    "cssFramework" JSONB NOT NULL,
    "code" JSONB NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);
