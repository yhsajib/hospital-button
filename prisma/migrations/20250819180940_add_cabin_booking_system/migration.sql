-- CreateEnum
CREATE TYPE "public"."CabinType" AS ENUM ('STANDARD', 'DELUXE', 'SUITE', 'VIP', 'ICU', 'PRIVATE_ROOM');

-- CreateEnum
CREATE TYPE "public"."CabinBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "public"."Cabin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "public"."CabinType" NOT NULL DEFAULT 'STANDARD',
    "capacity" INTEGER NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "amenities" TEXT[],
    "imageUrls" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "floor" TEXT,
    "wing" TEXT,
    "roomNumber" TEXT,
    "hasPrivateBathroom" BOOLEAN NOT NULL DEFAULT false,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "hasWifi" BOOLEAN NOT NULL DEFAULT true,
    "hasTV" BOOLEAN NOT NULL DEFAULT false,
    "hasRefrigerator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cabin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CabinBooking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "cabinId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL,
    "checkOutDate" TIMESTAMP(3) NOT NULL,
    "numberOfNights" INTEGER NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "guestEmail" TEXT,
    "numberOfGuests" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."CabinBookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "specialRequests" TEXT,
    "notes" TEXT,
    "bookedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CabinBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cabin_type_isActive_idx" ON "public"."Cabin"("type", "isActive");

-- CreateIndex
CREATE INDEX "Cabin_pricePerNight_idx" ON "public"."Cabin"("pricePerNight");

-- CreateIndex
CREATE UNIQUE INDEX "CabinBooking_bookingNumber_key" ON "public"."CabinBooking"("bookingNumber");

-- CreateIndex
CREATE INDEX "CabinBooking_status_checkInDate_idx" ON "public"."CabinBooking"("status", "checkInDate");

-- CreateIndex
CREATE INDEX "CabinBooking_patientId_status_idx" ON "public"."CabinBooking"("patientId", "status");

-- CreateIndex
CREATE INDEX "CabinBooking_cabinId_checkInDate_idx" ON "public"."CabinBooking"("cabinId", "checkInDate");

-- CreateIndex
CREATE INDEX "CabinBooking_bookingNumber_idx" ON "public"."CabinBooking"("bookingNumber");

-- AddForeignKey
ALTER TABLE "public"."CabinBooking" ADD CONSTRAINT "CabinBooking_cabinId_fkey" FOREIGN KEY ("cabinId") REFERENCES "public"."Cabin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CabinBooking" ADD CONSTRAINT "CabinBooking_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
