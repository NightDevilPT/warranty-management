-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "createdBy" UUID,
ADD COLUMN     "updatedBy" UUID;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
