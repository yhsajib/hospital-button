'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getOrders, updateOrderStatus, cancelOrder } from '@/actions/orders';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
};

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: XCircle
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cancellingOrders, setCancellingOrders] = useState([]);
  const [updatingOrders, setUpdatingOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Check if user is admin (you can modify this logic based on your admin system)
    if (user?.publicMetadata?.role === 'admin' || user?.emailAddresses?.[0]?.emailAddress?.includes('admin')) {
      setIsAdmin(true);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error);
        toast.error(data.error);
      }
    } catch (err) {
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrders(prev => [...prev, orderId]);
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Order status updated successfully');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingOrders(prev => [...prev, orderId]);
      const result = await cancelOrder(orderId);
      if (result.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'CANCELLED' } : order
        ));
        toast.success('Order cancelled successfully');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Failed to cancel order');
    } finally {
      setCancellingOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const OrderDetailsDialog = ({ order }) => {
    if (!order) return null;

    const StatusIcon = statusIcons[order.status];

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {order.orderNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <Badge className={statusColors[order.status]}>
                {order.status}
              </Badge>
            </div>
            <Select onValueChange={(value) => handleStatusUpdate(order.id, value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Name:</strong> {order.customerName}</p>
                <p><strong>Email:</strong> {order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.customerPhone}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                <p>{order.shippingCountry}</p>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.medicine?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.medicine?.brandName} - {item.medicine?.genericName}
                      </p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">${item.unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Order Placed:</strong> {formatDate(order.createdAt)}</p>
              {order.paidAt && (
                <p><strong>Payment Confirmed:</strong> {formatDate(order.paidAt)}</p>
              )}
              {order.estimatedDelivery && (
                <p><strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}</p>
              )}
              {order.deliveredAt && (
                <p><strong>Delivered:</strong> {formatDate(order.deliveredAt)}</p>
              )}
              {order.trackingNumber && (
                <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrders} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-gray-600">Track and manage all customer orders</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria'
              : 'Orders will appear here once customers start placing them'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                        <Badge className={statusColors[order.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <p><strong>Customer:</strong> {order.customerName}</p>
                        <p><strong>Email:</strong> {order.customerEmail}</p>
                        <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                        <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Items:</strong> {order.orderItems?.length || 0} item(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {/* Cancel button for pending/confirmed orders */}
                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrders.includes(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {cancellingOrders.includes(order.id) ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                      
                      {/* Admin status update */}
                      {isAdmin && (
                        <Select 
                          value={order.status} 
                          onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                          disabled={updatingOrders.includes(order.id)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="REFUNDED">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}