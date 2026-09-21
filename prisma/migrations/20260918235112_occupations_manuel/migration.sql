-- CreateEnum
CREATE TYPE "OccupationEra" AS ENUM ('CLASSIQUE', 'MODERNE');
-- AlterTable
ALTER TABLE "OccupationSkillOption" ADD COLUMN     "specName" VARCHAR(255);
-- AlterTable
ALTER TABLE "occupation" ADD COLUMN     "autre_name" VARCHAR(255)[],
ADD COLUMN     "contacts" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "era" "OccupationEra",
ADD COLUMN     "note" TEXT,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "slug" VARCHAR(255),
ADD COLUMN     "voir_aussi" VARCHAR(255)[];
-- CreateIndex
CREATE UNIQUE INDEX "occupation_slug_key" ON "occupation"("slug");
-- AddForeignKey
ALTER TABLE "occupation" ADD CONSTRAINT "occupation_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "occupation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
