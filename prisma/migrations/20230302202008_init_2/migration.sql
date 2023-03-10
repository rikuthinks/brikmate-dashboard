/*
  Warnings:

  - Made the column `propertyAddress` on table `Lease` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lease" ALTER COLUMN "propertyAddress" SET NOT NULL;
