/*
  Warnings:

  - You are about to drop the column `height` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `qualityLevel` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `wasteBuffer` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `wasteBufferPercentage` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Estimate` table. All the data in the column will be lost.
  - Added the required column `contingency` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materialCost` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `Estimate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Estimate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "totalCost" REAL NOT NULL,
    "materialCost" REAL NOT NULL,
    "laborCost" REAL NOT NULL DEFAULT 0,
    "equipmentCost" REAL NOT NULL DEFAULT 0,
    "contingency" REAL NOT NULL,
    "materials" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Estimate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Estimate" ("createdAt", "currency", "id", "location", "materials", "updatedAt", "userId") SELECT "createdAt", "currency", "id", "location", "materials", "updatedAt", "userId" FROM "Estimate";
DROP TABLE "Estimate";
ALTER TABLE "new_Estimate" RENAME TO "Estimate";
CREATE INDEX "Estimate_userId_idx" ON "Estimate"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
