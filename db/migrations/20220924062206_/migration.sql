-- CreateTable
CREATE TABLE "CodeSharing" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordId" TEXT NOT NULL,
    "code" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL,

    CONSTRAINT "CodeSharing_pkey" PRIMARY KEY ("id")
);
