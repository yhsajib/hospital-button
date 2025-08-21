'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Get all availability periods for a cabin
export async function getCabinAvailabilities(cabinId) {
  try {
    const availabilities = await db.cabinAvailability.findMany({
      where: {
        cabinId,
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return {
      success: true,
      availabilities
    };
  } catch (error) {
    console.error('Error fetching cabin availabilities:', error);
    return {
      success: false,
      error: 'Failed to fetch availability periods'
    };
  }
}

// Get all availability periods for admin interface
export async function getAllCabinAvailabilities() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const availabilities = await db.cabinAvailability.findMany({
      include: {
        cabin: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    return {
      success: true,
      availabilities
    };
  } catch (error) {
    console.error('Error fetching all cabin availabilities:', error);
    return {
      success: false,
      error: 'Failed to fetch availability periods'
    };
  }
}

// Create a new availability period
export async function createCabinAvailability(availabilityData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const { cabinId, startDate, endDate, reason } = availabilityData;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return {
        success: false,
        error: 'End date must be after start date'
      };
    }

    // Check for overlapping availability periods
    const overlapping = await db.cabinAvailability.findFirst({
      where: {
        cabinId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gt: start } }
            ]
          },
          {
            AND: [
              { startDate: { lt: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return {
        success: false,
        error: 'This date range overlaps with an existing availability period'
      };
    }

    const availability = await db.cabinAvailability.create({
      data: {
        cabinId,
        startDate: start,
        endDate: end,
        reason: reason || null
      }
    });

    revalidatePath('/admin');
    revalidatePath('/cabins');

    return {
      success: true,
      availability
    };
  } catch (error) {
    console.error('Error creating cabin availability:', error);
    return {
      success: false,
      error: 'Failed to create availability period'
    };
  }
}

// Update an availability period
export async function updateCabinAvailability(availabilityId, availabilityData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const { startDate, endDate, reason, isActive } = availabilityData;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return {
          success: false,
          error: 'End date must be after start date'
        };
      }
    }

    const availability = await db.cabinAvailability.update({
      where: { id: availabilityId },
      data: {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(reason !== undefined && { reason }),
        ...(isActive !== undefined && { isActive })
      }
    });

    revalidatePath('/admin');
    revalidatePath('/cabins');

    return {
      success: true,
      availability
    };
  } catch (error) {
    console.error('Error updating cabin availability:', error);
    return {
      success: false,
      error: 'Failed to update availability period'
    };
  }
}

// Delete an availability period
export async function deleteCabinAvailability(availabilityId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    await db.cabinAvailability.delete({
      where: { id: availabilityId }
    });

    revalidatePath('/admin');
    revalidatePath('/cabins');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting cabin availability:', error);
    return {
      success: false,
      error: 'Failed to delete availability period'
    };
  }
}

// Check if a cabin is available for specific dates
export async function checkCabinAvailabilityWithPeriods(cabinId, checkInDate, checkOutDate) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      };
    }

    // First check if there are any availability periods defined for this cabin
    const availabilityPeriods = await db.cabinAvailability.findMany({
      where: {
        cabinId,
        isActive: true
      }
    });

    // If no availability periods are defined, fall back to booking-based availability
    if (availabilityPeriods.length === 0) {
      const conflictingBookings = await db.cabinBooking.count({
        where: {
          cabinId,
          status: {
            in: ['CONFIRMED', 'CHECKED_IN']
          },
          OR: [
            {
              AND: [
                { checkInDate: { lte: checkIn } },
                { checkOutDate: { gt: checkIn } }
              ]
            },
            {
              AND: [
                { checkInDate: { lt: checkOut } },
                { checkOutDate: { gte: checkOut } }
              ]
            },
            {
              AND: [
                { checkInDate: { gte: checkIn } },
                { checkOutDate: { lte: checkOut } }
              ]
            }
          ]
        }
      });

      return {
        success: true,
        isAvailable: conflictingBookings === 0,
        reason: conflictingBookings > 0 ? 'Cabin is already booked for these dates' : null
      };
    }

    // Check if the requested dates fall within any availability period
    const isWithinAvailablePeriod = availabilityPeriods.some(period => {
      return checkIn >= period.startDate && checkOut <= period.endDate;
    });

    if (!isWithinAvailablePeriod) {
      return {
        success: true,
        isAvailable: false,
        reason: 'Cabin is not available for the selected dates. Please choose different dates.'
      };
    }

    // If within available period, also check for conflicting bookings
    const conflictingBookings = await db.cabinBooking.count({
      where: {
        cabinId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkIn } },
              { checkOutDate: { gt: checkIn } }
            ]
          },
          {
            AND: [
              { checkInDate: { lt: checkOut } },
              { checkOutDate: { gte: checkOut } }
            ]
          },
          {
            AND: [
              { checkInDate: { gte: checkIn } },
              { checkOutDate: { lte: checkOut } }
            ]
          }
        ]
      }
    });

    return {
      success: true,
      isAvailable: conflictingBookings === 0,
      reason: conflictingBookings > 0 ? 'Cabin is already booked for these dates' : null
    };
  } catch (error) {
    console.error('Error checking cabin availability:', error);
    return {
      success: false,
      error: 'Failed to check availability'
    };
  }
}