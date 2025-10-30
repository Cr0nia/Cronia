/*
  Warnings:

  - You are about to drop the column `tx` on the `PoolAdvance` table. All the data in the column will be lost.
  - Added the required column `poolPda` to the `PoolAdvance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PoolAdvance" DROP COLUMN "tx",
ADD COLUMN     "poolPda" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "txSignature" TEXT,
ALTER COLUMN "grossUsdc" DROP NOT NULL,
ALTER COLUMN "discountUsdc" DROP NOT NULL,
ALTER COLUMN "netUsdc" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PoolAdvance" ADD CONSTRAINT "PoolAdvance_notePda_fkey" FOREIGN KEY ("notePda") REFERENCES "ReceivableNote"("notePda") ON DELETE RESTRICT ON UPDATE CASCADE;
