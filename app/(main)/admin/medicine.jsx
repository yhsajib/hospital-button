"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from "@/actions/admin";
import toast, { Toaster } from 'react-hot-toast';

export default function AdminMedicinePage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", genericName: "", brandName: "", description: "", price: "", stock: "" });
  const [addForm, setAddForm] = useState({ name: "", genericName: "", brandName: "", description: "", price: "", stock: "" });

  // Fetch medicines from database
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const result = await getMedicines();
      setMedicines(result.medicines);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch medicines: ' + err.message);
      console.error('Failed to fetch medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setEditingId(medicine.id);
    setEditForm({ ...medicine });
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSave = async () => {
     if (!editForm.name || !editForm.genericName || !editForm.brandName || !editForm.price || !editForm.stock) {
       toast.error("Please fill in all required fields");
       return;
     }

    try {
      const formData = new FormData();
      formData.append('id', editingId);
      formData.append('name', editForm.name);
      formData.append('genericName', editForm.genericName);
      formData.append('brandName', editForm.brandName);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('stock', editForm.stock);

      await updateMedicine(formData);
      await fetchMedicines(); // Refresh the list
      setEditingId(null);
      toast.success('Medicine updated successfully!');
    } catch (err) {
      toast.error('Failed to update medicine: ' + err.message);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const formData = new FormData();
        formData.append('id', id);
        
        await deleteMedicine(formData);
        await fetchMedicines(); // Refresh the list
        toast.success('Medicine deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete medicine: ' + err.message);
      }
    }
  };
  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };
  const handleAddMedicine = async () => {
    if (!addForm.name || !addForm.genericName || !addForm.brandName || !addForm.price || !addForm.stock) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', addForm.name);
      formData.append('genericName', addForm.genericName);
      formData.append('brandName', addForm.brandName);
      formData.append('description', addForm.description);
      formData.append('price', addForm.price);
      formData.append('stock', addForm.stock);

      await createMedicine(formData);
      await fetchMedicines(); // Refresh the list
      
      setAddForm({ name: "", genericName: "", brandName: "", description: "", price: "", stock: "" });
      toast.success('Medicine added successfully!');
    } catch (err) {
      toast.error('Failed to add medicine: ' + err.message);
    }
  };

  if (loading) {
    return (
      <TabsContent value="medicine" className="border-none p-0">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-white">Loading medicines...</div>
        </div>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="medicine" className="border-none p-0">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-400">Error: {error}</div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="medicine" className="border-none p-0">
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Add New Medicine Card */}
        <Card className="bg-muted/20 border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Add New Medicine
            </CardTitle>
            <CardDescription>
              Add new medicines to the inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <input 
                  name="name" 
                  value={addForm.name} 
                  onChange={handleAddChange} 
                  placeholder="Medicine name" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-40 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                <input 
                  name="genericName" 
                  value={addForm.genericName} 
                  onChange={handleAddChange} 
                  placeholder="Generic name" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-40 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Brand Name</label>
                <input 
                  name="brandName" 
                  value={addForm.brandName} 
                  onChange={handleAddChange} 
                  placeholder="Brand name" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-40 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <input 
                  name="description" 
                  value={addForm.description} 
                  onChange={handleAddChange} 
                  placeholder="Description" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-60 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Price ($)</label>
                <input 
                  name="price" 
                  type="number" 
                  value={addForm.price} 
                  onChange={handleAddChange} 
                  placeholder="0.00" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-24 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Stock</label>
                <input 
                  name="stock" 
                  type="number" 
                  value={addForm.stock} 
                  onChange={handleAddChange} 
                  placeholder="0" 
                  className="border border-emerald-900/30 rounded-md px-3 py-2 w-24 bg-background text-white focus:border-emerald-500 focus:outline-none" 
                />
              </div>
              <Button 
                onClick={handleAddMedicine}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Medicines List Card */}
        <Card className="bg-muted/20 border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-400" />
              Medicine Inventory
            </CardTitle>
            <CardDescription>
              Manage your medicine inventory and stock levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No medicines in inventory at this time.
              </div>
            ) : (
              <div className="space-y-4">
                {medicines.map(medicine => (
                  <Card
                    key={medicine.id}
                    className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <CardContent className="p-4">
                      {editingId === medicine.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Name</label>
                              <input 
                                name="name" 
                                value={editForm.name} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                              <input 
                                name="genericName" 
                                value={editForm.genericName} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Brand Name</label>
                              <input 
                                name="brandName" 
                                value={editForm.brandName} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Description</label>
                              <input 
                                name="description" 
                                value={editForm.description} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Price ($)</label>
                              <input 
                                name="price" 
                                type="number" 
                                value={editForm.price} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Stock</label>
                              <input 
                                name="stock" 
                                type="number" 
                                value={editForm.stock} 
                                onChange={handleEditChange} 
                                className="border border-emerald-900/30 rounded-md px-3 py-2 w-full bg-background text-white focus:border-emerald-500 focus:outline-none" 
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button 
                              onClick={handleEditSave}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setEditingId(null)}
                              className="border-emerald-900/30 hover:bg-muted/80"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted/20 rounded-full p-2">
                              <Pill className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">
                                {medicine.name}
                              </h3>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p><span className="text-emerald-400">Generic:</span> {medicine.genericName}</p>
                                <p><span className="text-emerald-400">Brand:</span> {medicine.brandName}</p>
                                <p>{medicine.description}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-emerald-400 font-medium">
                                  ${medicine.price.toFixed(2)}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    medicine.stock > 20 
                                      ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-400" 
                                      : medicine.stock > 5 
                                      ? "bg-amber-900/20 border-amber-900/30 text-amber-400" 
                                      : "bg-red-900/20 border-red-900/30 text-red-400"
                                  }`}
                                >
                                  Stock: {medicine.stock}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(medicine)}
                              className="border-emerald-900/30 hover:bg-muted/80"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(medicine.id)}
                              className="border-red-900/30 hover:bg-red-900/20 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}