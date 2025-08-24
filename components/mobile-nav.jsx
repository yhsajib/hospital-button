'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Menu, X, Calendar, Bed } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        className="w-10 h-10 p-0" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-primary border-b border-gray-700 py-4 px-4 flex flex-col space-y-4 z-50">
          <Link 
            href="/(main)/appointments/book" 
            className="py-2"
            onClick={() => setIsOpen(false)}
          >
            <Button variant="primary" className="w-full items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
          <Link 
            href="/" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/(main)/about" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            About us
          </Link>
          <Link 
            href="/shop" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Phirmacy
          </Link>
          <Link 
            href="/orders" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Orders
          </Link>
          <Link 
            href="/cabins" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Cabins
          </Link>
          <Link 
            href="/(main)/services" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Services
          </Link>
          <Link 
            href="/(main)/contact" 
            className="text-gray-900 hover:text-gray-700 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Contact us
          </Link>
        </div>
      )}
    </div>
  );
}