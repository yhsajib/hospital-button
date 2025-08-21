import React from 'react';
import { Metadata } from 'next';

export const metadata = {
  title: 'About Us | Medimeet',
  description: 'Learn more about Medimeet - Your trusted healthcare platform',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-5xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">About Medimeet</h1>
      
      <div className="space-y-8">
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            At Medimeet, our mission is to make healthcare accessible to everyone through innovative technology. 
            We believe that quality healthcare should be available to all, regardless of location or circumstances. 
            Our platform connects patients with qualified healthcare professionals for virtual consultations, 
            making it easier than ever to receive medical advice and care from the comfort of your home.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Medimeet was founded in 2023 by a team of healthcare professionals and technology experts who recognized 
            the need for more accessible healthcare solutions. What started as a small telemedicine service has grown 
            into a comprehensive platform that serves thousands of patients and doctors across the country.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our journey has been driven by a commitment to innovation, quality, and patient-centered care. 
            We continuously work to improve our platform based on feedback from both patients and healthcare providers, 
            ensuring that Medimeet remains at the forefront of digital healthcare solutions.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">Accessibility</h3>
              <p className="text-gray-700">Making healthcare available to everyone, everywhere.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">Quality</h3>
              <p className="text-gray-700">Ensuring the highest standards of medical care and service.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">Innovation</h3>
              <p className="text-gray-700">Continuously improving our technology and services.</p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-gray-800">Privacy</h3>
              <p className="text-gray-700">Protecting patient data and maintaining confidentiality.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Team</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Medimeet is powered by a dedicated team of healthcare professionals, technology experts, and customer support specialists. 
            Our diverse team brings together expertise from various fields to create a platform that addresses the complex needs of modern healthcare.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <h3 className="font-medium">Dr. Sarah Johnson</h3>
              <p className="text-sm text-gray-600">Chief Medical Officer</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <h3 className="font-medium">Michael Chen</h3>
              <p className="text-sm text-gray-600">Chief Technology Officer</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <h3 className="font-medium">Emily Rodriguez</h3>
              <p className="text-sm text-gray-600">Head of Patient Relations</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}