'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Get all cabins with optional filtering
export async function getCabins(filters = {}) {
  try {
    const { type, minPrice, maxPrice, capacity, amenities, isActive = true } = filters;
    
    const whereClause = {
      isActive,
      ...(type && { type }),
      ...(capacity && { capacity: { gte: parseInt(capacity) } }),
      ...(minPrice && { pricePerNight: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { pricePerNight: { lte: parseFloat(maxPrice) } }),
      ...(amenities && amenities.length > 0 && {
        amenities: {
          hasEvery: amenities
        }
      })
    };

    const cabins = await db.cabin.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: {
                  in: ['CONFIRMED', 'CHECKED_IN']
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      cabins: cabins.map(cabin => ({
        ...cabin,
        isAvailable: cabin._count.bookings === 0
      }))
    };
  } catch (error) {
    console.error('Error fetching cabins:', error);
    return {
      success: false,
      error: 'Failed to fetch cabins'
    };
  }
}

// Get cabin by ID
export async function getCabinById(cabinId) {
  try {
    const cabin = await db.cabin.findUnique({
      where: { id: cabinId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'CHECKED_IN']
            }
          },
          select: {
            checkInDate: true,
            checkOutDate: true,
            status: true
          }
        }
      }
    });

    if (!cabin) {
      return {
        success: false,
        error: 'Cabin not found'
      };
    }

    return {
      success: true,
      cabin
    };
  } catch (error) {
    console.error('Error fetching cabin:', error);
    return {
      success: false,
      error: 'Failed to fetch cabin details'
    };
  }
}

// Create new cabin (Admin only)
export async function createCabin(cabinData) {
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
      where: { clerkUserId: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const cabin = await db.cabin.create({
      data: {
        name: cabinData.name,
        description: cabinData.description,
        type: cabinData.type,
        capacity: parseInt(cabinData.capacity),
        pricePerNight: parseFloat(cabinData.pricePerNight),
        amenities: cabinData.amenities || [],
        imageUrls: cabinData.imageUrls || [],
        floor: cabinData.floor,
        wing: cabinData.wing,
        roomNumber: cabinData.roomNumber,
        hasPrivateBathroom: cabinData.hasPrivateBathroom || false,
        hasAirConditioning: cabinData.hasAirConditioning || false,
        hasWifi: cabinData.hasWifi || true,
        hasTV: cabinData.hasTV || false,
        hasRefrigerator: cabinData.hasRefrigerator || false
      }
    });

    revalidatePath('/admin/cabins');
    revalidatePath('/cabins');

    return {
      success: true,
      cabin
    };
  } catch (error) {
    console.error('Error creating cabin:', error);
    return {
      success: false,
      error: 'Failed to create cabin'
    };
  }
}

// Update cabin (Admin only)
export async function updateCabin(cabinId, cabinData) {
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
      where: { clerkUserId: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const cabin = await db.cabin.update({
      where: { id: cabinId },
      data: {
        name: cabinData.name,
        description: cabinData.description,
        type: cabinData.type,
        capacity: parseInt(cabinData.capacity),
        pricePerNight: parseFloat(cabinData.pricePerNight),
        amenities: cabinData.amenities || [],
        imageUrls: cabinData.imageUrls || [],
        location: cabinData.location,
        floor: cabinData.floor,
        wing: cabinData.wing,
        roomNumber: cabinData.roomNumber,
        hasPrivateBathroom: cabinData.hasPrivateBathroom || false,
        hasAirConditioning: cabinData.hasAirConditioning || false,
        hasWifi: cabinData.hasWifi || true,
        hasTV: cabinData.hasTV || false,
        hasRefrigerator: cabinData.hasRefrigerator || false,
        isActive: cabinData.isActive !== undefined ? cabinData.isActive : true
      }
    });

    revalidatePath('/admin/cabins');
    revalidatePath('/cabins');
    revalidatePath(`/cabins/${cabinId}`);

    return {
      success: true,
      cabin
    };
  } catch (error) {
    console.error('Error updating cabin:', error);
    return {
      success: false,
      error: 'Failed to update cabin'
    };
  }
}

// Delete cabin (Admin only)
export async function deleteCabin(cabinId) {
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
      where: { clerkUserId: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    // Check if cabin has active bookings
    const activeBookings = await db.cabinBooking.count({
      where: {
        cabinId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        }
      }
    });

    if (activeBookings > 0) {
      return {
        success: false,
        error: 'Cannot delete cabin with active bookings'
      };
    }

    await db.cabin.delete({
      where: { id: cabinId }
    });

    revalidatePath('/admin/cabins');
    revalidatePath('/cabins');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting cabin:', error);
    return {
      success: false,
      error: 'Failed to delete cabin'
    };
  }
}

// Check cabin availability for specific dates
export async function checkCabinAvailability(cabinId, checkInDate, checkOutDate) {
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

    // If availability periods are defined, check if dates fall within them
    if (availabilityPeriods.length > 0) {
      const isWithinAvailablePeriod = availabilityPeriods.some(period => {
        return checkIn >= period.startDate && checkOut <= period.endDate;
      });

      if (!isWithinAvailablePeriod) {
        return {
          success: true,
          isAvailable: false,
          reason: 'Selected dates are outside the available booking periods.'
        };
      }
    }

    // Check for conflicting bookings
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

// Get available cabins for specific dates
export async function getAvailableCabins(checkInDate, checkOutDate, filters = {}) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      };
    }

    const { type, minPrice, maxPrice, capacity, amenities } = filters;
    
    const whereClause = {
      isActive: true,
      ...(type && { type }),
      ...(capacity && { capacity: { gte: parseInt(capacity) } }),
      ...(minPrice && { pricePerNight: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { pricePerNight: { lte: parseFloat(maxPrice) } }),
      ...(amenities && amenities.length > 0 && {
        amenities: {
          hasEvery: amenities
        }
      })
    };

    // Get all cabins that match the criteria
    const allCabins = await db.cabin.findMany({
      where: whereClause,
      orderBy: {
        pricePerNight: 'asc'
      }
    });

    // Filter out cabins with conflicting bookings and check availability periods
    const availableCabins = [];
    
    for (const cabin of allCabins) {
      // First check if there are any availability periods defined for this cabin
      const availabilityPeriods = await db.cabinAvailability.findMany({
        where: {
          cabinId: cabin.id,
          isActive: true
        }
      });

      // If availability periods are defined, check if dates fall within them
      if (availabilityPeriods.length > 0) {
        const isWithinAvailablePeriod = availabilityPeriods.some(period => {
          return checkIn >= period.startDate && checkOut <= period.endDate;
        });

        if (!isWithinAvailablePeriod) {
          continue; // Skip this cabin as it's not available for these dates
        }
      }

      // Check for conflicting bookings
      const conflictingBookings = await db.cabinBooking.count({
        where: {
          cabinId: cabin.id,
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

      if (conflictingBookings === 0) {
        availableCabins.push(cabin);
      }
    }

    return {
      success: true,
      cabins: availableCabins
    };
  } catch (error) {
    console.error('Error fetching available cabins:', error);
    return {
      success: false,
      error: 'Failed to fetch available cabins'
    };
  }
}