"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Bed, MapPin, Users, DollarSign, Calendar, Eye } from "lucide-react";
import { getCabins, createCabin, updateCabin, deleteCabin } from "@/actions/cabins";
import { getAllCabinBookings, updateCabinBookingStatus, getCabinBookingStats } from "@/actions/cabin-bookings";
import { getAllCabinAvailabilities, createCabinAvailability, updateCabinAvailability, deleteCabinAvailability } from "@/actions/cabin-availability";
import { toast } from "sonner";

const CABIN_TYPES = [
  { value: "STANDARD", label: "Standard" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "SUITE", label: "Suite" },
  { value: "VIP", label: "VIP" },
  { value: "ICU", label: "ICU" },
  { value: "PRIVATE", label: "Private" }
];

const BOOKING_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "CHECKED_IN", label: "Checked In", color: "bg-blue-100 text-blue-800" },
  { value: "CHECKED_OUT", label: "Checked Out", color: "bg-gray-100 text-gray-800" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800" }
];

function CabinForm({ cabin, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: cabin?.name || "",
    type: cabin?.type || "STANDARD",
    description: cabin?.description || "",
    capacity: cabin?.capacity || 1,
    pricePerNight: cabin?.pricePerNight || 0,
    amenities: cabin?.amenities?.join(", ") || "",
    floor: cabin?.floor || "",
    wing: cabin?.wing || "",
    roomNumber: cabin?.roomNumber || "",
    hasPrivateBathroom: cabin?.hasPrivateBathroom ?? false,
    hasAirConditioning: cabin?.hasAirConditioning ?? false,
    hasWifi: cabin?.hasWifi ?? true,
    hasTV: cabin?.hasTV ?? false,
    hasRefrigerator: cabin?.hasRefrigerator ?? false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cabinData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        pricePerNight: parseFloat(formData.pricePerNight),
        amenities: formData.amenities.split(",").map(a => a.trim()).filter(a => a)
      };

      if (cabin) {
        const result = await updateCabin(cabin.id, cabinData);
        if (result.success) {
          toast.success("Cabin updated successfully");
          onSubmit();
        } else {
          toast.error(result.error || "Failed to update cabin");
        }
      } else {
        const result = await createCabin(cabinData);
        if (result.success) {
          toast.success("Cabin created successfully");
          onSubmit();
        } else {
          toast.error(result.error || "Failed to create cabin");
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to save cabin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Cabin Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CABIN_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="pricePerNight">Price per Night ($)</Label>
        <Input
          id="pricePerNight"
          type="number"
          min="0"
          step="0.01"
          value={formData.pricePerNight}
          onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            placeholder="1st Floor"
          />
        </div>
        <div>
          <Label htmlFor="wing">Wing</Label>
          <Input
            id="wing"
            value={formData.wing}
            onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
            placeholder="East Wing"
          />
        </div>
        <div>
          <Label htmlFor="roomNumber">Room Number</Label>
          <Input
            id="roomNumber"
            value={formData.roomNumber}
            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            placeholder="101"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="amenities">Amenities (comma-separated)</Label>
        <Input
          id="amenities"
          value={formData.amenities}
          onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
          placeholder="WiFi, Room service, Laundry"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Room Features</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasPrivateBathroom"
              checked={formData.hasPrivateBathroom}
              onChange={(e) => setFormData({ ...formData, hasPrivateBathroom: e.target.checked })}
            />
            <Label htmlFor="hasPrivateBathroom">Private Bathroom</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasAirConditioning"
              checked={formData.hasAirConditioning}
              onChange={(e) => setFormData({ ...formData, hasAirConditioning: e.target.checked })}
            />
            <Label htmlFor="hasAirConditioning">Air Conditioning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasWifi"
              checked={formData.hasWifi}
              onChange={(e) => setFormData({ ...formData, hasWifi: e.target.checked })}
            />
            <Label htmlFor="hasWifi">WiFi</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasTV"
              checked={formData.hasTV}
              onChange={(e) => setFormData({ ...formData, hasTV: e.target.checked })}
            />
            <Label htmlFor="hasTV">Television</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasRefrigerator"
              checked={formData.hasRefrigerator}
              onChange={(e) => setFormData({ ...formData, hasRefrigerator: e.target.checked })}
            />
            <Label htmlFor="hasRefrigerator">Refrigerator</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : cabin ? "Update Cabin" : "Create Cabin"}
        </Button>
      </div>
    </form>
  );
}

function CabinCard({ cabin, onEdit, onDelete }) {
  const features = [];
  if (cabin.hasPrivateBathroom) features.push("Private Bathroom");
  if (cabin.hasAirConditioning) features.push("Air Conditioning");
  if (cabin.hasWifi) features.push("WiFi");
  if (cabin.hasTV) features.push("Television");
  if (cabin.hasRefrigerator) features.push("Refrigerator");

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              {cabin.name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {cabin.capacity} guests
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${cabin.pricePerNight}/night
              </span>
            </div>
            {(cabin.floor || cabin.wing || cabin.roomNumber) && (
              <div className="mt-2 text-xs text-muted-foreground">
                {[cabin.floor, cabin.wing, cabin.roomNumber].filter(Boolean).join(' • ')}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{cabin.type}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{cabin.description}</p>
        
        {features.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cabin.amenities?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Amenities:</h4>
            <div className="flex flex-wrap gap-1">
              {cabin.amenities.map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(cabin)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Cabin</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{cabin.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(cabin.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function AvailabilityForm({ availability, cabins, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cabinId: availability?.cabinId || "",
    startDate: availability?.startDate ? new Date(availability.startDate).toISOString().split('T')[0] : "",
    endDate: availability?.endDate ? new Date(availability.endDate).toISOString().split('T')[0] : "",
    reason: availability?.reason || "",
    isActive: availability?.isActive ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cabinId || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setLoading(true);
      const availabilityData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      if (availability) {
        await updateCabinAvailability(availability.id, availabilityData);
        toast.success("Availability period updated successfully");
      } else {
        await createCabinAvailability(availabilityData);
        toast.success("Availability period created successfully");
      }
      onSubmit();
    } catch (error) {
      toast.error(error.message || "Failed to save availability period");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="cabinId">Cabin *</Label>
          <Select
            value={formData.cabinId}
            onValueChange={(value) => setFormData({ ...formData, cabinId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a cabin" />
            </SelectTrigger>
            <SelectContent>
              {cabins.map((cabin) => (
                <SelectItem key={cabin.id} value={cabin.id}>
                  {cabin.name} ({cabin.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Reason (Optional)</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Reason for this availability period..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : availability ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

function AvailabilityCard({ availability, onEdit, onDelete }) {
  const cabin = availability.cabin;
  const startDate = new Date(availability.startDate).toLocaleDateString();
  const endDate = new Date(availability.endDate).toLocaleDateString();
  const isActive = availability.isActive;
  const isExpired = new Date(availability.endDate) < new Date();

  return (
    <Card className={`${!isActive ? 'opacity-60' : ''} ${isExpired ? 'border-gray-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold">{cabin?.name || 'Unknown Cabin'}</h4>
              <Badge variant={cabin?.type === 'VIP' ? 'default' : 'secondary'}>
                {cabin?.type || 'Unknown'}
              </Badge>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              {isExpired && (
                <Badge variant="outline" className="text-gray-500">
                  Expired
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{startDate} - {endDate}</span>
              </div>

            </div>

            {availability.reason && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Reason:</strong> {availability.reason}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(availability)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Availability Period</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this availability period for {cabin?.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(availability.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingCard({ booking, onUpdateStatus }) {
  const status = BOOKING_STATUSES.find(s => s.value === booking.status);
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{booking.cabin.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {booking.user.firstName} {booking.user.lastName} • {booking.user.email}
            </p>
          </div>
          <Badge className={status?.color}>{status?.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Check-in</p>
            <p className="text-sm text-muted-foreground">
              {checkIn.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Check-out</p>
            <p className="text-sm text-muted-foreground">
              {checkOut.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Duration</p>
            <p className="text-sm text-muted-foreground">{nights} nights</p>
          </div>
          <div>
            <p className="text-sm font-medium">Total Amount</p>
            <p className="text-sm font-semibold">${booking.totalAmount}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Booked on {new Date(booking.createdAt).toLocaleDateString()}
          </div>
          <div className="flex space-x-2">
            {booking.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                >
                  Cancel
                </Button>
              </>
            )}
            {booking.status === "CONFIRMED" && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(booking.id, "CHECKED_IN")}
              >
                Check In
              </Button>
            )}
            {booking.status === "CHECKED_IN" && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(booking.id, "CHECKED_OUT")}
              >
                Check Out
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminCabins() {
  const [cabins, setCabins] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCabin, setEditingCabin] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [activeTab, setActiveTab] = useState("cabins");

  const loadData = async () => {
    try {
      setLoading(true);
      const [cabinsData, bookingsData, statsData, availabilitiesData] = await Promise.all([
        getCabins(),
        getAllCabinBookings(),
        getCabinBookingStats(),
        getAllCabinAvailabilities()
      ]);
      
      setCabins(cabinsData.cabins || []);
      setBookings(bookingsData.bookings || []);
      setStats(statsData.stats || {});
      setAvailabilities(availabilitiesData.availabilities || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCabin = () => {
    setShowCreateDialog(false);
    loadData();
  };

  const handleEditCabin = (cabin) => {
    setEditingCabin(cabin);
  };

  const handleUpdateCabin = () => {
    setEditingCabin(null);
    loadData();
  };

  const handleDeleteCabin = async (cabinId) => {
    try {
      await deleteCabin(cabinId);
      toast.success("Cabin deleted successfully");
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete cabin");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await updateCabinBookingStatus(bookingId, status);
      toast.success("Booking status updated successfully");
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to update booking status");
    }
  };

  const handleCreateAvailability = () => {
    setShowAvailabilityDialog(false);
    loadData();
  };

  const handleEditAvailability = (availability) => {
    setEditingAvailability(availability);
  };

  const handleUpdateAvailability = () => {
    setEditingAvailability(null);
    loadData();
  };

  const handleDeleteAvailability = async (availabilityId) => {
    try {
      await deleteCabinAvailability(availabilityId);
      toast.success("Availability period deleted successfully");
      loadData();
    } catch (error) {
      toast.error(error.message || "Failed to delete availability period");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cabin management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Cabins</p>
                  <p className="text-2xl font-bold">{stats.totalCabins || 0}</p>
                </div>
                <Bed className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                  <p className="text-2xl font-bold">{stats.activeBookings || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">${stats.monthlyRevenue || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{stats.occupancyRate || 0}%</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Cabins and Bookings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cabins">Cabins ({cabins.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="availability">Availability ({availabilities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="cabins" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cabin Management</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cabin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Cabin</DialogTitle>
                </DialogHeader>
                <CabinForm
                  onSubmit={handleCreateCabin}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cabins.map((cabin) => (
              <CabinCard
                key={cabin.id}
                cabin={cabin}
                onEdit={handleEditCabin}
                onDelete={handleDeleteCabin}
              />
            ))}
          </div>

          {cabins.length === 0 && (
            <div className="text-center py-8">
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cabins found. Create your first cabin to get started.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <h3 className="text-lg font-semibold">Booking Management</h3>
          
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onUpdateStatus={handleUpdateBookingStatus}
              />
            ))}
          </div>

          {bookings.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Availability Management</h3>
            <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability Period
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Availability Period</DialogTitle>
                </DialogHeader>
                <AvailabilityForm
                  cabins={cabins}
                  onSubmit={handleCreateAvailability}
                  onCancel={() => setShowAvailabilityDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {availabilities.map((availability) => (
              <AvailabilityCard
                key={availability.id}
                availability={availability}
                onEdit={handleEditAvailability}
                onDelete={handleDeleteAvailability}
              />
            ))}
          </div>

          {availabilities.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No availability periods found. Create availability periods to control when cabins can be booked.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Cabin Dialog */}
      <Dialog open={!!editingCabin} onOpenChange={() => setEditingCabin(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cabin</DialogTitle>
          </DialogHeader>
          {editingCabin && (
            <CabinForm
              cabin={editingCabin}
              onSubmit={handleUpdateCabin}
              onCancel={() => setEditingCabin(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Availability Dialog */}
      <Dialog open={!!editingAvailability} onOpenChange={() => setEditingAvailability(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Availability Period</DialogTitle>
          </DialogHeader>
          {editingAvailability && (
            <AvailabilityForm
              availability={editingAvailability}
              cabins={cabins}
              onSubmit={handleUpdateAvailability}
              onCancel={() => setEditingAvailability(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}