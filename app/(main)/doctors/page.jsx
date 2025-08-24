"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/specialities";
import { BodyPartSelector } from "@/components/body-part-selector";
import { getDoctorsBySpecialty } from "@/actions/doctors-listing";

export default function DoctorsPage() {
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const filteredSpecialties = selectedSpecialties.length > 0
    ? SPECIALTIES.filter(specialty => selectedSpecialties.includes(specialty.name))
    : [];

  const handleSpecialtyClick = async (specialtyName) => {
    setSelectedSpecialty(specialtyName);
    setLoadingDoctors(true);
    
    try {
      const result = await getDoctorsBySpecialty(specialtyName);
      if (result.doctors) {
        setDoctors(result.doctors);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Doctor</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Click on a body part below to find specialized doctors for that area
          </p>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column - Body Part Selector */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                  Select Body Part
                </h2>
                <div className="flex justify-center">
                  <div className="transform scale-110">
                    <BodyPartSelector 
                      onSelectSpecialties={setSelectedSpecialties}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Available Specialties */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 min-h-[600px]">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Available Specialists
              </h2>
              
              {selectedSpecialties.length > 0 ? (
                <div>
                  <div className="mb-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Showing specialists for: <span className="font-medium text-emerald-600">{selectedSpecialties.join(", ")}</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {filteredSpecialties.map((specialty) => (
                      <Card 
                        key={specialty.name} 
                        className={`hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 bg-white group ${
                          selectedSpecialty === specialty.name ? 'border-emerald-500 shadow-lg bg-emerald-50' : ''
                        }`}
                        onClick={() => handleSpecialtyClick(specialty.name)}
                      >
                        <CardContent className="p-4 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center group-hover:from-emerald-200 group-hover:to-blue-200 transition-all duration-300">
                            <div className="text-lg text-emerald-600 group-hover:scale-110 transition-transform duration-300">{specialty.icon}</div>
                          </div>
                          <h3 className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 text-sm flex-1">{specialty.name}</h3>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Body Part</h3>
                  <p className="text-gray-500 text-center text-sm">
                    Click on any part of the human anatomy to see available specialists.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Available Doctors */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 min-h-[600px]">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Available Doctors
              </h2>
              
              {selectedSpecialty ? (
                <div>
                  <div className="mb-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Doctors in: <span className="font-medium text-emerald-600">{selectedSpecialty}</span>
                    </p>
                  </div>
                  
                  {loadingDoctors ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                      <p className="text-gray-500 text-sm">Loading doctors...</p>
                    </div>
                  ) : doctors.length > 0 ? (
                    <div className="space-y-4">
                      {doctors.map((doctor) => (
                        <Card key={doctor.id} className="hover:border-emerald-500 hover:shadow-lg transition-all duration-300 border-gray-200 bg-white">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">
                                  Dr. {doctor.name}
                                </h3>
                                <p className="text-gray-500 text-xs">{doctor.specialty}</p>
                                {doctor.experience && (
                                  <p className="text-gray-400 text-xs">{doctor.experience} years experience</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Link href={`/doctors/${doctor.specialty}/${doctor.id}`} className="flex-1">
                                <button className="w-full px-3 py-2 text-xs border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  View Profile
                                </button>
                              </Link>
                              <Link href={`/doctors/${doctor.specialty}/${doctor.id}?book=true`} className="flex-1">
                                <button className="w-full px-3 py-2 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded-md transition-colors flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4" />
                                  </svg>
                                  Book Now
                                </button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Doctors Found</h3>
                      <p className="text-gray-500 text-center text-sm">
                        No doctors available for this specialty at the moment.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Specialty</h3>
                  <p className="text-gray-500 text-center text-sm">
                    Click on a specialty to see available doctors.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
