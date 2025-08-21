import React from 'react';
import { Metadata } from 'next';
import { Calendar, Video, MessageSquare, Stethoscope, Clock, CreditCard } from 'lucide-react';

export const metadata = {
  title: 'Our Services | Medimeet',
  description: 'Explore the healthcare services offered by Medimeet',
};

export default function ServicesPage() {
  const services = [
    {
      title: 'Video Consultations',
      description: 'Connect with healthcare professionals through secure video calls for diagnosis, treatment plans, and follow-ups.',
      icon: <Video className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Appointment Scheduling',
      description: 'Book appointments with doctors at your convenience using our easy-to-use scheduling system.',
      icon: <Calendar className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Chat Consultations',
      description: 'Get medical advice through text-based consultations for non-emergency health concerns.',
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Specialist Referrals',
      description: 'Get connected with specialists based on your health needs and receive comprehensive care.',
      icon: <Stethoscope className="h-10 w-10 text-primary" />,
    },
    {
      title: '24/7 Support',
      description: 'Access medical support at any time with our round-the-clock service for urgent health concerns.',
      icon: <Clock className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Flexible Payment Options',
      description: 'Choose from various payment plans and options that suit your budget and healthcare needs.',
      icon: <CreditCard className="h-10 w-10 text-primary" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-24 max-w-6xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Our Services</h1>
      <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
        Medimeet offers a range of healthcare services designed to make medical care accessible, convenient, and personalized to your needs.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="mb-4">{service.icon}</div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">{service.title}</h2>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-primary/5 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-medium mb-2">Create an Account</h3>
            <p className="text-gray-600 text-sm">Sign up and complete your profile with your medical history and preferences.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-medium mb-2">Book an Appointment</h3>
            <p className="text-gray-600 text-sm">Choose a doctor and schedule a consultation at your preferred time.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-medium mb-2">Receive Care</h3>
            <p className="text-gray-600 text-sm">Connect with your doctor through video call and get the care you need.</p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">Book your first appointment today and experience healthcare reimagined.</p>
        <a href="/(main)/appointments/book" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
          <Calendar className="h-5 w-5" />
          Book an Appointment
        </a>
      </div>
    </div>
  );
}