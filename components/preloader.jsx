'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

const Preloader = ({ isLoading = true, children }) => {
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Loading...</h3>
            <p className="text-sm text-gray-600">Please wait while we prepare your content</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default Preloader;

// Alternative minimal preloader component
export const MinimalPreloader = ({ isLoading = true }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 border-3 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        <span className="text-lg font-medium text-gray-700">Loading...</span>
      </div>
    </div>
  );
};

// Skeleton preloader for content areas
export const SkeletonPreloader = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};