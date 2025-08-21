-- CreateEnum
CREATE TYPE "public"."TestReportStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ResultStatus" AS ENUM ('NORMAL', 'ABNORMAL', 'HIGH', 'LOW', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."TestType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "normalRanges" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestReport" (
    "id" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "testTypeId" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."TestReportStatus" NOT NULL DEFAULT 'PENDING',
    "conductedBy" TEXT,
    "reviewedBy" TEXT,
    "summary" TEXT,
    "findings" TEXT,
    "recommendations" TEXT,
    "notes" TEXT,
    "reportFileUrl" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestResult" (
    "id" TEXT NOT NULL,
    "testReportId" TEXT NOT NULL,
    "parameterName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "referenceRange" TEXT,
    "status" "public"."ResultStatus" NOT NULL DEFAULT 'NORMAL',
    "method" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestType_name_key" ON "public"."TestType"("name");

-- CreateIndex
CREATE INDEX "TestType_category_isActive_idx" ON "public"."TestType"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TestReport_reportNumber_key" ON "public"."TestReport"("reportNumber");

-- CreateIndex
CREATE INDEX "TestReport_patientId_testDate_idx" ON "public"."TestReport"("patientId", "testDate");

-- CreateIndex
CREATE INDEX "TestReport_status_reportDate_idx" ON "public"."TestReport"("status", "reportDate");

-- CreateIndex
CREATE INDEX "TestReport_testTypeId_testDate_idx" ON "public"."TestReport"("testTypeId", "testDate");

-- CreateIndex
CREATE INDEX "TestReport_reportNumber_idx" ON "public"."TestReport"("reportNumber");

-- CreateIndex
CREATE INDEX "TestResult_testReportId_idx" ON "public"."TestResult"("testReportId");

-- CreateIndex
CREATE INDEX "TestResult_parameterName_idx" ON "public"."TestResult"("parameterName");

-- AddForeignKey
ALTER TABLE "public"."TestReport" ADD CONSTRAINT "TestReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestReport" ADD CONSTRAINT "TestReport_testTypeId_fkey" FOREIGN KEY ("testTypeId") REFERENCES "public"."TestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestResult" ADD CONSTRAINT "TestResult_testReportId_fkey" FOREIGN KEY ("testReportId") REFERENCES "public"."TestReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
