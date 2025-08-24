-- CreateEnum
CREATE TYPE "public"."MessageType" AS ENUM ('GENERAL', 'PRESCRIPTION', 'MEDICAL_UPDATE', 'APPOINTMENT', 'BILLING', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "public"."MessagePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "public"."TestReport" ADD COLUMN     "emailNotificationSent" BOOLEAN DEFAULT false,
ADD COLUMN     "emailNotificationSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."PatientMessage" (
    "id" TEXT NOT NULL,
    "messageNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" "public"."MessageType" NOT NULL DEFAULT 'GENERAL',
    "priority" "public"."MessagePriority" NOT NULL DEFAULT 'NORMAL',
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'PENDING',
    "attachments" TEXT[],
    "adminResponse" TEXT,
    "respondedBy" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailNotificationSent" BOOLEAN DEFAULT false,
    "emailNotificationSentAt" TIMESTAMP(3),

    CONSTRAINT "PatientMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientMessage_messageNumber_key" ON "public"."PatientMessage"("messageNumber");

-- CreateIndex
CREATE INDEX "PatientMessage_patientId_createdAt_idx" ON "public"."PatientMessage"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "PatientMessage_status_createdAt_idx" ON "public"."PatientMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PatientMessage_messageType_status_idx" ON "public"."PatientMessage"("messageType", "status");

-- CreateIndex
CREATE INDEX "PatientMessage_messageNumber_idx" ON "public"."PatientMessage"("messageNumber");

-- AddForeignKey
ALTER TABLE "public"."PatientMessage" ADD CONSTRAINT "PatientMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
