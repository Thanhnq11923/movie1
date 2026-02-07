"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Dashboard from "../../../components/admin/dashboard/dashboard";
import Sidebar from "../../../components/admin/sidebar/sidebar";
import Header from "../../../components/admin/header/header";

const HomeAdmin: React.FC = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
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
        `Screen width: ${window.innerWidth}, isMobile: ${mobile}, isOpen: ${
          mobile ? false : true
        }`
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
    setActiveItem(itemId);
    console.log(`Clicked on: ${itemId}`);
    // Tự động đóng sidebar trên mobile sau khi navigate
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleSidebar = () => {
    console.log(`Toggling sidebar: ${isOpen} -> ${!isOpen}`);
    setIsOpen(!isOpen);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      overview: "Overview",
      account: "Account Management",
      ticket: "Ticket Management",
      booking: "Booking Management",
      employee: "Employee Management",
      room: "Room Management",
      movie: "Movie Management",
      promotion: "Promotion Management",
      feedback: "Feedback Management",
      concession: "Concession Management",
      point: "Point Management",
      reports: "Reports",
      notifications: "Notifications",
      settings: "Settings",
    };
    return titles[activeItem] || "Dashboard";
  };

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
      case "overview":
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 w-full">
      {/* Sidebar */}
      <Sidebar
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
        <Header
          title={getPageTitle()}
          toggleSidebar={toggleSidebar}
          userName="Cinema Admin"
          userRole="Admin"
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
            console.log("Overlay clicked - closing sidebar");
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default HomeAdmin;
