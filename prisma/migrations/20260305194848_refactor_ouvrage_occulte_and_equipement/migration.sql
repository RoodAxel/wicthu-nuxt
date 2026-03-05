/*
  Warnings:

  - You are about to drop the column `categorie` on the `equipement_classique` table. All the data in the column will be lost.
  - You are about to drop the column `prix_base` on the `equipement_classique` table. All the data in the column will be lost.
  - You are about to drop the column `prix_max` on the `equipement_classique` table. All the data in the column will be lost.
  - You are about to drop the column `superieur` on the `equipement_classique` table. All the data in the column will be lost.
  - You are about to drop the column `unite` on the `equipement_classique` table. All the data in the column will be lost.
  - You are about to drop the column `categorie` on the `equipement_moderne` table. All the data in the column will be lost.
  - You are about to drop the column `prix_base` on the `equipement_moderne` table. All the data in the column will be lost.
  - You are about to drop the column `prix_max` on the `equipement_moderne` table. All the data in the column will be lost.
  - You are about to drop the column `superieur` on the `equipement_moderne` table. All the data in the column will be lost.
  - You are about to drop the column `unite` on the `equipement_moderne` table. All the data in the column will be lost.
  - You are about to drop the column `auteur` on the `ouvrage_occulte` table. All the data in the column will be lost.
  - You are about to drop the column `gain_occultisme` on the `ouvrage_occulte` table. All the data in the column will be lost.
  - You are about to drop the column `langue` on the `ouvrage_occulte` table. All the data in the column will be lost.
  - You are about to drop the column `sante_mental` on the `ouvrage_occulte` table. All the data in the column will be lost.
  - You are about to drop the column `titre` on the `ouvrage_occulte` table. All the data in the column will be lost.
  - Added the required column `base_price` to the `equipement_classique` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superior` to the `equipement_classique` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_price` to the `equipement_moderne` table without a default value. This is not possible if the table is not empty.
  - Added the required column `superior` to the `equipement_moderne` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "equipement_classique" DROP COLUMN "categorie",
DROP COLUMN "prix_base",
DROP COLUMN "prix_max",
DROP COLUMN "superieur",
DROP COLUMN "unite",
ADD COLUMN     "base_price" REAL NOT NULL,
ADD COLUMN     "category" VARCHAR(255),
ADD COLUMN     "max_price" REAL,
ADD COLUMN     "superior" BOOLEAN NOT NULL,
ADD COLUMN     "unit" VARCHAR(255);

-- AlterTable
ALTER TABLE "equipement_moderne" DROP COLUMN "categorie",
DROP COLUMN "prix_base",
DROP COLUMN "prix_max",
DROP COLUMN "superieur",
DROP COLUMN "unite",
ADD COLUMN     "base_price" REAL NOT NULL,
ADD COLUMN     "category" VARCHAR(255),
ADD COLUMN     "max_price" REAL,
ADD COLUMN     "superior" BOOLEAN NOT NULL,
ADD COLUMN     "unit" VARCHAR(255);

-- AlterTable
ALTER TABLE "ouvrage_occulte" DROP COLUMN "auteur",
DROP COLUMN "gain_occultisme",
DROP COLUMN "langue",
DROP COLUMN "sante_mental",
DROP COLUMN "titre",
ADD COLUMN     "author" VARCHAR(255),
ADD COLUMN     "language" VARCHAR(255),
ADD COLUMN     "occult_gain" INTEGER,
ADD COLUMN     "sanity" VARCHAR(255),
ADD COLUMN     "title" VARCHAR(255);
