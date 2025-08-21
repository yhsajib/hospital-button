'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCabinById, checkCabinAvailability } from '@/actions/cabins';
import { createCabinBooking } from '@/actions/cabin-bookings';
import { getCabinAvailableDateRanges } from '@/actions/cabin-date-availability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarIcon,
  DollarSignIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const CABIN_TYPES = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  VIP: 'VIP',
  ICU: 'ICU',
  PRIVATE_ROOM: 'Private Room'
};

function BookingSummary({ cabin, bookingDetails, availability }) {
  if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
    return null;
  }
  const checkIn = new Date(bookingDetails.checkInDate);
  const checkOut = new Date(bookingDetails.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const subtotal = nights * cabin.pricePerNight;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSignIcon className="h-5 w-5" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Check-in:</span>
            <span className="font-medium">{checkIn.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Check-out:</span>
            <span className="font-medium">{checkOut.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Duration:</span>
            <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>${cabin.pricePerNight} × {nights} nights</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />
        
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-green-600">${total.toFixed(2)}</span>
        </div>

        {availability && !availability.available && (
          
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              This cabin is not available for the selected dates. Please choose different dates.
            </AlertDescription>
          </Alert>
        )}

       
        
        {availability && availability.available && (
          <Alert>
            <CheckCircleIcon className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Great! This cabin is available for your selected dates.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default function BookCabinPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  
  const [cabin, setCabin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableDateRanges, setAvailableDateRanges] = useState(null);
  const [loadingDateRanges, setLoadingDateRanges] = useState(false);
  
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: searchParams.get('checkIn') || '',
    checkOutDate: searchParams.get('checkOut') || '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    specialRequests: '',
    numberOfGuests: 1
  });

  // Authentication check
  useEffect(() => {
    if (isLoaded && !user) {
      // User is not authenticated, redirect to sign in
      router.push('/sign-in');
      return;
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (params.id) {
      loadCabin();
    }
  }, [params.id]);

  useEffect(() => {
    if (cabin && bookingDetails.checkInDate && bookingDetails.checkOutDate) {
      checkAvailability();  
      
    }
  }, [cabin, bookingDetails.checkInDate, bookingDetails.checkOutDate]);

  const loadCabin = async () => {
    try {
      setLoading(true);
      const result = await getCabinById(params.id);
      
      if (result.success) {
        setCabin(result.cabin);
        // Load available date ranges for this cabin
        loadAvailableDateRanges(params.id);
      } else {
        toast.error(result.error || 'Failed to load cabin details');
        router.push('/cabins');
      }
    } catch (error) {
      console.error('Error loading cabin:', error);
      toast.error('Failed to load cabin details');
      router.push('/cabins');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDateRanges = async (cabinId) => {
    try {
      setLoadingDateRanges(true);
      const result = await getCabinAvailableDateRanges(cabinId);
      
      if (result.success) {
        setAvailableDateRanges(result);
      } else {
        console.error('Failed to load available date ranges:', result.error);
        // Don't show error to user, just disable date restrictions
        setAvailableDateRanges({ hasRestrictions: false });
      }
    } catch (error) {
      console.error('Error loading available date ranges:', error);
      setAvailableDateRanges({ hasRestrictions: false });
    } finally {
      setLoadingDateRanges(false);
    }
  };

  const checkAvailability = async () => {
    if (!bookingDetails.checkInDate || !bookingDetails.checkOutDate) {
      setAvailability(null);
      return;
    }

    if (new Date(bookingDetails.checkInDate) >= new Date(bookingDetails.checkOutDate)) {
      setAvailability({ available: false, error: 'Check-out date must be after check-in date' });
      return;
    }

    try {
      setCheckingAvailability(true);
      const result = await checkCabinAvailability(
        params.id, 
        bookingDetails.checkInDate, 
        bookingDetails.checkOutDate
      );    
      
      console.log('Availability check result:', result);
      
      
      if (result.success) {
        setAvailability({
          available: result.isAvailable,      
        });
      } else {
        setAvailability({ available: false, error: result.error });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailability({ available: false, error: 'Failed to check availability' });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to check if a date is available
  const isDateAvailable = (dateStr) => {
    if (!availableDateRanges || !availableDateRanges.hasRestrictions) {
      return true; // No restrictions
    }
    
    if (!availableDateRanges.availableRanges) {
      return false;
    }
    
    return availableDateRanges.availableRanges.some(range => {
      return dateStr >= range.startDate && dateStr <= range.endDate;
    });
  };

  // Get the minimum available date for check-in
  const getMinCheckInDate = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (!availableDateRanges || !availableDateRanges.hasRestrictions) {
      return today;
    }
    
    // Find the earliest available date that's today or later
    const availableRanges = availableDateRanges.availableRanges || [];
    for (const range of availableRanges) {
      if (range.startDate >= today) {
        return range.startDate;
      }
      if (range.endDate >= today) {
        return today;
      }
    }
    
    return today;
  };

  // Get the minimum check-out date based on check-in date
  const getMinCheckOutDate = () => {
    if (!bookingDetails.checkInDate) {
      return new Date().toISOString().split('T')[0];
    }
    
    const checkInDate = new Date(bookingDetails.checkInDate);
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return nextDay.toISOString().split('T')[0];
  };

  // Get the maximum check-out date based on check-in date and available ranges
  const getMaxCheckOutDate = () => {
    if (!bookingDetails.checkInDate || !availableDateRanges || !availableDateRanges.hasRestrictions) {
      return undefined; // No restriction
    }
    
    const checkInDate = bookingDetails.checkInDate;
    const availableRanges = availableDateRanges.availableRanges || [];
    
    // Find the range that contains the check-in date
    const containingRange = availableRanges.find(range => {
      return checkInDate >= range.startDate && checkInDate <= range.endDate;
    });
    
    return containingRange ? containingRange.endDate : undefined;
  };

  const validateForm = () => {
    const required = [
      'checkInDate',
      'checkOutDate', 
      'guestName',
      'guestEmail',
      'guestPhone',
      'emergencyContactName',
      'emergencyContactPhone'
    ];

    for (const field of required) {
      if (!bookingDetails[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!availability || !availability.available) {
      toast.error('Please select available dates');
      return false;
    }

    if (bookingDetails.numberOfGuests > cabin.capacity) {
      toast.error(`Number of guests cannot exceed cabin capacity (${cabin.capacity})`);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingDetails.guestEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Validate dates are available
    if (availableDateRanges && availableDateRanges.hasRestrictions) {
      if (!isDateAvailable(bookingDetails.checkInDate)) {
        toast.error('Check-in date is not available. Please select an available date.');
        return;
      }
      
      if (!isDateAvailable(bookingDetails.checkOutDate)) {
        toast.error('Check-out date is not available. Please select an available date.');
        return;
      }
      
      // Check if the entire date range is within a single availability period
      const checkInDate = bookingDetails.checkInDate;
      const checkOutDate = bookingDetails.checkOutDate;
      const availableRanges = availableDateRanges.availableRanges || [];
      
      const isRangeValid = availableRanges.some(range => {
        return checkInDate >= range.startDate && checkOutDate <= range.endDate;
      });
      
      if (!isRangeValid) {
        toast.error('Your stay dates must be within the same availability period.');
        return;
      }
    }

    try {
      setSubmitting(true);
      
      const checkIn = new Date(bookingDetails.checkInDate);
      const checkOut = new Date(bookingDetails.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const subtotal = nights * cabin.pricePerNight;
      const tax = subtotal * 0.1;
      const totalAmount = subtotal + tax;

      const bookingData = {
        cabinId: params.id,
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        numberOfGuests: parseInt(bookingDetails.numberOfGuests),
        totalAmount: totalAmount,
        guestName: bookingDetails.guestName,
        guestEmail: bookingDetails.guestEmail,
        guestPhone: bookingDetails.guestPhone,
        emergencyContactName: bookingDetails.emergencyContactName,
        emergencyContactPhone: bookingDetails.emergencyContactPhone,
        medicalConditions: bookingDetails.medicalConditions || null,
        specialRequests: bookingDetails.specialRequests || null
      };

      const result = await createCabinBooking(bookingData);
      
      if (result.success) {
        toast.success('Booking created successfully!');
        router.push(`/bookings/${result.booking.id}`);
      } else {
        toast.error(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cabin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cabin Not Found</h1>
          <Link href="/cabins">
            <Button>Back to Cabins</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/cabins/${params.id}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Cabin Details
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book {cabin.name}</h1>
            <p className="text-gray-600">Complete your booking details below</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {CABIN_TYPES[cabin.type] || cabin.type}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Stay Dates
                </CardTitle>
                <CardDescription>
                  Select your check-in and check-out dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Available Date Ranges Display */}
                {availableDateRanges && availableDateRanges.hasRestrictions && availableDateRanges.availableRanges && availableDateRanges.availableRanges.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Available Periods</h4>
                    <div className="space-y-1">
                      {availableDateRanges.availableRanges.map((range, index) => {
                        const startDate = new Date(range.startDate).toLocaleDateString();
                        const endDate = new Date(range.endDate).toLocaleDateString();
                        return (
                          <p key={index} className="text-sm text-blue-700">
                            {startDate} - {endDate}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {loadingDateRanges && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Loading available dates...</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkIn">Check-in Date *</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={bookingDetails.checkInDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        handleInputChange('checkInDate', newDate);
                        // Clear check-out date if it's no longer valid
                        if (bookingDetails.checkOutDate) {
                          const maxCheckOut = getMaxCheckOutDate();
                          if (maxCheckOut && bookingDetails.checkOutDate > maxCheckOut) {
                            handleInputChange('checkOutDate', '');
                          }
                        }
                      }}
                      min={getMinCheckInDate()}
                      disabled={loadingDateRanges}
                      required
                    />
                    {availableDateRanges && availableDateRanges.hasRestrictions && (
                      <p className="text-xs text-gray-500 mt-1">
                        Only available dates can be selected
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="checkOut">Check-out Date *</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={bookingDetails.checkOutDate}
                      onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                      min={getMinCheckOutDate()}
                      max={getMaxCheckOutDate()}
                      disabled={!bookingDetails.checkInDate || loadingDateRanges}
                      required
                    />
                    {bookingDetails.checkInDate && availableDateRanges && availableDateRanges.hasRestrictions && (
                      <p className="text-xs text-gray-500 mt-1">
                        Must be within the same availability period
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="w-32">
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max={cabin.capacity}
                    value={bookingDetails.numberOfGuests}
                    onChange={(e) => handleInputChange('numberOfGuests', e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: {cabin.capacity} guests</p>
                </div>

                {checkingAvailability && (
                  <div className="text-sm text-blue-600">Checking availability...</div>
                )}
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Guest Information
                </CardTitle>
                <CardDescription>
                  Primary guest details for the booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="guestName">Full Name *</Label>
                  <Input
                    id="guestName"
                    value={bookingDetails.guestName}
                    onChange={(e) => handleInputChange('guestName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestEmail" className="flex items-center gap-1">
                      <MailIcon className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={bookingDetails.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestPhone" className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      value={bookingDetails.guestPhone}
                      onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Required for all hospital cabin bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyName">Contact Name *</Label>
                    <Input
                      id="emergencyName"
                      value={bookingDetails.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Emergency contact name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Contact Phone *</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={bookingDetails.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional details to help us serve you better
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  <Textarea
                    id="medicalConditions"
                    value={bookingDetails.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="Please list any medical conditions or allergies we should be aware of..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingDetails.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or accommodations needed..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <BookingSummary 
              cabin={cabin} 
              bookingDetails={bookingDetails}
              availability={availability}
            />

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting || !availability?.available || checkingAvailability}
                >
                  {submitting ? 'Creating Booking...' : 'Complete Booking'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  By booking, you agree to our terms and conditions. 
                  Your booking will be confirmed via email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}