"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMedicines } from "@/actions/shop";
import { Pill, ShoppingCart, Package, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import Link from "next/link";
import Preloader from "@/components/preloader";

export default function ShopPage() {
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [navigatingToCart, setNavigatingToCart] = useState(false);
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [availableBrands, setAvailableBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load cart data from localStorage on component mount
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    const savedCartCount = localStorage.getItem('cartCount');
    
    if (savedCartItems) {
      try {
        const parsedCartItems = JSON.parse(savedCartItems);
        setCartItems(parsedCartItems);
      } catch (error) {
        console.error('Error parsing cart items from localStorage:', error);
      }
    }
    
    if (savedCartCount) {
      setCartCount(parseInt(savedCartCount, 10) || 0);
    }
  }, []);

  // Fetch medicines from database
  useEffect(() => {
    fetchMedicines();
  }, []);
  
  // Filter medicines when filters change
  useEffect(() => {
    applyFilters();
  }, [medicines, selectedBrands, priceRange, searchQuery]);
  
  // Extract unique brands when medicines load
  useEffect(() => {
    if (medicines.length > 0) {
      const brands = [...new Set(medicines.map(med => med.brandName).filter(Boolean))];
      setAvailableBrands(brands);
    }
  }, [medicines]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMedicines();
      setMedicines(data.medicines || []);
      setFilteredMedicines(data.medicines || []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...medicines];
    
    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(med => 
        med.name.toLowerCase().includes(query) ||
        (med.brandName && med.brandName.toLowerCase().includes(query)) ||
        (med.genericName && med.genericName.toLowerCase().includes(query))
      );
    }
    
    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(med => selectedBrands.includes(med.brandName));
    }
    
    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(med => parseFloat(med.price) >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(med => parseFloat(med.price) <= parseFloat(priceRange.max));
    }
    
    setFilteredMedicines(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };
  
  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
  };
  
  // Pagination logic
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleAddToCart = async (medicine) => {
    setAddingToCart(medicine.id);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingItem = cartItems.find(item => item.id === medicine.id);
    let updatedItems;
    
    if (existingItem) {
      // Update quantity if item already exists
      updatedItems = cartItems.map(item => 
        item.id === medicine.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Add new item to cart
      const newItem = { ...medicine, quantity: 1 };
      updatedItems = [...cartItems, newItem];
    }
    
    const newCartCount = cartCount + 1;
    
    // Update state
    setCartItems(updatedItems);
    setCartCount(newCartCount);
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    localStorage.setItem('cartCount', newCartCount.toString());
    
    toast.success(`${medicine.name} added to cart!`);
    setAddingToCart(null);
   };

  const handleCartNavigation = async () => {
    setNavigatingToCart(true);
    
    // Simulate navigation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Navigate to cart page
    window.location.href = '/cart';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading medicines...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-500">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Preloader isLoading={navigatingToCart} />
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2 flex items-center justify-center gap-2">
              <Pill className="h-8 w-8 text-blue-600" />
              Medicine Shop
            </h1>
            <p className="text-gray-600 text-lg">
              Browse and purchase medicines from our inventory
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold text-black flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
                  <Filter className="h-5 w-5" />
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              {sidebarOpen && (
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Search Medicines
                    </Label>
                    <Input
                      type="text"
                      placeholder="Search by name, brand, or generic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Brand Filter */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Brand
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandChange(brand)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Price Range
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-20"
                      />
                      <span className="text-gray-500 self-center">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                  
                  {/* Results Count */}
                  <div className="text-sm text-gray-500 pt-4 border-t">
                    Showing {filteredMedicines.length} of {medicines.length} medicines
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">

            {/* Medicines Grid */}
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {medicines.length === 0 ? 'No medicines available' : 'No medicines match your filters'}
                </h3>
                <p className="text-gray-600">
                  {medicines.length === 0 ? 'Check back later for new medicines.' : 'Try adjusting your filters to see more results.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentMedicines.map((medicine) => (
                    <Card key={medicine.id} className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                              {medicine.name}
                            </CardTitle>
                            {medicine.brandName && (
                              <p className="text-sm text-blue-600 font-medium">
                                Brand: {medicine.brandName}
                              </p>
                            )}
                            {medicine.genericName && (
                              <p className="text-xs text-gray-500">
                                Generic: {medicine.genericName}
                              </p>
                            )}
                          </div>
                          <Badge 
                            variant={medicine.stock > 0 ? "default" : "destructive"}
                            className={medicine.stock > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {medicine.stock > 0 ? `${medicine.stock} in stock` : "Out of stock"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {medicine.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-blue-600">
                            ${medicine.price}
                          </div>
                          <Button 
                            onClick={() => handleAddToCart(medicine)}
                            disabled={medicine.stock === 0 || addingToCart === medicine.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToCart === medicine.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-white mr-2"></div>
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
                          className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cart Button - Always visible in middle-right */}
      <Button 
        onClick={handleCartNavigation}
        disabled={navigatingToCart}
        className="fixed top-1/2 right-6 transform -translate-y-1/2 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {navigatingToCart ? (
          <div className="w-6 h-6 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
        ) : (
          <ShoppingCart className="h-6 w-6" />
        )}
        {cartCount > 0 && !navigatingToCart && (
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 min-w-[24px]">
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Button>
      </div>
    </>
  );
}