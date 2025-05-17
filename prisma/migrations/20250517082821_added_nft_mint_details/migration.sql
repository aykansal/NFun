-- AlterTable
ALTER TABLE "meme" ADD COLUMN     "nftDetailId" INTEGER,
ALTER COLUMN "txnhash" SET DEFAULT '';

-- CreateTable
CREATE TABLE "NftDetail" (
    "id" SERIAL NOT NULL,
    "nftAddress" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "transactionSignature" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "ownerAddress" TEXT,

    CONSTRAINT "NftDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NftDetail_nftAddress_key" ON "NftDetail"("nftAddress");

-- CreateIndex
CREATE UNIQUE INDEX "NftDetail_transactionSignature_key" ON "NftDetail"("transactionSignature");

-- AddForeignKey
ALTER TABLE "meme" ADD CONSTRAINT "meme_nftDetailId_fkey" FOREIGN KEY ("nftDetailId") REFERENCES "NftDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
