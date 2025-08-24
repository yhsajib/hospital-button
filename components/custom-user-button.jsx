"use client";

import { UserButton } from "@clerk/nextjs";
import { Calendar, Bed, User } from "lucide-react";

const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  );
};

export default function CustomUserButton({ user }) {
  console.log('CustomUserButton rendered with user:', user);
  
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
          userButtonPopoverCard: "shadow-xl",
          userPreviewMainIdentifier: "font-semibold",
        },
      }}
      afterSignOutUrl="/"
    >

    {
      user?.role === "PATIENT" && (
        <UserButton.MenuItems>
          <UserButton.Link
            label="My Profile"
            labelIcon={<User size={16} />}
            href="/profile"
          />
          <UserButton.Link
            label="My Orders"
            labelIcon={<DotIcon />}
            href="/orders"
          />
          <UserButton.Link
            label="My Appointments"
            labelIcon={<Calendar size={16} />}
            href="/appointments"
          />
          <UserButton.Link
            label="My Bookings"
            labelIcon={<Bed size={16} />}
            href="/bookings"
          />
        </UserButton.MenuItems>
      )
    }
    </UserButton>
  );
}