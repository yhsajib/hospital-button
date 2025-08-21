"use client";

import { useState } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/specialities";
import { BodyPartSelector } from "@/components/body-part-selector";

export default function DoctorsPage() {
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  const filteredSpecialties = selectedSpecialties.length > 0
    ? SPECIALTIES.filter(specialty => selectedSpecialties.includes(specialty.name))
    : SPECIALTIES;

  return (
    <div className="container mx-auto px-4 bg-gray-50 min-h-screen py-8">
      <div className="flex flex-col items-center justify-center mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
        <p className="text-gray-600 text-lg mb-8">
          Select a body part or browse all specialties
        </p>
        
        <div className="w-full max-w-2xl mb-12">
          <BodyPartSelector 
            onSelectSpecialties={setSelectedSpecialties}
          />
        </div>

        {selectedSpecialties.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Available Specialists
            </h2>
            <p className="text-gray-600">
              Showing doctors for: {selectedSpecialties.join(", ")}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSpecialties.map((specialty) => (
          <Link key={specialty.name} href={`/doctors/${specialty.name}`}>
            <Card className="hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer border-gray-200 bg-white h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <div className="text-emerald-600">{specialty.icon}</div>
                </div>
                <h3 className="font-medium text-gray-800">{specialty.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
