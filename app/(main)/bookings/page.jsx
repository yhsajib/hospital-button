'use client';

import { useState, useEffect } from 'react';
import { getUserCabinBookings, cancelCabinBooking } from '@/actions/cabin-bookings';
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
  EyeIcon
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

function BookingCard({ booking, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  
  const statusInfo = BOOKING_STATUS[booking.status] || BOOKING_STATUS.PENDING;
  const paymentInfo = PAYMENT_STATUS[booking.paymentStatus] || PAYMENT_STATUS.PENDING;
  
  const checkInDate = new Date(booking.checkInDate);
  const checkOutDate = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isUpcoming = checkInDate > new Date();
  const isActive = checkInDate <= new Date() && checkOutDate >= new Date();
  const isPast = checkOutDate < new Date();

  const handleCancel = async () => {
    try {
      setCancelling(true);
      const result = await cancelCabinBooking(booking.id);
      
      if (result.success) {
        toast.success('Booking cancelled successfully');
        onCancel(booking.id);
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.cabin.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPinIcon className="h-4 w-4" />
              {booking.cabin.floor && `Floor ${booking.cabin.floor}`}
              {booking.cabin.wing && ` • ${booking.cabin.wing} Wing`}
              {booking.cabin.roomNumber && ` • Room ${booking.cabin.roomNumber}`}
            </CardDescription>
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
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Check-in:</span>
              <p className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {checkInDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Check-out:</span>
              <p className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {checkOutDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Duration:</span>
              <p>{nights} night{nights !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Guests:</span>
              <p className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                {booking.numberOfGuests}
              </p>
            </div>
          </div>

          {/* Cabin Type */}
          <div>
            <span className="font-medium text-gray-600 text-sm">Cabin Type:</span>
            <Badge variant="outline" className="ml-2">
              {CABIN_TYPES[booking.cabin.type] || booking.cabin.type}
            </Badge>
          </div>

          {/* Status Indicators */}
          <div className="flex gap-2">
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

          <Separator />

          {/* Total Amount */}
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Total Amount:</span>
            <span className="text-lg font-semibold text-green-600 flex items-center gap-1">
              <DollarSignIcon className="h-4 w-4" />
              ${booking.totalAmount.toFixed(2)}
            </span>
          </div>

          {/* Booking Reference */}
          <div className="text-xs text-gray-500">
            Booking ID: {booking.id.slice(0, 8).toUpperCase()}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/bookings/${booking.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </Link>
            
            {canCancel && isUpcoming && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={cancelling}>
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    {cancelling ? 'Cancelling...' : 'Cancel'}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingFilters({ filter, onFilterChange }) {
  return (
    <div className="flex gap-2 mb-6">
      <Button 
        variant={filter === 'all' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('all')}
      >
        All Bookings
      </Button>
      <Button 
        variant={filter === 'upcoming' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('upcoming')}
      >
        Upcoming
      </Button>
      <Button 
        variant={filter === 'active' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('active')}
      >
        Active
      </Button>
      <Button 
        variant={filter === 'past' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('past')}
      >
        Past
      </Button>
      <Button 
        variant={filter === 'cancelled' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onFilterChange('cancelled')}
      >
        Cancelled
      </Button>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const result = await getUserCabinBookings();
      
      if (result.success) {
        setBookings(result.bookings);
      } else {
        toast.error(result.error || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' }
          : booking
      )
    );
  };

  const filterBookings = (bookings, filter) => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return bookings.filter(booking => 
          new Date(booking.checkInDate) > now && 
          booking.status !== 'CANCELLED'
        );
      case 'active':
        return bookings.filter(booking => 
          new Date(booking.checkInDate) <= now && 
          new Date(booking.checkOutDate) >= now &&
          booking.status !== 'CANCELLED'
        );
      case 'past':
        return bookings.filter(booking => 
          new Date(booking.checkOutDate) < now &&
          booking.status !== 'CANCELLED'
        );
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'CANCELLED');
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings(bookings, filter);
  const upcomingCount = filterBookings(bookings, 'upcoming').length;
  const activeCount = filterBookings(bookings, 'active').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Cabin Bookings</h1>
        <p className="text-gray-600">
          Manage your hospital cabin reservations and view booking history
        </p>
        
        {/* Quick Stats */}
        {!loading && bookings.length > 0 && (
          <div className="flex gap-4 mt-4">
            {upcomingCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{upcomingCount} upcoming booking{upcomingCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            {activeCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{activeCount} active booking{activeCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <Link href="/cabins">
          <Button className="mb-4">
            Book New Cabin
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <BookingFilters filter={filter} onFilterChange={setFilter} />

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-80 animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No bookings found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't made any cabin bookings yet. Book your first cabin to get started.
          </p>
          <Link href="/cabins">
            <Button>
              Browse Cabins
            </Button>
          </Link>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {filter} bookings
          </h3>
          <p className="text-gray-600 mb-6">
            You don't have any {filter} bookings at the moment.
          </p>
          <Button variant="outline" onClick={() => setFilter('all')}>
            View All Bookings
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard 
              key={booking.id} 
              booking={booking} 
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && bookings.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {filteredBookings.length} of {bookings.length} total bookings
        </div>
      )}
    </div>
  );
}