'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Package,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load cart data from localStorage on component mount
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    
    if (savedCartItems) {
      try {
        const parsedCartItems = JSON.parse(savedCartItems);
        setCartItems(parsedCartItems);
      } catch (error) {
        console.error('Error parsing cart items from localStorage:', error);
        setCartItems([]);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage
  const saveCartToStorage = (items) => {
    localStorage.setItem('cartItems', JSON.stringify(items));
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem('cartCount', totalCount.toString());
  };

  // Update item quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
    toast.success('Cart updated!');
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
    toast.success('Item removed from cart!');
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCount');
    toast.success('Cart cleared!');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    // Store cart data for checkout page
    localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
    localStorage.setItem('checkoutTotal', total.toFixed(2));
    
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 animate-pulse mx-auto mb-4 text-emerald-600" />
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600">
            {cartItems.length === 0 ? 'Your cart is empty' : `${cartItems.length} item(s) in your cart`}
          </p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        // Empty cart state
        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any medicines to your cart yet.</p>
          <Link href="/shop">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Package className="h-4 w-4 mr-2" />
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        // Cart with items
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Cart Items</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
            
            {cartItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Item Image Placeholder */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.brandName} - {item.genericName}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                          ${item.price.toFixed(2)} each
                        </Badge>
                        <Badge variant="outline">
                          {item.stock} in stock
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            if (newQuantity <= item.stock) {
                              updateQuantity(item.id, newQuantity);
                            } else {
                              toast.error(`Only ${item.stock} items available in stock`);
                            }
                          }}
                          className="w-16 h-8 text-center border-0 focus:ring-0"
                          min="1"
                          max={item.stock}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (item.quantity < item.stock) {
                              updateQuantity(item.id, item.quantity + 1);
                            } else {
                              toast.error(`Only ${item.stock} items available in stock`);
                            }
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="text-right min-w-[80px]">
                        <p className="font-semibold text-lg">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  
                  {subtotal < 50 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      💡 Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  Secure checkout powered by SSL encryption
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}