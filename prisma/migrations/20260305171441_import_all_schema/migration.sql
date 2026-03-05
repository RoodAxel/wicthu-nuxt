-- CreateTable
CREATE TABLE "arme" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "competenceArme" INTEGER NOT NULL,
    "damage" VARCHAR(255),
    "average_dmg" VARCHAR(255),
    "range" VARCHAR(255),
    "cadence" VARCHAR(255),
    "capacity" VARCHAR(255),
    "failure" INTEGER,
    "classic_price" REAL,
    "modern_price" REAL,
    "epoque" VARCHAR(255)[],
    "image_url" VARCHAR(255),
    "competence_id" INTEGER,

    CONSTRAINT "arme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artefact" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "use_by" VARCHAR(255),
    "description" TEXT,
    "image_url" VARCHAR(255),

    CONSTRAINT "artefact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristique" (
    "id" SERIAL NOT NULL,
    "entite_id" INTEGER,
    "name_caracteristique" VARCHAR(255) NOT NULL,
    "valeur" INTEGER,
    "formule_jet" VARCHAR(255),

    CONSTRAINT "caracteristique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_entite" (
    "id" SERIAL NOT NULL,
    "entite_id" INTEGER,
    "name_competence" VARCHAR(255) NOT NULL,
    "valeur_competence" INTEGER NOT NULL,

    CONSTRAINT "competence_entite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entite" (
    "id" SERIAL NOT NULL,
    "categorie" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "titre" VARCHAR(255),
    "citation" VARCHAR(255),
    "description" VARCHAR(255),
    "point_vie_moyen" INTEGER,
    "impact_moyen" VARCHAR(255),
    "carrure_moyen" INTEGER,
    "point_magie_moyen" INTEGER,
    "mouvement" INTEGER,
    "attaque_round" INTEGER,
    "protection" VARCHAR(255),
    "perte_sante_mental" VARCHAR(255),
    "image_url" VARCHAR(255),
    "caracteristique_id" INTEGER,
    "competence_entite_id" INTEGER,
    "option_combat_id" INTEGER,
    "pouvoir_distinctif_id" INTEGER,
    "specialite_divinit_id" INTEGER,

    CONSTRAINT "entite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entite_caracteristique" (
    "entite_model_id" INTEGER NOT NULL,
    "caracteristique_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "entite_competence_entite" (
    "entite_model_id" INTEGER NOT NULL,
    "competence_entite_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "entite_option_combat" (
    "entite_model_id" INTEGER NOT NULL,
    "option_combat_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "entite_pouvoir_distinctif" (
    "entite_model_id" INTEGER NOT NULL,
    "pouvoir_distinctif_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "entite_specialite_divinit" (
    "entite_model_id" INTEGER NOT NULL,
    "specialite_divinit_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "equipement_classique" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "categorie" VARCHAR(255),
    "prix_base" REAL NOT NULL,
    "prix_max" REAL,
    "unite" VARCHAR(255),
    "superieur" BOOLEAN NOT NULL,

    CONSTRAINT "equipement_classique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipement_moderne" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "categorie" VARCHAR(255),
    "prix_base" REAL NOT NULL,
    "prix_max" REAL,
    "unite" VARCHAR(255),
    "superieur" BOOLEAN NOT NULL,

    CONSTRAINT "equipement_moderne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manie" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "manie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "competences" TEXT,
    "credit_min" INTEGER,
    "credit_max" INTEGER,
    "point_competence" VARCHAR(255),

    CONSTRAINT "occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_combat" (
    "id" SERIAL NOT NULL,
    "entite_id" INTEGER,
    "name_option" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "effet" VARCHAR(255),

    CONSTRAINT "option_combat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ouvrage_mythe" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "langue" VARCHAR(255),
    "date" VARCHAR(255),
    "auteur" VARCHAR(255),
    "description" VARCHAR(255),
    "sante_mental" VARCHAR(255),
    "gain_mythe_initial" INTEGER,
    "gain_mythe_complet" INTEGER,
    "mythe_cthulhu" INTEGER,
    "semaine" INTEGER,

    CONSTRAINT "ouvrage_mythe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ouvrage_occulte" (
    "id" SERIAL NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "langue" VARCHAR(255),
    "date" VARCHAR(255),
    "auteur" VARCHAR(255),
    "info" VARCHAR(255),
    "description" TEXT,
    "sante_mental" VARCHAR(255),
    "gain_occultisme" INTEGER,

    CONSTRAINT "ouvrage_occulte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ouvrage_sort" (
    "id" SERIAL NOT NULL,
    "ouvrage_id" INTEGER,
    "sort_id" INTEGER,
    "name_dans_ouvrage" VARCHAR(255),

    CONSTRAINT "ouvrage_sort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phobie" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "phobie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pouvoir_distinctif" (
    "id" SERIAL NOT NULL,
    "entite_id" INTEGER,
    "name_pouvoir" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "pouvoir_distinctif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sort" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cout" VARCHAR(255) NOT NULL,
    "temps_incantation" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "autre_name" VARCHAR(255)[],

    CONSTRAINT "sort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialite_divinite" (
    "id" SERIAL NOT NULL,
    "entite_id" INTEGER,
    "culte_et_adoration" VARCHAR(255),
    "autres_particularites" VARCHAR(255),

    CONSTRAINT "specialite_divinite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ukciqjegkwib9dvmrs4fxcrj9ww" ON "entite_caracteristique"("caracteristique_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk8mrgti7fddfop1tdohn14o8pa" ON "entite_competence_entite"("competence_entite_id");

-- CreateIndex
CREATE UNIQUE INDEX "ukc64s196ih7dj16q1q4hmlr3pi" ON "entite_option_combat"("option_combat_id");

-- CreateIndex
CREATE UNIQUE INDEX "ukjkog3cij2v0urfclecx193qan" ON "entite_pouvoir_distinctif"("pouvoir_distinctif_id");

-- CreateIndex
CREATE UNIQUE INDEX "uke3xd6i7okobrev2g6dq9159ff" ON "entite_specialite_divinit"("specialite_divinit_id");

-- AddForeignKey
ALTER TABLE "arme" ADD CONSTRAINT "fk3rjdk0p7fs5t2u0mtk27vmcy0" FOREIGN KEY ("competence_id") REFERENCES "Competence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "arme" ADD CONSTRAINT "fk_competenceArme_competence" FOREIGN KEY ("competenceArme") REFERENCES "Competence"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "caracteristique" ADD CONSTRAINT "fk_caracteristique_entite" FOREIGN KEY ("entite_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "competence_entite" ADD CONSTRAINT "fk_competenceEntite_entite" FOREIGN KEY ("entite_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite" ADD CONSTRAINT "fk1y8piphtncq9ra0ntm2n7oa61" FOREIGN KEY ("option_combat_id") REFERENCES "option_combat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite" ADD CONSTRAINT "fk4um592yl1ggoknmy2npai1iwp" FOREIGN KEY ("pouvoir_distinctif_id") REFERENCES "pouvoir_distinctif"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite" ADD CONSTRAINT "fk8ho6ffnat9ju3vudvm3lxglik" FOREIGN KEY ("specialite_divinit_id") REFERENCES "specialite_divinite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite" ADD CONSTRAINT "fkhv1qo28ec4ucel6dedkm2bap8" FOREIGN KEY ("competence_entite_id") REFERENCES "competence_entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite" ADD CONSTRAINT "fkkqj06sa5hiibj2i0bm1il7afv" FOREIGN KEY ("caracteristique_id") REFERENCES "caracteristique"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_caracteristique" ADD CONSTRAINT "fk4o4niilsi663y9o66tc6x2sr2" FOREIGN KEY ("caracteristique_id") REFERENCES "caracteristique"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_caracteristique" ADD CONSTRAINT "fkb2rgectrhokldmsn63dxsbo0t" FOREIGN KEY ("entite_model_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_competence_entite" ADD CONSTRAINT "fk6w0fjoemkdkberbe6fky5upem" FOREIGN KEY ("competence_entite_id") REFERENCES "competence_entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_competence_entite" ADD CONSTRAINT "fko60yehnrtw8td996kdo8p8d9k" FOREIGN KEY ("entite_model_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_option_combat" ADD CONSTRAINT "fk7l61141pjdj160thvao0968qe" FOREIGN KEY ("entite_model_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_option_combat" ADD CONSTRAINT "fka8duca3s4mv03aifimx9obvc8" FOREIGN KEY ("option_combat_id") REFERENCES "option_combat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_pouvoir_distinctif" ADD CONSTRAINT "fkp8j90dko825hh6g7p73p428o4" FOREIGN KEY ("entite_model_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_pouvoir_distinctif" ADD CONSTRAINT "fkt04qit36lsxyl8edswnr3bih7" FOREIGN KEY ("pouvoir_distinctif_id") REFERENCES "pouvoir_distinctif"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_specialite_divinit" ADD CONSTRAINT "fkalq49dn9p31cg45nn91o9vw1l" FOREIGN KEY ("entite_model_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entite_specialite_divinit" ADD CONSTRAINT "fkip01axto1v6ihpr474h056lk4" FOREIGN KEY ("specialite_divinit_id") REFERENCES "specialite_divinite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_combat" ADD CONSTRAINT "fk_optionCombat_entite" FOREIGN KEY ("entite_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ouvrage_sort" ADD CONSTRAINT "fk_ouvrageSort_ouvrageId" FOREIGN KEY ("ouvrage_id") REFERENCES "ouvrage_mythe"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ouvrage_sort" ADD CONSTRAINT "fk_ouvrageSort_sortId" FOREIGN KEY ("sort_id") REFERENCES "sort"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pouvoir_distinctif" ADD CONSTRAINT "fk_pouvoirDistinctif_entite" FOREIGN KEY ("entite_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "specialite_divinite" ADD CONSTRAINT "fk_specialiteDivinite_entiteId" FOREIGN KEY ("entite_id") REFERENCES "entite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
