/*
  Warnings:

  - You are about to drop the column `nftDetailId` on the `meme` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "meme" DROP CONSTRAINT "meme_nftDetailId_fkey";

-- AlterTable
ALTER TABLE "meme" DROP COLUMN "nftDetailId",
ADD COLUMN     "nftAddress" TEXT;

-- AddForeignKey
ALTER TABLE "meme" ADD CONSTRAINT "meme_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NftDetail"("nftAddress") ON DELETE SET NULL ON UPDATE CASCADE;
