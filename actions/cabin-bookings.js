'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Generate unique booking number
function generateBookingNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB${timestamp}${random}`;
}

// Calculate number of nights between dates
function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Create new cabin booking
export async function createCabinBooking(bookingData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Get user details
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Validate dates
    const checkInDate = new Date(bookingData.checkInDate);
    const checkOutDate = new Date(bookingData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return {
        success: false,
        error: 'Check-in date cannot be in the past'
      };
    }

    if (checkInDate >= checkOutDate) {
      return {
        success: false,
        error: 'Check-out date must be after check-in date'
      };
    }

    // Check cabin availability
    const conflictingBookings = await db.cabinBooking.count({
      where: {
        cabinId: bookingData.cabinId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } }
            ]
          },
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } }
            ]
          },
          {
            AND: [
              { checkInDate: { gte: checkInDate } },
              { checkOutDate: { lte: checkOutDate } }
            ]
          }
        ]
      }
    });

    if (conflictingBookings > 0) {
      return {
        success: false,
        error: 'Cabin is not available for the selected dates'
      };
    }

    // Get cabin details for pricing
    const cabin = await db.cabin.findUnique({
      where: { id: bookingData.cabinId },
      select: { pricePerNight: true, capacity: true, isActive: true }
    });

    if (!cabin || !cabin.isActive) {
      return {
        success: false,
        error: 'Cabin not found or not available'
      };
    }

    // Validate number of guests
    if (bookingData.numberOfGuests > cabin.capacity) {
      return {
        success: false,
        error: `Number of guests exceeds cabin capacity (${cabin.capacity})`
      };
    }

    // Calculate booking details
    const numberOfNights = calculateNights(checkInDate, checkOutDate);
    const totalAmount = numberOfNights * cabin.pricePerNight;

    // Create booking
    const booking = await db.cabinBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        cabinId: bookingData.cabinId,
        patientId: user.id,
        checkInDate,
        checkOutDate,
        numberOfNights,
        guestName: bookingData.guestName,
        guestPhone: bookingData.guestPhone,
        guestEmail: bookingData.guestEmail,
        numberOfGuests: parseInt(bookingData.numberOfGuests) || 1,
        totalAmount,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod
      },
      include: {
        cabin: {
          select: {
            name: true,
            type: true,
            pricePerNight: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/cabin-bookings');
    revalidatePath('/admin/cabin-bookings');

    return {
      success: true,
      booking
    };
  } catch (error) {
    console.error('Error creating cabin booking:', error);
    return {
      success: false,
      error: 'Failed to create booking'
    };
  }
}

// Get user's cabin bookings
export async function getUserCabinBookings() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const bookings = await db.cabinBooking.findMany({
      where: {
        patientId: user.id
      },
      include: {
        cabin: {
          select: {
            name: true,
            type: true,
            pricePerNight: true,
            imageUrls: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      bookings
    };
  } catch (error) {
    console.error('Error fetching user cabin bookings:', error);
    return {
      success: false,
      error: 'Failed to fetch bookings'
    };
  }
}

// Get all cabin bookings (Admin only)
export async function getAllCabinBookings(filters = {}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

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

    const { status, cabinId, dateFrom, dateTo } = filters;
    
    const whereClause = {
      ...(status && { status }),
      ...(cabinId && { cabinId }),
      ...(dateFrom && { checkInDate: { gte: new Date(dateFrom) } }),
      ...(dateTo && { checkOutDate: { lte: new Date(dateTo) } })
    };

    const bookings = await db.cabinBooking.findMany({
      where: whereClause,
      include: {
        cabin: {
          select: {
            name: true,
            type: true,
            roomNumber: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      bookings
    };
  } catch (error) {
    console.error('Error fetching all cabin bookings:', error);
    return {
      success: false,
      error: 'Failed to fetch bookings'
    };
  }
}

// Get cabin booking by ID
export async function getCabinBookingById(bookingId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const whereClause = user.role === 'ADMIN' 
      ? { id: bookingId }
      : { id: bookingId, patientId: user.id };

    const booking = await db.cabinBooking.findUnique({
      where: whereClause,
      include: {
        cabin: true,
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    return {
      success: true,
      booking
    };
  } catch (error) {
    console.error('Error fetching cabin booking:', error);
    return {
      success: false,
      error: 'Failed to fetch booking details'
    };
  }
}

// Update cabin booking status (Admin only)
export async function updateCabinBookingStatus(bookingId, newStatus, notes = '') {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

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

    const updateData = {
      status: newStatus,
      ...(notes && { notes }),
      ...(newStatus === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(newStatus === 'CANCELLED' && { cancelledAt: new Date() }),
      ...(newStatus === 'CHECKED_IN' && { checkInTime: new Date() }),
      ...(newStatus === 'CHECKED_OUT' && { checkOutTime: new Date() })
    };

    const booking = await db.cabinBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        cabin: {
          select: {
            name: true,
            type: true
          }
        },
        patient: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/admin/cabin-bookings');
    revalidatePath('/cabin-bookings');

    return {
      success: true,
      booking
    };
  } catch (error) {
    console.error('Error updating booking status:', error);
    return {
      success: false,
      error: 'Failed to update booking status'
    };
  }
}

// Cancel cabin booking
export async function cancelCabinBooking(bookingId, reason = '') {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Get booking details
    const booking = await db.cabinBooking.findUnique({
      where: { id: bookingId },
      select: {
        patientId: true,
        status: true,
        checkInDate: true
      }
    });

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    // Check permissions
    if (user.role !== 'ADMIN' && booking.patientId !== user.id) {
      return {
        success: false,
        error: 'You can only cancel your own bookings'
      };
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return {
        success: false,
        error: 'Booking is already cancelled'
      };
    }

    if (booking.status === 'CHECKED_OUT') {
      return {
        success: false,
        error: 'Cannot cancel completed booking'
      };
    }

    // Update booking status
    const updatedBooking = await db.cabinBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
      },
      include: {
        cabin: {
          select: {
            name: true,
            type: true
          }
        }
      }
    });

    revalidatePath('/cabin-bookings');
    revalidatePath('/admin/cabin-bookings');

    return {
      success: true,
      booking: updatedBooking
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: 'Failed to cancel booking'
    };
  }
}

// Update payment status (Admin only)
export async function updatePaymentStatus(bookingId, paymentStatus, paidAmount = 0) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

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

    const updateData = {
      paymentStatus,
      ...(paidAmount > 0 && { paidAmount: parseFloat(paidAmount) }),
      ...(paymentStatus === 'PAID' && { paidAt: new Date() })
    };

    const booking = await db.cabinBooking.update({
      where: { id: bookingId },
      data: updateData
    });

    revalidatePath('/admin/cabin-bookings');

    return {
      success: true,
      booking
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      success: false,
      error: 'Failed to update payment status'
    };
  }
}

// Get booking statistics (Admin only)
export async function getCabinBookingStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

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

    const [totalBookings, pendingBookings, confirmedBookings, cancelledBookings, totalRevenue] = await Promise.all([
      db.cabinBooking.count(),
      db.cabinBooking.count({ where: { status: 'PENDING' } }),
      db.cabinBooking.count({ where: { status: 'CONFIRMED' } }),
      db.cabinBooking.count({ where: { status: 'CANCELLED' } }),
      db.cabinBooking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { paidAmount: true }
      })
    ]);

    return {
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue._sum.paidAmount || 0
      }
    };
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return {
      success: false,
      error: 'Failed to fetch booking statistics'
    };
  }
}