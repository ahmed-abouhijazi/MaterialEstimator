-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredCountry" TEXT NOT NULL DEFAULT 'US',
ADD COLUMN     "preferredCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en';
