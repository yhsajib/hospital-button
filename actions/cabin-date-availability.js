'use server';

import { db } from '@/lib/prisma';

// Get available date ranges for a cabin
export async function getCabinAvailableDateRanges(cabinId) {
  try {
    // Get all availability periods for this cabin
    const availabilityPeriods = await db.cabinAvailability.findMany({
      where: {
        cabinId,
        isActive: true,
        endDate: {
          gte: new Date() // Only future/current periods
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // If no availability periods are defined, return null (no restrictions)
    if (availabilityPeriods.length === 0) {
      return {
        success: true,
        hasRestrictions: false,
        availableRanges: null
      };
    }

    // Get all confirmed bookings for this cabin
    const confirmedBookings = await db.cabinBooking.findMany({
      where: {
        cabinId,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN']
        },
        checkOutDate: {
          gte: new Date() // Only future/current bookings
        }
      },
      select: {
        checkInDate: true,
        checkOutDate: true
      },
      orderBy: {
        checkInDate: 'asc'
      }
    });

    // For each availability period, subtract the booked dates
    const availableRanges = [];
    
    for (const period of availabilityPeriods) {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      
      // Find bookings that overlap with this period
      const overlappingBookings = confirmedBookings.filter(booking => {
        const bookingStart = new Date(booking.checkInDate);
        const bookingEnd = new Date(booking.checkOutDate);
        
        return (
          (bookingStart >= periodStart && bookingStart < periodEnd) ||
          (bookingEnd > periodStart && bookingEnd <= periodEnd) ||
          (bookingStart <= periodStart && bookingEnd >= periodEnd)
        );
      });
      
      if (overlappingBookings.length === 0) {
        // No bookings in this period, entire period is available
        availableRanges.push({
          startDate: periodStart.toISOString().split('T')[0],
          endDate: periodEnd.toISOString().split('T')[0]
        });
      } else {
        // Split the period around bookings
        let currentStart = periodStart;
        
        // Sort bookings by start date
        overlappingBookings.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
        
        for (const booking of overlappingBookings) {
          const bookingStart = new Date(booking.checkInDate);
          const bookingEnd = new Date(booking.checkOutDate);
          
          // If there's a gap before this booking
          if (currentStart < bookingStart) {
            availableRanges.push({
              startDate: currentStart.toISOString().split('T')[0],
              endDate: new Date(bookingStart.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
          }
          
          // Move current start to after this booking
          currentStart = new Date(Math.max(currentStart.getTime(), bookingEnd.getTime()));
        }
        
        // If there's remaining time after the last booking
        if (currentStart < periodEnd) {
          availableRanges.push({
            startDate: currentStart.toISOString().split('T')[0],
            endDate: periodEnd.toISOString().split('T')[0]
          });
        }
      }
    }

    return {
      success: true,
      hasRestrictions: true,
      availableRanges: availableRanges.filter(range => 
        new Date(range.startDate) < new Date(range.endDate)
      )
    };
  } catch (error) {
    console.error('Error getting cabin available date ranges:', error);
    return {
      success: false,
      error: 'Failed to get available date ranges'
    };
  }
}

// Check if a specific date is available for booking
export async function isDateAvailableForBooking(cabinId, date) {
  try {
    const dateRanges = await getCabinAvailableDateRanges(cabinId);
    
    if (!dateRanges.success) {
      return { success: false, error: dateRanges.error };
    }
    
    // If no restrictions, date is available
    if (!dateRanges.hasRestrictions) {
      return { success: true, isAvailable: true };
    }
    
    const checkDate = new Date(date);
    const isAvailable = dateRanges.availableRanges.some(range => {
      const rangeStart = new Date(range.startDate);
      const rangeEnd = new Date(range.endDate);
      return checkDate >= rangeStart && checkDate <= rangeEnd;
    });
    
    return {
      success: true,
      isAvailable
    };
  } catch (error) {
    console.error('Error checking date availability:', error);
    return {
      success: false,
      error: 'Failed to check date availability'
    };
  }
}

// Get disabled dates for date picker (dates that should be disabled)
export async function getDisabledDatesForCabin(cabinId) {
  try {
    const dateRanges = await getCabinAvailableDateRanges(cabinId);
    
    if (!dateRanges.success) {
      return { success: false, error: dateRanges.error };
    }
    
    // If no restrictions, no dates are disabled
    if (!dateRanges.hasRestrictions) {
      return {
        success: true,
        disabledDates: [],
        hasRestrictions: false
      };
    }
    
    // Generate list of disabled dates
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    const disabledDates = [];
    const currentDate = new Date(today);
    
    while (currentDate <= oneYearFromNow) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isAvailable = dateRanges.availableRanges.some(range => {
        return dateStr >= range.startDate && dateStr <= range.endDate;
      });
      
      if (!isAvailable) {
        disabledDates.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      success: true,
      disabledDates,
      hasRestrictions: true,
      availableRanges: dateRanges.availableRanges
    };
  } catch (error) {
    console.error('Error getting disabled dates:', error);
    return {
      success: false,
      error: 'Failed to get disabled dates'
    };
  }
}