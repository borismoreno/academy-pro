-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'partial';

-- AlterTable
ALTER TABLE "payment_records" ADD COLUMN     "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
