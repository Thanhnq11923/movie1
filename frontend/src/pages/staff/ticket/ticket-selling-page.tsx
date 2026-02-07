"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import SidebarStaff from "../../../components/Staff/sidebar/sidebar";
import HeaderStaff from "../../../components/Staff/header/header";
import TicketSelling from "../../../components/Staff/ticket-selling/ticket-selling";

const TicketStaff: React.FC = () => {
  const [activeItem, setActiveItem] = useState("ticket");
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Tự động ẩn sidebar trên mobile, mặc định mở trên desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }

      console.log(
        `Ticket Staff - Screen width: ${
          window.innerWidth
        }, isMobile: ${mobile}, isOpen: ${mobile ? false : true}`
      );
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (itemId: string) => {
    console.log(
      `Ticket Staff - Clicked on: ${itemId}, current activeItem: ${activeItem}`
    );
    setActiveItem(itemId);

    // Tự động đóng sidebar trên mobile sau khi navigate
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    console.log(`Ticket Staff - Toggling sidebar: ${isOpen} -> ${!isOpen}`);
    setIsOpen(!isOpen);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      ticket: "Ticket Selling",
    };
    return titles[activeItem] || "Ticket Selling";
  };

  const renderContent = () => {
    console.log(
      `Ticket Staff - Rendering content for activeItem: ${activeItem}`
    );
    switch (activeItem) {
      case "ticket":
        return <TicketSelling />;
      // ✅ ADDED: Handle other navigation cases
      case "dashboard":
        console.log("Navigating to dashboard...");
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redirecting to Dashboard...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you.
            </p>
          </div>
        );
      case "booking":
        console.log("Navigating to booking management...");
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Booking Management Module
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              This feature is coming soon...
            </p>
          </div>
        );
      case "members":
      case "Members":
        console.log("Navigating to members management...");
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Members Management Module
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              This feature is coming soon...
            </p>
          </div>
        );
      default:
        return <TicketSelling />;
    }
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
          title={getPageTitle()}
          toggleSidebar={toggleSidebar}
          userName="Cinema Staff" // ✅ FIXED: Changed from "Cinema Admin" to "Cinema Staff"
          userRole="Staff" // ✅ FIXED: Changed from "Admin" to "Staff"
          isSidebarOpen={isOpen}
        />

        {/* Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 pt-4 sm:pt-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay - hiển thị khi sidebar mở trên mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            console.log("Ticket Staff - Overlay clicked - closing sidebar");
            setIsOpen(false);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
};

export default TicketStaff;
