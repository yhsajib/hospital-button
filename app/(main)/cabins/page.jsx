'use client';

import { useState, useEffect } from 'react';
import { getCabins, getAvailableCabins } from '@/actions/cabins';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, MapPinIcon, UsersIcon, WifiIcon, TvIcon, SnowflakeIcon, BathIcon, ChefHatIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const CABIN_TYPES = [
  { value: 'STANDARD', label: 'Standard' },
  { value: 'DELUXE', label: 'Deluxe' },
  { value: 'SUITE', label: 'Suite' },
  { value: 'VIP', label: 'VIP' },
  { value: 'ICU', label: 'ICU' },
  { value: 'PRIVATE_ROOM', label: 'Private Room' }
];

const AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Private Bathroom',
  'TV',
  'Refrigerator',
  'Room Service',
  'Medical Equipment',
  'Wheelchair Accessible'
];

function CabinCard({ cabin }) {
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

  const getFeatureIcon = (feature) => {
    const icons = {
      hasWifi: <WifiIcon className="h-4 w-4" />,
      hasTV: <TvIcon className="h-4 w-4" />,
      hasAirConditioning: <SnowflakeIcon className="h-4 w-4" />,
      hasPrivateBathroom: <BathIcon className="h-4 w-4" />,
      hasRefrigerator: <ChefHatIcon className="h-4 w-4" />
    };
    return icons[feature];
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{cabin.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPinIcon className="h-4 w-4" />
              {cabin.floor && `Floor ${cabin.floor}`}
              {cabin.wing && ` • ${cabin.wing} Wing`}
              {cabin.roomNumber && ` • Room ${cabin.roomNumber}`}
            </CardDescription>
          </div>
          <Badge className={getTypeColor(cabin.type)}>
            {CABIN_TYPES.find(t => t.value === cabin.type)?.label || cabin.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 line-clamp-2">{cabin.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              <span>Up to {cabin.capacity} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-green-600">${cabin.pricePerNight}</span>
              <span>/night</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {cabin.hasWifi && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getFeatureIcon('hasWifi')}
                <span>WiFi</span>
              </div>
            )}
            {cabin.hasTV && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getFeatureIcon('hasTV')}
                <span>TV</span>
              </div>
            )}
            {cabin.hasAirConditioning && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getFeatureIcon('hasAirConditioning')}
                <span>A/C</span>
              </div>
            )}
            {cabin.hasPrivateBathroom && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getFeatureIcon('hasPrivateBathroom')}
                <span>Private Bath</span>
              </div>
            )}
            {cabin.hasRefrigerator && (
              <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                {getFeatureIcon('hasRefrigerator')}
                <span>Fridge</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {cabin.amenities && cabin.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cabin.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {cabin.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{cabin.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Link href={`/cabins/${cabin.id}`} className="flex-1">
            <Button className="w-full">View Details</Button>
          </Link>
          <Link href={`/cabins/${cabin.id}/book`} className="flex-1">
            <Button variant="outline" className="w-full">Book Now</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

function FilterSidebar({ filters, onFiltersChange, onSearch, isSearching }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleDateSearch = () => {
    if (!filters.checkInDate || !filters.checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }
    onSearch();
  };

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      minPrice: '',
      maxPrice: '',
      capacity: '',
      checkInDate: '',
      checkOutDate: '',
      amenities: []
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Filter Cabins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Check Availability</Label>
          <div className="space-y-2">
            <div>
              <Label htmlFor="checkIn" className="text-xs text-gray-600">Check-in Date</Label>
              <Input
                id="checkIn"
                type="date"
                value={filters.checkInDate}
                onChange={(e) => handleFilterChange('checkInDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label htmlFor="checkOut" className="text-xs text-gray-600">Check-out Date</Label>
              <Input
                id="checkOut"
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => handleFilterChange('checkOutDate', e.target.value)}
                min={filters.checkInDate || new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button 
              onClick={handleDateSearch} 
              className="w-full" 
              size="sm"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search Available'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Cabin Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Cabin Type</Label>
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CABIN_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Price Range (per night)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Minimum Capacity</Label>
          <Select value={filters.capacity} onValueChange={(value) => handleFilterChange('capacity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any capacity</SelectItem>
              <SelectItem value="1">1+ guests</SelectItem>
              <SelectItem value="2">2+ guests</SelectItem>
              <SelectItem value="3">3+ guests</SelectItem>
              <SelectItem value="4">4+ guests</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amenities */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Amenities</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {AMENITIES.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={(e) => {
                    const newAmenities = e.target.checked
                      ? [...filters.amenities, amenity]
                      : filters.amenities.filter(a => a !== amenity);
                    handleFilterChange('amenities', newAmenities);
                  }}
                  className="rounded"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <Button variant="outline" onClick={clearFilters} className="w-full" size="sm">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CabinsPage() {
  const [cabins, setCabins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    minPrice: '',
    maxPrice: '',
    capacity: 'all',
    checkInDate: '',
    checkOutDate: '',
    amenities: []
  });

  // Load all cabins initially
  useEffect(() => {
    loadCabins();
  }, []);

  // Apply filters when they change (except date filters)
  useEffect(() => {
    if (!searchMode) {
      loadCabins();
    }
  }, [filters.type, filters.minPrice, filters.maxPrice, filters.capacity, filters.amenities, searchMode]);

  const loadCabins = async () => {
    try {
      setLoading(true);
      const filterParams = {
        type: filters.type && filters.type !== 'all' ? filters.type : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        capacity: filters.capacity && filters.capacity !== 'all' ? filters.capacity : undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined
      };

      const result = await getCabins(filterParams);
      if (result.success) {
        setCabins(result.cabins);
      } else {
        toast.error(result.error || 'Failed to load cabins');
      }
    } catch (error) {
      console.error('Error loading cabins:', error);
      toast.error('Failed to load cabins');
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableCabins = async () => {
    if (!filters.checkInDate || !filters.checkOutDate) {
      toast.error('Please select both check-in and check-out dates');
      return;
    }

    try {
      setIsSearching(true);
      const filterParams = {
        type: filters.type && filters.type !== 'all' ? filters.type : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        capacity: filters.capacity && filters.capacity !== 'all' ? filters.capacity : undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined
      };

      const result = await getAvailableCabins(filters.checkInDate, filters.checkOutDate, filterParams);
      if (result.success) {
        setCabins(result.cabins);
        setSearchMode(true);
        toast.success(`Found ${result.cabins.length} available cabins`);
      } else {
        toast.error(result.error || 'Failed to search available cabins');
      }
    } catch (error) {
      console.error('Error searching cabins:', error);
      toast.error('Failed to search available cabins');
    } finally {
      setIsSearching(false);
    }
  };

  const resetToAllCabins = () => {
    setSearchMode(false);
    setFilters(prev => ({ ...prev, checkInDate: '', checkOutDate: '' }));
    loadCabins();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hospital Cabins</h1>
        <p className="text-gray-600">
          {searchMode 
            ? `Available cabins from ${filters.checkInDate} to ${filters.checkOutDate}`
            : 'Browse our comfortable and well-equipped hospital cabins'
          }
        </p>
        {searchMode && (
          <Button variant="outline" onClick={resetToAllCabins} className="mt-2">
            View All Cabins
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar 
            filters={filters} 
            onFiltersChange={setFilters}
            onSearch={searchAvailableCabins}
            isSearching={isSearching}
          />
        </div>

        {/* Cabins Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cabins.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchMode ? 'No available cabins found' : 'No cabins found'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchMode 
                  ? 'Try adjusting your dates or filters to find available cabins.'
                  : 'Try adjusting your filters or check back later.'
                }
              </p>
              {searchMode && (
                <Button onClick={resetToAllCabins}>
                  View All Cabins
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {cabins.map((cabin) => (
                <CabinCard key={cabin.id} cabin={cabin} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}