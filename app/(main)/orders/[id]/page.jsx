'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar
} from 'lucide-react';
import { getOrderById, cancelOrder } from '@/actions/orders';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

const statusConfig = {
  PENDING: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-500', icon: CheckCircle, label: 'Confirmed' },
  PROCESSING: { color: 'bg-purple-500', icon: Package, label: 'Processing' },
  SHIPPED: { color: 'bg-orange-500', icon: Truck, label: 'Shipped' },
  DELIVERED: { color: 'bg-green-500', icon: CheckCircle, label: 'Delivered' },
  CANCELLED: { color: 'bg-red-500', icon: XCircle, label: 'Cancelled' },
  REFUNDED: { color: 'bg-gray-500', icon: XCircle, label: 'Refunded' }
};

const paymentStatusConfig = {
  PENDING: { color: 'bg-yellow-500', label: 'Payment Pending' },
  PAID: { color: 'bg-green-500', label: 'Paid' },
  FAILED: { color: 'bg-red-500', label: 'Payment Failed' },
  REFUNDED: { color: 'bg-gray-500', label: 'Refunded' }
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    fetchOrderDetails();
  }, [id, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(id);
      
      if (result.success) {
        setOrder(result.order);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const result = await cancelOrder(id, 'Cancelled by customer');
      
      if (result.success) {
        toast.success('Order cancelled successfully');
        fetchOrderDetails(); // Refresh order data
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/orders')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/orders')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.orderNumber}</p>
          </div>
        </div>
        
        {canCancel && (
          <Button 
            variant="destructive" 
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <StatusIcon className="w-5 h-5" />
                <span>Order Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${statusConfig[order.status]?.color} text-white`}>
                  {statusConfig[order.status]?.label || order.status}
                </Badge>
                <Badge className={`${paymentStatusConfig[order.paymentStatus]?.color} text-white`}>
                  {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span>{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Date:</span>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Delivery:</span>
                    <span>{formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Order Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {item.medicine.imageUrl && (
                      <img 
                        src={item.medicine.imageUrl} 
                        alt={item.medicine.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.medicine.name}</h4>
                      {item.medicine.brandName && (
                        <p className="text-sm text-muted-foreground">Brand: {item.medicine.brandName}</p>
                      )}
                      {item.medicine.genericName && (
                        <p className="text-sm text-muted-foreground">Generic: {item.medicine.genericName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unitPrice.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary and Customer Info */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(order.totalAmount - order.shippingCost - order.taxAmount + order.discountAmount).toFixed(2)}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Shipping Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{order.customerName}</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                <p>{order.shippingCountry}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <Badge className={`${paymentStatusConfig[order.paymentStatus]?.color} text-white text-xs`}>
                    {paymentStatusConfig[order.paymentStatus]?.label || order.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}