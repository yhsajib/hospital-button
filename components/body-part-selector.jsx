'use client';

import { useState } from 'react';
import HumanAnatomy from './human-anatomy';

export function BodyPartSelector({ onSelectSpecialties }) {
  const [hoveredPart, setHoveredPart] = useState(null);

  const bodyPartToSpecialty = {
    'head': ['Neurology', 'Neurosurgery', 'Psychiatry'],
    'eyes': ['Ophthalmology', 'Optometry'],
    'ears': ['ENT', 'Audiology'],
    'nose': ['ENT', 'Allergy & Immunology'],
    'mouth': ['Dentistry', 'Oral Surgery'],
    'neck': ['ENT', 'Orthopedics'],
    'torso': ['General Surgery', 'Internal Medicine'],
    'heart': ['Cardiology', 'Cardiac Surgery'],
    'lungs': ['Pulmonology', 'Thoracic Surgery'],
    'liver': ['Gastroenterology', 'Hepatology'],
    'kidneys': ['Nephrology', 'Urology'],
    'stomach': ['Gastroenterology', 'General Surgery'],
    'spine': ['Orthopedics', 'Neurosurgery'],
    'arms': ['Orthopedics', 'Rheumatology'],
    'legs': ['Orthopedics', 'Sports Medicine'],
    'knees': ['Orthopedics', 'Sports Medicine'],
    'lowerLegs': ['Orthopedics', 'Sports Medicine'],
    'ankles': ['Orthopedics', 'Podiatry'],
    'feet': ['Podiatry', 'Orthopedics']
  };

  const handlePartClick = (partName) => {
    const specialties = bodyPartToSpecialty[partName] || [];
    onSelectSpecialties(specialties);
  };

  const handleReset = () => {
    onSelectSpecialties([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Select Body Part
        </h2>
        
        <div className="flex justify-center mb-6">
          <HumanAnatomy 
            onPartClick={handlePartClick}
            onPartHover={setHoveredPart}
            onPartLeave={() => setHoveredPart(null)}
            hoveredPart={hoveredPart}
          />
        </div>

        {hoveredPart && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              {hoveredPart.charAt(0).toUpperCase() + hoveredPart.slice(1)}
            </h3>
            <p className="text-blue-600">
              Related Specialties: {bodyPartToSpecialty[hoveredPart]?.join(', ') || 'General Medicine'}
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Reset Selection
          </button>
        </div>
      </div>
    </div>
  );
}