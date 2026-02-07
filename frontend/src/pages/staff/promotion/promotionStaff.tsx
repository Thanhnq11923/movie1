"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import SidebarStaff from "../../../components/Staff/sidebar/sidebar";
import HeaderStaff from "../../../components/Staff/header/header";
import PromotionManagement from "../../../components/Staff/promotion/promotion-management";

const PromotionStaff: React.FC = () => {
  const [activeItem, setActiveItem] = useState("promotion");
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Automatically hide sidebar on mobile, open on desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);

    // Automatically close sidebar on mobile after navigation
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 w-full">
      {/* Sidebar */}
      <SidebarStaff
        activeItem={activeItem}
        onItemClick={handleItemClick}
        isOpen={isOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <HeaderStaff
          title="Promotion"
          toggleSidebar={toggleSidebar}
          userName="Cinema Staff"
          userRole="Staff"
          isSidebarOpen={isOpen}
        />

        {/* Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 pt-4 sm:pt-6 overflow-y-auto">
          <PromotionManagement />
        </main>
      </div>

      {/* Mobile Overlay - displayed when sidebar is open on mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
};

export default PromotionStaff;
