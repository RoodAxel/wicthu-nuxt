/*
  Warnings:

  - The primary key for the `Competence` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Competence` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `category_id` on the `Competence` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- DropForeignKey
ALTER TABLE "Competence" DROP CONSTRAINT "Competence_category_id_fkey";

-- AlterTable
ALTER TABLE "Competence" DROP CONSTRAINT "Competence_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER,
ALTER COLUMN "category_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "Competence_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Competence" ADD CONSTRAINT "Competence_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Competence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
