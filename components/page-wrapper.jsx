'use client';

import React, { useState, useEffect } from 'react';
import Preloader, { SkeletonPreloader } from './preloader';
import { useApiLoading } from '@/hooks/use-loading';

const PageWrapper = ({ 
  children, 
  title, 
  description, 
  showSkeleton = false,
  customLoadingTime = 500,
  className = ""
}) => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { isLoading: isApiLoading } = useApiLoading();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, customLoadingTime);

    return () => clearTimeout(timer);
  }, [customLoadingTime]);

  if (isPageLoading || isApiLoading) {
    if (showSkeleton) {
      return (
        <div className={`min-h-screen ${className}`}>
          {title && (
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
              {description && <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>}
            </div>
          )}
          <SkeletonPreloader />
        </div>
      );
    }
    return <Preloader isLoading={true} />;
  }

  return (
    <div className={className}>
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default PageWrapper;

// Higher-order component for wrapping pages
export const withPageLoader = (WrappedComponent, options = {}) => {
  const WithPageLoaderComponent = (props) => {
    return (
      <PageWrapper {...options}>
        <WrappedComponent {...props} />
      </PageWrapper>
    );
  };

  WithPageLoaderComponent.displayName = `withPageLoader(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithPageLoaderComponent;
};