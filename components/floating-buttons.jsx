'use client';

import { Phone, Bell } from 'lucide-react';

export function FloatingButtons() {
  const handlePhoneClick = () => {
    window.open('tel:+1234567890', '_self');
  };

  const handleNotificationClick = () => {
    alert('Notifications feature coming soon!');
  };

  return (
    <div className="fixed right-6 bottom-20 z-50 flex flex-col gap-4">
      {/* Phone Button */}
      <button 
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        onClick={handlePhoneClick}
        title="Call Us"
        aria-label="Call Us"
      >
        <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
      
      {/* Notification Button */}
      <button 
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group relative"
        onClick={handleNotificationClick}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          3
        </span>
      </button>
    </div>
  );
}