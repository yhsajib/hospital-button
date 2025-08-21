'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCabinById, checkCabinAvailability } from '@/actions/cabins';
import { getCabinAvailableDateRanges } from '@/actions/cabin-date-availability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPinIcon, 
  UsersIcon, 
  WifiIcon, 
  TvIcon, 
  SnowflakeIcon, 
  BathIcon, 
  ChefHatIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  DollarSignIcon,
  ArrowLeftIcon
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

function AvailabilityChecker({ cabinId, onAvailabilityCheck }) {
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [availableDateRanges, setAvailableDateRanges] = useState(null);
  const [loadingDateRanges, setLoadingDateRanges] = useState(true);

  // Load available date ranges when component mounts
  useEffect(() => {
    const loadAvailableDateRanges = async () => {
      try {
        setLoadingDateRanges(true);
        const result = await getCabinAvailableDateRanges(cabinId);
        if (result.success) {
          setAvailableDateRanges(result);
        } else {
          console.error('Failed to load available date ranges:', result.error);
          setAvailableDateRanges({ hasRestrictions: false });
        }
      } catch (error) {
        console.error('Error loading available date ranges:', error);
        setAvailableDateRanges({ hasRestrictions: false });
      } finally {
        setLoadingDateRanges(false);
      }
    };

    if (cabinId) {
      loadAvailableDateRanges();
    }
  }, [cabinId]);

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
    if (!checkInDate) {
      return new Date().toISOString().split('T')[0];
    }
    
    const checkInDateObj = new Date(checkInDate);
    const nextDay = new Date(checkInDateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return nextDay.toISOString().split('T')[0];
  };

  // Get the maximum check-out date based on check-in date and available ranges
  const getMaxCheckOutDate = () => {
    if (!checkInDate || !availableDateRanges || !availableDateRanges.hasRestrictions) {
      return undefined; // No restriction
    }
    
    const availableRanges = availableDateRanges.availableRanges || [];
    
    // Find the range that contains the check-in date
    const containingRange = availableRanges.find(range => {
      return checkInDate >= range.startDate && checkInDate <= range.endDate;
    });
    
    return containingRange ? containingRange.endDate : undefined;
  };

  const handleCheck = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Validate dates are available
    if (availableDateRanges && availableDateRanges.hasRestrictions) {
      if (!isDateAvailable(checkInDate)) {
        toast.error('Check-in date is not available. Please select an available date.');
        return;
      }
      
      if (!isDateAvailable(checkOutDate)) {
        toast.error('Check-out date is not available. Please select an available date.');
        return;
      }
      
      // Check if the entire date range is within a single availability period
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
      setChecking(true);
      const result = await checkCabinAvailability(cabinId, checkInDate, checkOutDate);
      
      if (result.success) {
        const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
        const cabin = await getCabinById(cabinId);
        const totalPrice = cabin.success ? nights * cabin.cabin.pricePerNight : 0;
        
        setAvailability({
          available: result.isAvailable,
          checkInDate,
          checkOutDate,
          totalNights: nights,
          totalPrice: totalPrice,
          reason: result.reason
        });
        onAvailabilityCheck({
          available: result.isAvailable,
          checkInDate,
          checkOutDate,
          totalNights: nights,
          totalPrice: totalPrice,
          reason: result.reason
        });
      } else {
        toast.error(result.error || 'Failed to check availability');
        setAvailability(null);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Failed to check availability');
      setAvailability(null);
    } finally {
      setChecking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Check Availability
        </CardTitle>
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
            <Label htmlFor="checkIn">Check-in Date</Label>
            <Input
                id="checkIn"
                type="date"
                value={checkInDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setCheckInDate(newDate);
                  // Clear check-out date if it's no longer valid
                  if (checkOutDate) {
                    const maxCheckOut = getMaxCheckOutDate();
                    if (maxCheckOut && checkOutDate > maxCheckOut) {
                      setCheckOutDate('');
                    }
                  }
                }}
                min={getMinCheckInDate()}
                disabled={loadingDateRanges}
              />
              {availableDateRanges && availableDateRanges.hasRestrictions && (
                <p className="text-xs text-gray-500 mt-1">
                  Only available dates can be selected
                </p>
              )}
          </div>
          <div>
            <Label htmlFor="checkOut">Check-out Date</Label>
            <Input
                id="checkOut"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={getMinCheckOutDate()}
                max={getMaxCheckOutDate()}
                disabled={loadingDateRanges || !checkInDate}
              />
              {checkInDate && availableDateRanges && availableDateRanges.hasRestrictions && (
                <p className="text-xs text-gray-500 mt-1">
                  Must be within the same availability period
                </p>
              )}
          </div>
        </div>
        
        <Button 
          onClick={handleCheck} 
          className="w-full" 
          disabled={checking || !checkInDate || !checkOutDate}
        >
          {checking ? 'Checking...' : 'Check Availability'}
        </Button>

        {availability && (
          <div className={`p-4 rounded-lg border ${
            availability.available 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {availability.available ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                availability.available ? 'text-green-800' : 'text-red-800'
              }`}>
                {availability.available ? 'Available' : 'Not Available'}
              </span>
            </div>
            
            {availability.available ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p>{availability.totalNights} nights</p>
                <p className="font-semibold text-green-600">
                  Total: ${availability.totalPrice}
                </p>
              </div>
            ) : (
              availability.reason && (
                <div className="text-sm text-red-600 mt-2">
                  <p>{availability.reason}</p>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CabinFeatures({ cabin }) {
  const features = [
    { key: 'hasWifi', label: 'WiFi', icon: <WifiIcon className="h-4 w-4" /> },
    { key: 'hasTV', label: 'Television', icon: <TvIcon className="h-4 w-4" /> },
    { key: 'hasAirConditioning', label: 'Air Conditioning', icon: <SnowflakeIcon className="h-4 w-4" /> },
    { key: 'hasPrivateBathroom', label: 'Private Bathroom', icon: <BathIcon className="h-4 w-4" /> },
    { key: 'hasRefrigerator', label: 'Refrigerator', icon: <ChefHatIcon className="h-4 w-4" /> }
  ];

  const availableFeatures = features.filter(feature => cabin[feature.key]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Features & Amenities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Built-in Features */}
          {availableFeatures.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Built-in Features</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableFeatures.map((feature) => (
                  <div key={feature.key} className="flex items-center gap-2 text-sm">
                    {feature.icon}
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Amenities */}
          {cabin.amenities && cabin.amenities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Additional Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {cabin.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {availableFeatures.length === 0 && (!cabin.amenities || cabin.amenities.length === 0) && (
            <p className="text-gray-500 text-sm">No additional features listed</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CabinDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [cabin, setCabin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    if (params.id) {
      loadCabin();
    }
  }, [params.id]);

  const loadCabin = async () => {
    try {
      setLoading(true);
      const result = await getCabinById(params.id);
      
      if (result.success) {
        setCabin(result.cabin);
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

  const handleBookNow = () => {
    // Check if user is authenticated
    if (!isLoaded) {
      // Still loading user data
      return;
    }
    
    if (!user) {
      // User is not logged in, redirect to sign in
      router.push('/sign-in');
      return;
    }
    
    // User is authenticated, proceed with booking
    if (availability && availability.available) {
      const bookingParams = new URLSearchParams({
        checkIn: availability.checkInDate,
        checkOut: availability.checkOutDate,
        nights: availability.totalNights.toString(),
        total: availability.totalPrice.toString()
      });
      router.push(`/cabins/${params.id}/book?${bookingParams.toString()}`);
    } else {
      router.push(`/cabins/${params.id}/book`);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      STANDARD: 'bg-blue-100 text-blue-800',
      DELUXE: 'bg-purple-100 text-purple-800',
      SUITE: 'bg-green-100 text-green-800',
      VIP: 'bg-yellow-100 text-yellow-800',
      ICU: 'bg-red-100 text-red-800',
      PRIVATE_ROOM: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
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
        <Link href="/cabins" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Cabins
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{cabin.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {cabin.floor && `Floor ${cabin.floor}`}
                  {cabin.wing && ` • ${cabin.wing} Wing`}
                  {cabin.roomNumber && ` • Room ${cabin.roomNumber}`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span>Up to {cabin.capacity} guests</span>
              </div>
            </div>
          </div>
          <Badge className={getTypeColor(cabin.type)}>
            {CABIN_TYPES[cabin.type] || cabin.type}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Cabin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {cabin.description || 'No description available for this cabin.'}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <CabinFeatures cabin={cabin} />

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Cabin Type:</span>
                  <p>{CABIN_TYPES[cabin.type] || cabin.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Capacity:</span>
                  <p>{cabin.capacity} guests</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Floor:</span>
                  <p>{cabin.floor || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Wing:</span>
                  <p>{cabin.wing || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Room Number:</span>
                  <p>{cabin.roomNumber || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className={cabin.isActive ? 'text-green-600' : 'text-red-600'}>
                    {cabin.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ${cabin.pricePerNight}
                </div>
                <div className="text-gray-600 text-sm">per night</div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Checker */}
          <AvailabilityChecker 
            cabinId={cabin.id} 
            onAvailabilityCheck={setAvailability}
          />

          {/* Booking Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={handleBookNow} 
                  className="w-full" 
                  size="lg"
                  disabled={!cabin.isActive}
                >
                  {availability && availability.available ? 'Book Now' : 'Check Availability & Book'}
                </Button>
                
                {!cabin.isActive && (
                  <p className="text-sm text-red-600 text-center">
                    This cabin is currently not available for booking.
                  </p>
                )}
                
                <p className="text-xs text-gray-500 text-center">
                  Secure booking • No hidden fees • 24/7 support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}