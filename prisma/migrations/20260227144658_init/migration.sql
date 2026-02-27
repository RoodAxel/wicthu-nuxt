-- CreateTable
CREATE TABLE "Competence" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" BIGINT,
    "base_value" SMALLINT,
    "is_category" BOOLEAN,
    "modern" BOOLEAN,

    CONSTRAINT "Competence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Competence" ADD CONSTRAINT "Competence_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Competence"("id") ON DELETE SET NULL ON UPDATE CASCADE;
