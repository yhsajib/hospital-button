'use server';

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Get all orders for the current user or all orders for admin
export async function getOrders() {
  try {
    const { userId } = await auth();
    
    console.log('Auth result:', { userId });
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user to check role, create if doesn't exist
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      // Get user info from Clerk
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return { success: false, error: 'User not found in authentication system' };
      }

      // Create user in database
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          name: name || 'Unknown User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl,
          role: 'PATIENT' // Default role
        },
        select: { id: true, role: true }
      });
    }

    let orders;

    // If admin, get all orders; otherwise get only user's orders
    if (user.role === 'ADMIN') {
      orders = await db.order.findMany({
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  brandName: true,
                  genericName: true,
                  price: true
                }
              }
            }
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      orders = await db.order.findMany({
        where: {
          customerId: user.id
        },
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  brandName: true,
                  genericName: true,
                  price: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      customerName: order.customerName || order.customer?.name || 'Unknown Customer',
      customerEmail: order.customerEmail || order.customer?.email || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null
    }));

    return { success: true, orders: formattedOrders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

// Update order status
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Only admin can update order status
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can update order status' };
    }

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: 'Invalid order status' };
    }

    // Update order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        // Set deliveredAt if status is DELIVERED
        ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() }),
        // Set paidAt if status is CONFIRMED and not already set
        ...(newStatus === 'CONFIRMED' && { paidAt: new Date() })
      }
    });

    revalidatePath('/orders');
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

// Create a new order (to be called from checkout)
export async function createOrder(orderData) {
  try {
    const { userId } = await auth();
    console.log('CreateOrder - Auth result:', { userId });
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user from database, create if doesn't exist
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      // Get user info from Clerk
      const { currentUser } = await import('@clerk/nextjs/server');
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        return { success: false, error: 'User not found in authentication system' };
      }

      // Create user in database
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          name: name || 'Unknown User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl,
          role: 'PATIENT' // Default role
        },
        select: { id: true, email: true, name: true }
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: user.id,
        customerName: orderData.customerName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        customerEmail: orderData.customerEmail || user.email,
        customerPhone: orderData.customerPhone || '',
        shippingAddress: orderData.shippingAddress,
        shippingCity: orderData.shippingCity,
        shippingState: orderData.shippingState,
        shippingZip: orderData.shippingZip,
        shippingCountry: orderData.shippingCountry || 'United States',
        totalAmount: orderData.totalAmount,
        shippingCost: orderData.shippingCost || 0,
        taxAmount: orderData.taxAmount || 0,
        discountAmount: orderData.discountAmount || 0,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: orderData.paymentMethod || 'CARD',
        notes: orderData.notes || '',
        orderItems: {
          create: orderData.items.map(item => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            medicine: true
          }
        }
      }
    });

    revalidatePath('/orders');
    return { success: true, order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

// Get single order details
export async function getOrderById(orderId) {
  try {
    console.log('getOrderById called with orderId:', orderId);
    const { userId } = await auth();
    console.log('Auth result - userId:', userId);
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user to check role
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });
    console.log('User found:', user);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Build where clause based on user role
    const whereClause = user.role === 'ADMIN' 
      ? { id: orderId }
      : { id: orderId, customerId: user.id };
    console.log('Where clause:', whereClause);

    const order = await db.order.findUnique({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
                brandName: true,
                genericName: true,
                price: true,
                description: true
              }
            }
          }
        },
        customer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
      }
    });
    console.log('Order found:', order ? 'Yes' : 'No', order?.id);
    
    // Debug: Check if order exists with just the ID (ignoring customerId)
    if (!order) {
      const orderWithoutCustomerCheck = await db.order.findUnique({
        where: { id: orderId },
        select: { id: true, customerId: true, customerName: true }
      });
      console.log('Order exists without customer check:', orderWithoutCustomerCheck);
      console.log('Current user ID:', user.id);
      console.log('Order customer ID:', orderWithoutCustomerCheck?.customerId);
      
      // Debug: List all orders for this user
      const userOrders = await db.order.findMany({
        where: { customerId: user.id },
        select: { id: true, orderNumber: true, customerName: true }
      });
      console.log('All orders for this user:', userOrders);
    }

    if (!order) {
      console.log('Order not found with whereClause:', whereClause);
      return { success: false, error: 'Order not found' };
    }

    // Format order for frontend
    const formattedOrder = {
      ...order,
      customerName: order.customerName || order.customer?.name || 'Unknown Customer',
      customerEmail: order.customerEmail || order.customer?.email || '',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null
    };

    return { success: true, order: formattedOrder };
  } catch (error) {
    console.error('Error fetching order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      orderId: orderId
    });
    return { success: false, error: 'Failed to fetch order details' };
  }
}

// Cancel order (only if status is PENDING or CONFIRMED)
export async function cancelOrder(orderId, reason = '') {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get order to check ownership and status
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerId: true, status: true }
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Check if user can cancel this order
    if (user.role !== 'ADMIN' && order.customerId !== user.id) {
      return { success: false, error: 'You can only cancel your own orders' };
    }

    // Check if order can be cancelled
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return { success: false, error: 'Order cannot be cancelled at this stage' };
    }

    // Update order status to cancelled
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
      }
    });

    revalidatePath('/orders');
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}