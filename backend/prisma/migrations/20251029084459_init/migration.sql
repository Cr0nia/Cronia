-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordHash" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "skEncrypted" TEXT;
