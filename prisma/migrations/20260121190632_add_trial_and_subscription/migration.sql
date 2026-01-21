-- AlterTable
ALTER TABLE "User" ADD COLUMN     "estimateCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "trialUsed" BOOLEAN NOT NULL DEFAULT false;
