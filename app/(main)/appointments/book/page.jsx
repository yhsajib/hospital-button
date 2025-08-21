"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BodyPartSelector } from "@/components/body-part-selector";
import { SPECIALTIES } from "@/lib/specialities";
import { Calendar, Stethoscope, User, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1); // 1: body part & department, 2: doctor selection

  // Update department selection when body part is selected
  useEffect(() => {
    if (selectedSpecialties.length > 0) {
      // Auto-select the first specialty if only one is available
      if (selectedSpecialties.length === 1) {
        setSelectedDepartment(selectedSpecialties[0]);
      } else {
        // Clear selection if multiple specialties to let user choose
        setSelectedDepartment("");
      }
    }
  }, [selectedSpecialties]);

  const handleContinue = () => {
    if (!selectedDepartment) {
      alert("Please select a department");
      return;
    }
    // Navigate to doctors page with selected specialty
    router.push(`/doctors/${selectedDepartment}`);
  };

  const availableSpecialties = selectedSpecialties.length > 0 
    ? SPECIALTIES.filter(spec => selectedSpecialties.includes(spec.name))
    : SPECIALTIES;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        icon={<Calendar />}
        title="Book an Appointment"
        backLink="/doctors"
        backLabel="Browse Doctors"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step 1: Body Part & Department Selection */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Stethoscope className="h-6 w-6 mr-2 text-emerald-400" />
              Select Body Part & Department
            </CardTitle>
            <CardDescription>
              Choose the body part you need help with, and we'll suggest the right medical department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Body Part Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Step 1: Select Body Part (Optional)</h3>
              <p className="text-muted-foreground text-sm">
                Click on a body part to automatically suggest relevant medical departments
              </p>
              <BodyPartSelector onSelectSpecialties={setSelectedSpecialties} />
            </div>

            {/* Department Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Step 2: Choose Medical Department</h3>
              {selectedSpecialties.length > 0 && (
                <div className="bg-emerald-900/20 border border-emerald-900/30 rounded-lg p-4">
                  <p className="text-emerald-400 text-sm font-medium mb-2">
                    Suggested departments based on your selection:
                  </p>
                  <p className="text-white">
                    {selectedSpecialties.join(", ")}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="department">Medical Department *</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department" className="bg-background border-emerald-900/20">
                    <SelectValue placeholder="Select a medical department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialties.map((specialty) => (
                      <SelectItem key={specialty.name} value={specialty.name}>
                        <div className="flex items-center gap-2">
                          {specialty.icon}
                          {specialty.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Describe your concern (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Please provide any details about your medical concern..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-background border-emerald-900/20 h-24"
              />
              <p className="text-sm text-muted-foreground">
                This information will help doctors understand your needs better
              </p>
            </div>

            {/* Continue Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleContinue}
                disabled={!selectedDepartment}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                Find Doctors in {selectedDepartment || "Selected Department"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-emerald-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-emerald-900/20 rounded-full">
                <User className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">How it works</h4>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>1. Select a body part or choose a department directly</li>
                  <li>2. Browse available doctors in that specialty</li>
                  <li>3. Choose a convenient time slot</li>
                  <li>4. Complete your booking with appointment details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}