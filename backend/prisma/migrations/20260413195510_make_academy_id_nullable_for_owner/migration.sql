-- DropForeignKey
ALTER TABLE "user_academy_roles" DROP CONSTRAINT "user_academy_roles_academy_id_fkey";

-- AlterTable
ALTER TABLE "user_academy_roles" ALTER COLUMN "academy_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_academy_roles" ADD CONSTRAINT "user_academy_roles_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
