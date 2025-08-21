-- CreateTable
CREATE TABLE "public"."CabinAvailability" (
    "id" TEXT NOT NULL,
    "cabinId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CabinAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CabinAvailability_cabinId_startDate_endDate_idx" ON "public"."CabinAvailability"("cabinId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "CabinAvailability_startDate_endDate_idx" ON "public"."CabinAvailability"("startDate", "endDate");

-- AddForeignKey
ALTER TABLE "public"."CabinAvailability" ADD CONSTRAINT "CabinAvailability_cabinId_fkey" FOREIGN KEY ("cabinId") REFERENCES "public"."Cabin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
