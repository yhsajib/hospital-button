'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCabinBookingById, cancelCabinBooking } from '@/actions/cabin-bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  DollarSignIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  FileTextIcon,
  WifiIcon,
  TvIcon,
  SnowflakeIcon,
  BathIcon,
  ChefHatIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BOOKING_STATUS = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <ClockIcon className="h-4 w-4" /> },
  CONFIRMED: { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-4 w-4" /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircleIcon className="h-4 w-4" /> },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: <CheckCircleIcon className="h-4 w-4" /> }
};

const PAYMENT_STATUS = {
  PENDING: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Payment Failed', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
};

const CABIN_TYPES = {
  STANDARD: 'Standard',
  DELUXE: 'Deluxe',
  SUITE: 'Suite',
  VIP: 'VIP',
  ICU: 'ICU',
  PRIVATE_ROOM: 'Private Room'
};

function BookingTimeline({ booking }) {
  const createdAt = new Date(booking.createdAt);
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const now = new Date();

  const events = [
    {
      title: 'Booking Created',
      date: createdAt,
      status: 'completed',
      description: 'Your booking request was submitted'
    },
    {
      title: 'Payment',
      date: createdAt,
      status: booking.paymentStatus === 'PAID' ? 'completed' : booking.paymentStatus === 'FAILED' ? 'failed' : 'pending',
      description: booking.paymentStatus === 'PAID' ? 'Payment confirmed' : booking.paymentStatus === 'FAILED' ? 'Payment failed' : 'Awaiting payment'
    },
    {
      title: 'Check-in',
      date: checkInDate,
      status: now >= checkInDate ? 'completed' : 'upcoming',
      description: `Check-in at ${checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    },
    {
      title: 'Check-out',
      date: checkOutDate,
      status: now >= checkOutDate ? 'completed' : 'upcoming',
      description: `Check-out by ${checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'upcoming': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(event.status)}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {event.date.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
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

  if (availableFeatures.length === 0 && (!cabin.amenities || cabin.amenities.length === 0)) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cabin Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Built-in Features */}
          {availableFeatures.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Built-in Features</h4>
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
              <h4 className="font-medium mb-2 text-sm">Additional Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {cabin.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBooking();
    }
  }, [params.id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const result = await getCabinBookingById(params.id);
      
      if (result.success) {
        setBooking(result.booking);
      } else {
        toast.error(result.error || 'Failed to load booking details');
        router.push('/bookings');
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
      router.push('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const result = await cancelCabinBooking(booking.id);
      
      if (result.success) {
        toast.success('Booking cancelled successfully');
        setBooking(prev => ({ ...prev, status: 'CANCELLED' }));
      } else {
        toast.error(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
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

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <Link href="/bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = BOOKING_STATUS[booking.status] || BOOKING_STATUS.PENDING;
  const paymentInfo = PAYMENT_STATUS[booking.paymentStatus] || PAYMENT_STATUS.PENDING;
  
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isUpcoming = checkInDate > new Date();
  const isActive = checkInDate <= new Date() && checkOutDate >= new Date();
  const isPast = checkOutDate < new Date();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/bookings" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Bookings
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
            <p className="text-gray-600">Booking ID: {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={statusInfo.color}>
              <div className="flex items-center gap-1">
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            </Badge>
            <Badge className={paymentInfo.color}>
              {paymentInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cabin Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                {booking.cabin.name}
              </CardTitle>
              <CardDescription>
                {booking.cabin.floor && `Floor ${booking.cabin.floor}`}
                {booking.cabin.wing && ` • ${booking.cabin.wing} Wing`}
                {booking.cabin.roomNumber && ` • Room ${booking.cabin.roomNumber}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Cabin Type:</span>
                    <p>{CABIN_TYPES[booking.cabin.type] || booking.cabin.type}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Capacity:</span>
                    <p className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      Up to {booking.cabin.capacity} guests
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Rate:</span>
                    <p>${booking.cabin.pricePerNight}/night</p>
                  </div>
                </div>
                
                {booking.cabin.description && (
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{booking.cabin.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="font-medium text-gray-600 text-sm">Check-in</span>
                  <p className="text-lg font-semibold">{checkInDate.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{checkInDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 text-sm">Check-out</span>
                  <p className="text-lg font-semibold">{checkOutDate.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="font-medium text-gray-600 text-sm">Duration</span>
                  <p className="text-lg font-semibold">{nights} night{nights !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 text-sm">Guests</span>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    {booking.numberOfGuests}
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2 mt-4">
                {isActive && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Currently Active
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge className="bg-green-100 text-green-800">
                    Upcoming
                  </Badge>
                )}
                {isPast && (
                  <Badge className="bg-gray-100 text-gray-800">
                    Past Stay
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Guest Name</span>
                    <p>{booking.guestName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Email</span>
                    <p className="flex items-center gap-1">
                      <MailIcon className="h-4 w-4" />
                      {booking.guestEmail}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Phone</span>
                    <p className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      {booking.guestPhone}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Emergency Contact</span>
                    <p>{booking.emergencyContactName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Emergency Phone</span>
                    <p className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      {booking.emergencyContactPhone}
                    </p>
                  </div>
                </div>

                {(booking.medicalConditions || booking.specialRequests) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {booking.medicalConditions && (
                        <div>
                          <span className="font-medium text-gray-600 text-sm flex items-center gap-1">
                            <FileTextIcon className="h-4 w-4" />
                            Medical Conditions
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{booking.medicalConditions}</p>
                        </div>
                      )}
                      {booking.specialRequests && (
                        <div>
                          <span className="font-medium text-gray-600 text-sm flex items-center gap-1">
                            <FileTextIcon className="h-4 w-4" />
                            Special Requests
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cabin Features */}
          <CabinFeatures cabin={booking.cabin} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Pricing Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>${booking.cabin.pricePerNight} × {nights} nights</span>
                  <span>${(booking.cabin.pricePerNight * nights).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${((booking.cabin.pricePerNight * nights) * 0.1).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-green-600">${booking.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <BookingTimeline booking={booking} />

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {canCancel && isUpcoming && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={cancelling}>
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this booking? This action cannot be undone.
                          {booking.paymentStatus === 'PAID' && (
                            <span className="block mt-2 text-amber-600">
                              Note: Refund processing may take 3-5 business days.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
                          Cancel Booking
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                <Link href={`/cabins/${booking.cabin.id}`}>
                  <Button variant="outline" className="w-full">
                    View Cabin Details
                  </Button>
                </Link>
                
                <p className="text-xs text-gray-500 text-center">
                  Need help? Contact our support team 24/7
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}