'use client';

import React from "react";
import Preloader from '@/components/preloader';
import { useLoading } from '@/hooks/use-loading';

const MainLayout = ({ children }) => {
  const { isLoading } = useLoading(1000); // 1 second loading delay

  return (
    <>
      <Preloader isLoading={isLoading}>
        <div className="container mx-auto my-20">{children}</div>
      </Preloader>
    </>
  );
};

export default MainLayout;
