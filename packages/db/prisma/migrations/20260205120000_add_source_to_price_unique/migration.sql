-- DropIndex
DROP INDEX IF EXISTS "prices_partId_generationId_key";

-- CreateIndex (новый уникальный ключ с source)
CREATE UNIQUE INDEX "prices_partId_generationId_source_key" ON "prices"("partId", "generationId", "source");
