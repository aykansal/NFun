/*
  Warnings:

  - The primary key for the `NftDetail` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `NftDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NftDetail" DROP CONSTRAINT "NftDetail_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "NftDetail_pkey" PRIMARY KEY ("nftAddress");
