"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Bed,
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
  Package,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import CustomUserButton from "./custom-user-button";
import { Badge } from "./ui/badge";
import Image from "next/image";
import MobileNav from "./mobile-nav";

export default function Header() {
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (clerkUser) {
      // Fetch user data from your database
      fetch('/api/debug-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clerkUserId: clerkUser.id })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('API Response:', data);
          if (data.user) {
            console.log('User role:', data.user.role);
            setUser(data.user);
          } else if (data.error) {
            console.error('API Error:', data.error);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
        });
    } else {
      // Reset user state when clerkUser is null
      setUser(null);
    }
  }, [clerkUser]);

  return (
    <header className="fixed top-0 w-full border-b bg-primary z-[60]">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center md:w-1/4">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/logo-single.png"
              alt="Medimeet Logo"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
        </div>
        
        {/* Navigation Links - Centered */}
        <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
          <Link href="/" className="text-gray-900 hover:text-gray-700 font-medium">
            Home
          </Link>
          <Link href="/about" className="text-gray-900 hover:text-gray-700 font-medium">
            About us
          </Link>
          <Link href="/shop" className="text-gray-900 hover:text-gray-700 font-medium">
            Phirmacy
          </Link>
          <Link href="/cabins" className="text-gray-900 hover:text-gray-700 font-medium">
            Cabins
          </Link>
          <Link href="/services" className="text-gray-900 hover:text-gray-700 font-medium">
            Services
          </Link>
          <Link href="/contact" className="text-gray-900 hover:text-gray-700 font-medium">
            Contact us
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            {/* Admin Links */}
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Doctor Links */}
            {user?.role === "DOCTOR" && (
              <Link href="/doctor">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Patient Links */}
            {user?.role === "PATIENT" && (
              <>
                <Link href="/doctors">
                  <Button
                    variant="outline"
                    className="inline-flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Appointment
                  </Button>
                </Link>
              </>
            )}            
            {/* Unassigned Role */}
            {user?.role === "UNASSIGNED" && (
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </SignedIn>          

          <SignedOut>
            <div className="flex items-center space-x-2">
              <Link href="/doctors">
                <Button variant="primary" className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
              <SignInButton>
                <Button variant="secondary">Sign In</Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <CustomUserButton user={user} />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
